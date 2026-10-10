import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../src/services/storage/db';

describe('Local Storage & Data Management Service', () => {
  beforeEach(async () => {
    await storageService.clearAllData();
  });

  it('allows creating, reading, updating, and deleting a medication record', async () => {
    // 1. Create
    const newMed = await storageService.saveMedication({
      name: 'Test Amoxicillin',
      strength: '250 mg',
      dosageForm: 'Capsule',
      status: 'current',
      source: 'manual',
    });

    expect(newMed.id).toBeDefined();
    expect(newMed.name).toBe('Test Amoxicillin');

    // 2. Read
    const meds = await storageService.getMedications();
    expect(meds.length).toBe(1);
    expect(meds[0].name).toBe('Test Amoxicillin');

    // 3. Update
    const updatedMed = await storageService.saveMedication({
      ...newMed,
      strength: '500 mg',
      status: 'discontinued',
    });
    expect(updatedMed.strength).toBe('500 mg');
    expect(updatedMed.status).toBe('discontinued');

    // 4. Delete
    await storageService.deleteMedication(newMed.id);
    const medsAfterDelete = await storageService.getMedications();
    expect(medsAfterDelete.length).toBe(0);
  });

  it('maintains 3 distinct allergy states: unknown, no_known_allergies, and known_allergies', async () => {
    // Default status should be unknown
    const initialStatus = await storageService.getAllergyStatus();
    expect(initialStatus).toBe('unknown');

    // Explicitly set No Known Allergies (NKA)
    await storageService.setAllergyStatus('no_known_allergies');
    const nkaStatus = await storageService.getAllergyStatus();
    expect(nkaStatus).toBe('no_known_allergies');
    expect(nkaStatus).not.toBe('unknown');

    // Record a specific allergen and set status to known_allergies
    await storageService.setAllergyStatus('known_allergies');
    await storageService.saveAllergy({
      allergen: 'Penicillin',
      reportedReaction: 'Rash',
    });

    const knownStatus = await storageService.getAllergyStatus();
    expect(knownStatus).toBe('known_allergies');

    const list = await storageService.getAllergies();
    expect(list.length).toBe(1);
    expect(list[0].allergen).toBe('Penicillin');
  });

  it('clears all data when requested', async () => {
    await storageService.saveMedication({ name: 'Temp Med', status: 'current', source: 'manual' });
    await storageService.saveAllergy({ allergen: 'Peanuts' });
    await storageService.setAllergyStatus('known_allergies');

    let meds = await storageService.getMedications();
    expect(meds.length).toBe(1);

    await storageService.clearAllData();

    meds = await storageService.getMedications();
    const allergies = await storageService.getAllergies();
    const status = await storageService.getAllergyStatus();

    expect(meds.length).toBe(0);
    expect(allergies.length).toBe(0);
    expect(status).toBe('unknown');
  });

  it('exports and imports JSON data backup accurately', async () => {
    await storageService.saveMedication({ name: 'Backup Med', status: 'current', source: 'manual' });
    await storageService.setAllergyStatus('no_known_allergies');

    const jsonStr = await storageService.exportData();
    expect(jsonStr).toContain('Backup Med');
    expect(jsonStr).toContain('no_known_allergies');

    await storageService.clearAllData();
    expect((await storageService.getMedications()).length).toBe(0);

    const imported = await storageService.importData(jsonStr);
    expect(imported).toBe(true);

    const medsAfterImport = await storageService.getMedications();
    expect(medsAfterImport.length).toBe(1);
    expect(medsAfterImport[0].name).toBe('Backup Med');
    expect(await storageService.getAllergyStatus()).toBe('no_known_allergies');
  });
});
