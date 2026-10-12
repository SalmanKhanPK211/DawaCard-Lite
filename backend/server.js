import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

const geminiApiKey = process.env.GEMINI_API_KEY;
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!geminiApiKey,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/extract-prescription', async (req, res) => {
  if (!genAI || !geminiApiKey) {
    return res.status(503).json({
      success: false,
      error: 'AI Proxy Server is running, but GEMINI_API_KEY is not configured in backend environment.',
    });
  }

  const { imageBase64, mimeType } = req.body;

  if (!imageBase64 || !mimeType) {
    return res.status(400).json({
      success: false,
      error: 'Missing imageBase64 or mimeType parameter.',
    });
  }

  try {
    const prompt = `
You are a specialized medical prescription reader assistant tool. Extract visible information from this prescription image into candidate structured fields.

CRITICAL RULES:
1. Do NOT guess, assume, or infer missing instructions or dosages based on common practice.
2. Only extract text that is VISIBLY present in the image.
3. If handwriting is illegible or a field is missing, set value to null and confidence to "uncertain".
4. For each field, assign confidence: "high", "medium", "low", or "uncertain".
5. Do NOT provide medical advice, dose corrections, or drug substitution recommendations.

Output strict JSON matching this exact structure:
{
  "fields": [
    {
      "field": "name",
      "value": "medication name or null",
      "confidence": "high|medium|low|uncertain",
      "supportingText": "verbatim text snippet from image",
      "requiresReview": true
    },
    {
      "field": "strength",
      "value": "strength or null",
      "confidence": "high|medium|low|uncertain",
      "supportingText": "verbatim snippet or null",
      "requiresReview": true
    },
    {
      "field": "dosageForm",
      "value": "tablet/capsule/syrup or null",
      "confidence": "high|medium|low|uncertain",
      "supportingText": "snippet or null",
      "requiresReview": true
    },
    {
      "field": "prescribedInstructions",
      "value": "full dosage instructions or null",
      "confidence": "high|medium|low|uncertain",
      "supportingText": "snippet or null",
      "requiresReview": true
    },
    {
      "field": "route",
      "value": "oral/topical/etc or null",
      "confidence": "high|medium|low|uncertain",
      "supportingText": "snippet or null",
      "requiresReview": true
    },
    {
      "field": "frequency",
      "value": "frequency or null",
      "confidence": "high|medium|low|uncertain",
      "supportingText": "snippet or null",
      "requiresReview": true
    },
    {
      "field": "duration",
      "value": "duration or null",
      "confidence": "high|medium|low|uncertain",
      "supportingText": "snippet or null",
      "requiresReview": true
    },
    {
      "field": "notes",
      "value": "prescriber or additional notes or null",
      "confidence": "high|medium|low|uncertain",
      "supportingText": "snippet or null",
      "requiresReview": true
    }
  ],
  "warnings": ["Array of warning messages if handwriting is difficult or parts are obscure"]
}
`;

    const candidateModels = Array.from(
      new Set(
        [
          process.env.GEMINI_MODEL,
          'gemini-3.8-flash',
          'gemini-3.5-flash',
          'gemini-flash-latest',
        ].filter(Boolean)
      )
    );

    let result = null;
    let lastError = null;

    for (const mName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: mName,
          generationConfig: { responseMimeType: 'application/json' },
        });

        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
        ]);
        if (result) break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${mName} failed (${err.message}), trying next candidate model...`);
      }
    }

    if (!result) {
      throw lastError || new Error('No available Gemini model could process the request.');
    }

    const text = result.response.text();
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    const structuredData = JSON.parse(text);
    return res.json({
      success: true,
      data: structuredData,
    });
  } catch (error) {
    console.error('Backend extraction error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error occurred while communicating with Gemini AI service.',
    });
  }
});

app.post('/api/check-interactions', async (req, res) => {
  if (!genAI || !geminiApiKey) {
    return res.status(503).json({
      success: false,
      error: 'AI Proxy Server is running, but GEMINI_API_KEY is not configured in backend environment.',
    });
  }

  const { medications = [], allergies = [], candidateMedication } = req.body;

  try {
    const prompt = `
You are an expert clinical pharmacologist and patient safety AI assistant for DawaCard Lite.
Analyze the following patient profile for potential drug-drug interactions, drug-allergy contraindications, and food/lifestyle interactions.

Patient Active Medications:
${JSON.stringify(medications, null, 2)}

Patient Recorded Allergies:
${JSON.stringify(allergies, null, 2)}

${candidateMedication ? `Prospective New Medication Being Added:\n${JSON.stringify(candidateMedication, null, 2)}` : ''}

CRITICAL CLINICAL RULES:
1. Examine all pairwise combinations of medications for clinically significant pharmacokinetic or pharmacodynamic interactions (e.g. bleeding risk with anticoagulants/antiplatelets/NSAIDs, hyperkalemia, QT prolongation, serotonin syndrome, CYP3A4 inhibition, chelation).
2. Examine cross-sensitivities between all medications and the patient's recorded allergies (e.g. penicillin cross-reactivity with amoxicillin/augmentin/ampicillin, sulfa allergies, NSAID allergies).
3. If candidateMedication is provided, evaluate its safety specifically in context with the existing regimen.
4. Classify each conflict severity as "critical" (life-threatening/contraindicated), "high" (serious clinical risk/requires intervention), "moderate" (caution/monitoring), or "low" (minor).
5. Provide actionable, patient-friendly yet clinically sound advice and indicate what the patient should discuss with their doctor.
6. Provide specific food and lifestyle warnings (e.g., grapefruit, dairy, alcohol, timing).
7. If the regimen has no significant conflicts, indicate overallRisk as "safe".

Output strict JSON matching this exact structure:
{
  "overallRisk": "safe" | "low" | "moderate" | "high" | "critical",
  "conflicts": [
    {
      "id": "unique-string",
      "type": "drug_drug" | "drug_allergy" | "food_lifestyle",
      "severity": "critical" | "high" | "moderate" | "low",
      "substanceA": "Medication 1",
      "substanceB": "Medication 2 or Allergen",
      "title": "Short descriptive title of interaction",
      "description": "Clear clinical explanation of mechanism and risk",
      "clinicalRecommendation": "Actionable advice for the patient and clinician",
      "references": "Guideline or medical reference"
    }
  ],
  "foodAndLifestyleWarnings": [
    "Warning text for food/drink precautions..."
  ],
  "safeCombinationsNotes": [
    "Positive reassurance notes on combinations that were analyzed and found safe..."
  ]
}
`;

    const candidateModels = Array.from(
      new Set(
        [
          process.env.GEMINI_MODEL,
          'gemini-3.8-flash',
          'gemini-3.5-flash',
          'gemini-flash-latest',
        ].filter(Boolean)
      )
    );

    let result = null;
    let lastError = null;

    for (const mName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: mName,
          generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
        });

        result = await model.generateContent(prompt);
        if (result) break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${mName} failed (${err.message}), trying next candidate model...`);
      }
    }

    if (!result) {
      throw lastError || new Error('No available Gemini model could process the request.');
    }

    const text = result.response.text();
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    const structuredData = JSON.parse(text);
    return res.json({
      success: true,
      data: structuredData,
    });
  } catch (error) {
    console.error('Backend interaction check error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error occurred while analyzing interactions with Gemini AI.',
    });
  }
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`DawaCard Lite AI Proxy Server running on http://localhost:${PORT}`);
  });
}

export default app;
