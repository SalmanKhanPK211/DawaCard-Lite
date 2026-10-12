import { Medication, MedicationInput } from '../../types/medication';
import { AllergyRecord, AllergyRecordInput, AllergyStatus } from '../../types/allergy';
import { PatientProfile } from '../../types/patient';
import { getCurrentUser } from '../auth/supabase';
import { supabaseDbService } from './supabaseDb';

const isTestEnvironment =
  typeof process !== 'undefined' &&
  (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true');

/**
 * StorageService: Exclusively powered by Supabase Cloud PostgreSQL Database.
 * All user prescriptions, allergies, and patient profiles are stored securely in Supabase tables
 * with Row Level Security (RLS) linked to the user's account.
 */
class StorageService {
  // In-memory test store active only during Vitest test executions
  private testMemoryStore = {
    medications: new Map<string, Medication>(),
    allergies: new Map<string, AllergyRecord>(),
    patient: null as PatientProfile | null,
    allergyStatus: 'unknown' as AllergyStatus,
  };

  /**
   * Helper to ensure user is authenticated when calling cloud operations
   */
  private async getActiveUserId(): Promise<string | null> {
    const user = await getCurrentUser();
    return user ? user.id : null;
  }

  // ==========================================
  // --- MEDICATIONS (Supabase Cloud Database) ---
  // ==========================================

  async getMedications(): Promise<Medication[]> {
    if (isTestEnvironment) {
      return Array.from(this.testMemoryStore.medications.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }

    const userId = await this.getActiveUserId();
    if (!userId) {
      return [];
    }

    return await supabaseDbService.getMedications(userId);
  }

  async getMedication(id: string): Promise<Medication | null> {
    if (isTestEnvironment) {
      return this.testMemoryStore.medications.get(id) || null;
    }

    const userId = await this.getActiveUserId();
    if (!userId) {
      return null;
    }

    return await supabaseDbService.getMedication(id, userId);
  }

  async saveMedication(input: MedicationInput & { id?: string }): Promise<Medication> {
    if (isTestEnvironment) {
      const now = new Date().toISOString();
      const med: Medication = {
        ...input,
        id: input.id || `med_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: input.id
          ? this.testMemoryStore.medications.get(input.id)?.createdAt || now
          : now,
        updatedAt: now,
      };
      this.testMemoryStore.medications.set(med.id, med);
      return med;
    }

    const userId = await this.getActiveUserId();
    if (!userId) {
      throw new Error('Please sign in to save medications to your cloud database.');
    }

    return await supabaseDbService.saveMedication(input, userId);
  }

  async deleteMedication(id: string): Promise<void> {
    if (isTestEnvironment) {
      this.testMemoryStore.medications.delete(id);
      return;
    }

    const userId = await this.getActiveUserId();
    if (!userId) {
      throw new Error('Please sign in to manage medications in your cloud database.');
    }

    await supabaseDbService.deleteMedication(id, userId);
  }

  // ==========================================
  // --- ALLERGIES (Supabase Cloud Database) ---
  // ==========================================

  async getAllergies(): Promise<AllergyRecord[]> {
    if (isTestEnvironment) {
      return Array.from(this.testMemoryStore.allergies.values());
    }

    const userId = await this.getActiveUserId();
    if (!userId) {
      return [];
    }

    return await supabaseDbService.getAllergies(userId);
  }

  async getAllergy(id: string): Promise<AllergyRecord | null> {
    if (isTestEnvironment) {
      return this.testMemoryStore.allergies.get(id) || null;
    }

    const userId = await this.getActiveUserId();
    if (!userId) {
      return null;
    }

    return await supabaseDbService.getAllergy(id, userId);
  }

  async saveAllergy(input: AllergyRecordInput & { id?: string }): Promise<AllergyRecord> {
    if (isTestEnvironment) {
      const now = new Date().toISOString();
      const record: AllergyRecord = {
        ...input,
        id: input.id || `all_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: input.id
          ? this.testMemoryStore.allergies.get(input.id)?.createdAt || now
          : now,
        updatedAt: now,
      };
      this.testMemoryStore.allergies.set(record.id, record);
      return record;
    }

    const userId = await this.getActiveUserId();
    if (!userId) {
      throw new Error('Please sign in to save allergies to your cloud database.');
    }

    return await supabaseDbService.saveAllergy(input, userId);
  }

  async deleteAllergy(id: string): Promise<void> {
    if (isTestEnvironment) {
      this.testMemoryStore.allergies.delete(id);
      return;
    }

    const userId = await this.getActiveUserId();
    if (!userId) {
      throw new Error('Please sign in to manage allergies in your cloud database.');
    }

    await supabaseDbService.deleteAllergy(id, userId);
  }

  // ==========================================
  // --- ALLERGY STATUS (Supabase Cloud Database) ---
  // ==========================================

  async getAllergyStatus(): Promise<AllergyStatus> {
    if (isTestEnvironment) {
      return this.testMemoryStore.allergyStatus;
    }

    const userId = await this.getActiveUserId();
    if (!userId) {
      return 'unknown';
    }

    return await supabaseDbService.getAllergyStatus(userId);
  }

  async setAllergyStatus(status: AllergyStatus): Promise<void> {
    if (isTestEnvironment) {
      this.testMemoryStore.allergyStatus = status;
      return;
    }

    const userId = await this.getActiveUserId();
    if (!userId) {
      throw new Error('Please sign in to update allergy status.');
    }

    await supabaseDbService.setAllergyStatus(status, userId);
  }

  // ==========================================
  // --- PATIENT PROFILE (Supabase Cloud Database) ---
  // ==========================================

  async getPatientProfile(): Promise<PatientProfile | null> {
    if (isTestEnvironment) {
      return this.testMemoryStore.patient;
    }

    const userId = await this.getActiveUserId();
    if (!userId) {
      return null;
    }

    return await supabaseDbService.getPatientProfile(userId);
  }

  async savePatientProfile(
    profile: Omit<PatientProfile, 'id' | 'updatedAt'>
  ): Promise<PatientProfile> {
    if (isTestEnvironment) {
      const updated: PatientProfile = {
        ...profile,
        id: 'test_patient',
        updatedAt: new Date().toISOString(),
      };
      this.testMemoryStore.patient = updated;
      return updated;
    }

    const userId = await this.getActiveUserId();
    if (!userId) {
      throw new Error('Please sign in to save your patient profile.');
    }

    return await supabaseDbService.savePatientProfile(profile, userId);
  }

  // ==========================================
  // --- CLEAR ALL CLOUD DATA ---
  // ==========================================

  async clearAllData(): Promise<void> {
    if (isTestEnvironment) {
      this.testMemoryStore.medications.clear();
      this.testMemoryStore.allergies.clear();
      this.testMemoryStore.patient = null;
      this.testMemoryStore.allergyStatus = 'unknown';
      return;
    }

    const userId = await this.getActiveUserId();
    if (userId) {
      await supabaseDbService.clearAllUserData(userId);
    }
  }

  // ==========================================
  // --- EXPORT & IMPORT BACKUP DATA ---
  // ==========================================

  async exportData(): Promise<string> {
    const meds = await this.getMedications();
    const allergies = await this.getAllergies();
    const allergyStatus = await this.getAllergyStatus();
    const patient = await this.getPatientProfile();

    const data = {
      version: 2,
      database: 'supabase',
      exportedAt: new Date().toISOString(),
      patient,
      allergyStatus,
      allergies,
      medications: meds,
    };

    return JSON.stringify(data, null, 2);
  }

  async importData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') throw new Error('Invalid JSON data format');

      await this.clearAllData();

      if (data.patient) {
        await this.savePatientProfile(data.patient);
      }
      if (data.allergyStatus) {
        await this.setAllergyStatus(data.allergyStatus);
      }
      if (Array.isArray(data.allergies)) {
        for (const allergy of data.allergies) {
          await this.saveAllergy(allergy);
        }
      }
      if (Array.isArray(data.medications)) {
        for (const med of data.medications) {
          await this.saveMedication(med);
        }
      }
      return true;
    } catch (err) {
      console.error('Failed to import data to Supabase:', err);
      throw err;
    }
  }
}

export const storageService = new StorageService();
