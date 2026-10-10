export type AllergyStatus = 'known_allergies' | 'no_known_allergies' | 'unknown';

export interface AllergyRecord {
  id: string;
  allergen: string;
  reportedReaction?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AllergyRecordInput = Omit<AllergyRecord, 'id' | 'createdAt' | 'updatedAt'>;
