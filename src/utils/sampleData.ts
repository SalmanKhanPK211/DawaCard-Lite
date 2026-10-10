import { storageService } from '../services/storage/db';
import { MedicationInput } from '../types/medication';
import { AllergyRecordInput } from '../types/allergy';

export const SAMPLE_PATIENT = {
  displayName: 'Jane Doe',
  dateOfBirth: '1975-06-15',
  notes: 'Penicillin allergy noted. Take morning medications with food.',
};

export const SAMPLE_MEDICATIONS: MedicationInput[] = [
  {
    name: 'Amoxicillin',
    strength: '500 mg',
    dosageForm: 'Capsule',
    prescribedInstructions: 'Take 1 capsule by mouth every 8 hours for 7 days',
    route: 'Oral',
    frequency: 'Every 8 hours',
    duration: '7 days',
    startDate: '2026-10-01',
    endDate: '2026-10-08',
    status: 'current',
    notes: 'Prescribed for chest infection',
    source: 'manual',
  },
  {
    name: 'Lisinopril',
    strength: '10 mg',
    dosageForm: 'Tablet',
    prescribedInstructions: 'Take 1 tablet daily in the morning',
    route: 'Oral',
    frequency: 'Once daily',
    startDate: '2025-01-10',
    status: 'current',
    notes: 'For blood pressure control',
    source: 'ai-reviewed',
  },
  {
    name: 'Ibuprofen',
    strength: '400 mg',
    dosageForm: 'Tablet',
    prescribedInstructions: 'Take 1 tablet every 6 hours as needed for joint pain',
    route: 'Oral',
    frequency: 'As needed',
    status: 'discontinued',
    endDate: '2026-09-15',
    notes: 'Discontinued after symptoms improved',
    source: 'manual',
  },
];

export const SAMPLE_ALLERGIES: AllergyRecordInput[] = [
  {
    allergen: 'Penicillin',
    reportedReaction: 'Skin rash and mild facial swelling',
    notes: 'Discovered in 2018 during bronchitis treatment',
  },
  {
    allergen: 'Peanuts',
    reportedReaction: 'Hives and itching',
    notes: 'Mild reaction, avoids peanut products',
  },
];

export async function loadSampleData(): Promise<void> {
  await storageService.savePatientProfile(SAMPLE_PATIENT);
  await storageService.setAllergyStatus('known_allergies');
  for (const allergy of SAMPLE_ALLERGIES) {
    await storageService.saveAllergy(allergy);
  }
  for (const med of SAMPLE_MEDICATIONS) {
    await storageService.saveMedication(med);
  }
}
