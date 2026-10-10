import { describe, it, expect, vi } from 'vitest';
import { checkAiBackendStatus, extractPrescriptionFromImage } from '../src/services/ai/aiService';

describe('AI Extraction Safety & Resilience', () => {
  it('handles offline or unconfigured backend proxy server gracefully', async () => {
    // Mock fetch to simulate server offline
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    const status = await checkAiBackendStatus();
    expect(status.available).toBe(false);
    expect(status.message).toContain('offline or unavailable');
  });

  it('rejects files larger than 5MB on client-side before upload', async () => {
    // Create fake 6MB file
    const largeFile = new File(['a'.repeat(6 * 1024 * 1024)], 'large_prescription.jpg', {
      type: 'image/jpeg',
    });

    await expect(extractPrescriptionFromImage(largeFile)).rejects.toThrow(
      'Image size exceeds 5 MB'
    );
  });

  it('rejects unsupported file formats', async () => {
    const pdfFile = new File(['pdf content'], 'prescription.pdf', {
      type: 'application/pdf',
    });

    await expect(extractPrescriptionFromImage(pdfFile)).rejects.toThrow(
      'Unsupported image format'
    );
  });
});
