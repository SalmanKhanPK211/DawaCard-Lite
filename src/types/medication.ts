export type MedicationStatus = 'current' | 'discontinued';
export type MedicationSource = 'manual' | 'ai-reviewed';

export interface Medication {
  id: string;
  name: string;
  strength?: string;
  dosageForm?: string;
  prescribedInstructions?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  status: MedicationStatus;
  notes?: string;
  source: MedicationSource;
  createdAt: string;
  updatedAt: string;
}

export type MedicationInput = Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>;
