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

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
    ]);

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

app.listen(PORT, () => {
  console.log(`DawaCard Lite AI Proxy Server running on http://localhost:${PORT}`);
});
