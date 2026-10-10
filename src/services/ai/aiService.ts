import { PrescriptionExtractionResult, ExtractedField } from '../../types/ai';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface ExtractionResponse {
  success: boolean;
  data?: PrescriptionExtractionResult;
  error?: string;
}

export async function checkAiBackendStatus(): Promise<{ available: boolean; message: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (data.geminiConfigured) {
        return { available: true, message: 'AI prescription extraction service is ready.' };
      }
      return { available: false, message: 'Backend is running, but GEMINI_API_KEY is not configured.' };
    }
    return { available: false, message: 'AI backend server is not responding.' };
  } catch {
    return { available: false, message: 'AI backend proxy server is offline or unavailable.' };
  }
}

export async function extractPrescriptionFromImage(file: File): Promise<PrescriptionExtractionResult> {
  // Client-side file size check (5 MB limit)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error('Image size exceeds 5 MB. Please select a smaller image file.');
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    throw new Error('Unsupported image format. Please upload a JPEG, PNG, or WebP image.');
  }

  // Convert image to base64
  const base64Data = await fileToBase64(file);

  try {
    const response = await fetch(`${BACKEND_URL}/api/extract-prescription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: base64Data,
        mimeType: file.type,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `AI processing failed with status ${response.status}`);
    }

    const json = await response.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Invalid response format from AI service.');
    }

    return validateAndFormatExtractionResult(json.data);
  } catch (error: any) {
    console.error('Prescription extraction error:', error);
    throw new Error(error.message || 'Could not connect to the AI extraction backend.');
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 portion
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function validateAndFormatExtractionResult(data: any): PrescriptionExtractionResult {
  const fieldsMap: Record<string, string> = {
    name: 'Medication Name',
    strength: 'Strength',
    dosageForm: 'Dosage Form',
    prescribedInstructions: 'Prescribed Instructions',
    route: 'Route',
    frequency: 'Frequency',
    duration: 'Duration',
    notes: 'Prescriber / Source Notes',
  };

  const validatedFields: ExtractedField[] = Object.keys(fieldsMap).map((fieldName) => {
    const existing = Array.isArray(data.fields)
      ? data.fields.find((f: any) => f.field === fieldName)
      : null;

    if (existing) {
      return {
        field: fieldName as ExtractedField['field'],
        label: fieldsMap[fieldName],
        value: existing.value ? String(existing.value).trim() : null,
        confidence: ['high', 'medium', 'low', 'uncertain'].includes(existing.confidence)
          ? existing.confidence
          : 'uncertain',
        supportingText: existing.supportingText ? String(existing.supportingText).trim() : null,
        requiresReview: existing.requiresReview ?? true,
      };
    }

    return {
      field: fieldName as ExtractedField['field'],
      label: fieldsMap[fieldName],
      value: null,
      confidence: 'uncertain',
      supportingText: null,
      requiresReview: true,
    };
  });

  return {
    fields: validatedFields,
    warnings: Array.isArray(data.warnings) ? data.warnings.map(String) : [],
    processedAt: new Date().toISOString(),
  };
}
