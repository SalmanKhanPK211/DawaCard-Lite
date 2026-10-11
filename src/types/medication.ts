export type MedicationStatus = 'current' | 'discontinued';
export type MedicationSource = 'manual' | 'ai-reviewed';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'bedtime' | 'as_needed';

export interface Medication {
  id: string;
  name: string;
  strength?: string;
  dosageForm?: string;
  prescribedInstructions?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  timesOfDay?: TimeOfDay[];
  startDate?: string;
  endDate?: string;
  status: MedicationStatus;
  notes?: string;
  source: MedicationSource;
  createdAt: string;
  updatedAt: string;
}

export type MedicationInput = Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>;
