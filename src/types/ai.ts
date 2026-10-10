export type ConfidenceCategory = 'high' | 'medium' | 'low' | 'uncertain';

export interface ExtractedField {
  field: 'name' | 'strength' | 'dosageForm' | 'prescribedInstructions' | 'route' | 'frequency' | 'duration' | 'notes';
  label: string;
  value: string | null;
  confidence: ConfidenceCategory;
  supportingText: string | null;
  requiresReview: boolean;
}

export interface PrescriptionExtractionResult {
  fields: ExtractedField[];
  warnings: string[];
  processedAt: string;
}
