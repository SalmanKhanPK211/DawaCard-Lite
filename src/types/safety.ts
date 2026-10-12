export type ConflictSeverity = 'critical' | 'high' | 'moderate' | 'low';
export type ConflictType = 'drug_drug' | 'drug_allergy' | 'food_lifestyle';

export interface ConflictItem {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  substanceA: string; // e.g. "Aspirin" or "Warfarin"
  substanceB?: string; // e.g. "Warfarin" or "Penicillin Allergy"
  title: string; // Brief descriptive title
  description: string; // Detailed clinical explanation
  clinicalRecommendation: string; // Recommended patient/clinician action
  references?: string; // Guidance reference
}

export interface RegimenSafetyReport {
  overallRisk: 'safe' | 'low' | 'moderate' | 'high' | 'critical';
  totalCheckedMedications: number;
  totalCheckedAllergies: number;
  conflicts: ConflictItem[];
  foodAndLifestyleWarnings: string[];
  safeCombinationsNotes?: string[];
  analyzedAt: string;
  source: 'gemini-ai' | 'clinical-rules' | 'hybrid';
}

export interface CheckConflictsRequest {
  medications: Array<{
    name: string;
    strength?: string;
    dosageForm?: string;
    status?: string;
  }>;
  allergies: Array<{
    allergen: string;
    reportedReaction?: string;
  }>;
  candidateMedication?: {
    name: string;
    strength?: string;
    dosageForm?: string;
  };
}
