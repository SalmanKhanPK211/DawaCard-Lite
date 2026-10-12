import { Medication, MedicationInput } from '../../types/medication';
import { AllergyRecord, AllergyRecordInput, AllergyStatus } from '../../types/allergy';
import { PatientProfile } from '../../types/patient';
import { getCurrentUser } from '../auth/supabase';
import { supabaseDbService } from './supabaseDb';

const DB_NAME = 'dawacard_lite_db';
const DB_VERSION = 1;

const STORES = {
  MEDICATIONS: 'medications',
  ALLERGIES: 'allergies',
  PATIENT: 'patient_profile',
  META: 'app_meta',
} as const;

// Helper to safely obtain IndexedDB connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.MEDICATIONS)) {
        const medStore = db.createObjectStore(STORES.MEDICATIONS, { keyPath: 'id' });
        medStore.createIndex('status', 'status', { unique: false });
        medStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.ALLERGIES)) {
        db.createObjectStore(STORES.ALLERGIES, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.PATIENT)) {
        db.createObjectStore(STORES.PATIENT, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.META)) {
        db.createObjectStore(STORES.META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB database.'));
  });
}

// StorageService: Supports both Cloud (Supabase PostgreSQL) when authenticated
// and Local-First (IndexedDB / memory fallback) when logged out or offline.
class StorageService {
  private isAvailable = true;
  private memoryStore: {
    medications: Map<string, Medication>;
    allergies: Map<string, AllergyRecord>;
    patient: PatientProfile | null;
    allergyStatus: AllergyStatus;
  } = {
    medications: new Map(),
    allergies: new Map(),
    patient: null,
    allergyStatus: 'unknown',
  };

  constructor() {
    this.checkAvailability();
  }

  private async checkAvailability() {
    try {
      const db = await openDB();
      db.close();
    } catch {
      this.isAvailable = false;
      console.warn('IndexedDB unavailable; using in-memory local storage fallback.');
    }
  }

  /**
   * Returns true if user is logged in with cloud database active
   */
  async isCloudActive(): Promise<boolean> {
    const user = await getCurrentUser();
    return Boolean(user);
  }

  // ==========================================
  // --- MEDICATIONS (Cloud-First + Local) ---
  // ==========================================

  async getMedications(): Promise<Medication[]> {
    const user = await getCurrentUser();
    if (user) {
      try {
        return await supabaseDbService.getMedications(user.id);
      } catch (err) {
        console.warn('Supabase getMedications failed; falling back to local:', err);
      }
    }
    return this.getLocalMedications();
  }

  async getMedication(id: string): Promise<Medication | null> {
    const user = await getCurrentUser();
    if (user) {
      try {
        return await supabaseDbService.getMedication(id, user.id);
      } catch (err) {
        console.warn('Supabase getMedication failed; falling back to local:', err);
      }
    }
    return this.getLocalMedication(id);
  }

  async saveMedication(input: MedicationInput & { id?: string }): Promise<Medication> {
    const user = await getCurrentUser();
    if (user) {
      try {
        return await supabaseDbService.saveMedication(input, user.id);
      } catch (err) {
        console.warn('Supabase saveMedication failed; saving locally:', err);
      }
    }
    return this.saveLocalMedication(input);
  }

  async deleteMedication(id: string): Promise<void> {
    const user = await getCurrentUser();
    if (user) {
      try {
        await supabaseDbService.deleteMedication(id, user.id);
        return;
      } catch (err) {
        console.warn('Supabase deleteMedication failed; deleting locally:', err);
      }
    }
    return this.deleteLocalMedication(id);
  }

  // ==========================================
  // --- ALLERGIES (Cloud-First + Local) ---
  // ==========================================

  async getAllergies(): Promise<AllergyRecord[]> {
    const user = await getCurrentUser();
    if (user) {
      try {
        return await supabaseDbService.getAllergies(user.id);
      } catch (err) {
        console.warn('Supabase getAllergies failed; falling back to local:', err);
      }
    }
    return this.getLocalAllergies();
  }

  async getAllergy(id: string): Promise<AllergyRecord | null> {
    const user = await getCurrentUser();
    if (user) {
      try {
        return await supabaseDbService.getAllergy(id, user.id);
      } catch (err) {
        console.warn('Supabase getAllergy failed; falling back to local:', err);
      }
    }
    return this.getLocalAllergy(id);
  }

  async saveAllergy(input: AllergyRecordInput & { id?: string }): Promise<AllergyRecord> {
    const user = await getCurrentUser();
    if (user) {
      try {
        return await supabaseDbService.saveAllergy(input, user.id);
      } catch (err) {
        console.warn('Supabase saveAllergy failed; saving locally:', err);
      }
    }
    return this.saveLocalAllergy(input);
  }

  async deleteAllergy(id: string): Promise<void> {
    const user = await getCurrentUser();
    if (user) {
      try {
        await supabaseDbService.deleteAllergy(id, user.id);
        return;
      } catch (err) {
        console.warn('Supabase deleteAllergy failed; deleting locally:', err);
      }
    }
    return this.deleteLocalAllergy(id);
  }

  // ==========================================
  // --- ALLERGY STATUS (Cloud-First + Local) ---
  // ==========================================

  async getAllergyStatus(): Promise<AllergyStatus> {
    const user = await getCurrentUser();
    if (user) {
      try {
        return await supabaseDbService.getAllergyStatus(user.id);
      } catch (err) {
        console.warn('Supabase getAllergyStatus failed; falling back to local:', err);
      }
    }
    return this.getLocalAllergyStatus();
  }

  async setAllergyStatus(status: AllergyStatus): Promise<void> {
    const user = await getCurrentUser();
    if (user) {
      try {
        await supabaseDbService.setAllergyStatus(status, user.id);
        return;
      } catch (err) {
        console.warn('Supabase setAllergyStatus failed; saving locally:', err);
      }
    }
    return this.setLocalAllergyStatus(status);
  }

  // ==========================================
  // --- PATIENT PROFILE (Cloud-First + Local) ---
  // ==========================================

  async getPatientProfile(): Promise<PatientProfile | null> {
    const user = await getCurrentUser();
    if (user) {
      try {
        return await supabaseDbService.getPatientProfile(user.id);
      } catch (err) {
        console.warn('Supabase getPatientProfile failed; falling back to local:', err);
      }
    }
    return this.getLocalPatientProfile();
  }

  async savePatientProfile(
    profile: Omit<PatientProfile, 'id' | 'updatedAt'>
  ): Promise<PatientProfile> {
    const user = await getCurrentUser();
    if (user) {
      try {
        return await supabaseDbService.savePatientProfile(profile, user.id);
      } catch (err) {
        console.warn('Supabase savePatientProfile failed; saving locally:', err);
      }
    }
    return this.saveLocalPatientProfile(profile);
  }

  // ==========================================
  // --- CLEAR ALL DATA ---
  // ==========================================

  async clearAllData(): Promise<void> {
    const user = await getCurrentUser();
    if (user) {
      try {
        await supabaseDbService.clearAllUserData(user.id);
      } catch (err) {
        console.warn('Supabase clearAllUserData failed:', err);
      }
    }
    await this.clearLocalData();
  }

  // ==========================================
  // --- CLOUD SYNC METHOD ---
  // ==========================================

  async syncLocalToCloud(): Promise<{ success: boolean; count: number; error?: string }> {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, count: 0, error: 'Please sign in to sync your data to the cloud.' };
    }

    const localMeds = await this.getLocalMedications();
    const localAllergies = await this.getLocalAllergies();
    const localPatient = await this.getLocalPatientProfile();
    const localStatus = await this.getLocalAllergyStatus();

    try {
      await supabaseDbService.syncLocalToCloud(user.id, {
        medications: localMeds,
        allergies: localAllergies,
        patient: localPatient,
        allergyStatus: localStatus,
      });

      return {
        success: true,
        count: localMeds.length + localAllergies.length,
      };
    } catch (err: any) {
      return {
        success: false,
        count: 0,
        error: err.message || 'Failed to sync local data to Supabase.',
      };
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
      version: 1,
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
      console.error('Failed to import data:', err);
      throw err;
    }
  }

  // ==========================================
  // --- DIRECT LOCAL-FIRST IMPLEMENTATION ---
  // ==========================================

  async getLocalMedications(): Promise<Medication[]> {
    if (!this.isAvailable) {
      return Array.from(this.memoryStore.medications.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.MEDICATIONS, 'readonly');
      const store = tx.objectStore(STORES.MEDICATIONS);
      const req = store.getAll();
      req.onsuccess = () => {
        const meds: Medication[] = req.result || [];
        meds.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        resolve(meds);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getLocalMedication(id: string): Promise<Medication | null> {
    if (!this.isAvailable) {
      return this.memoryStore.medications.get(id) || null;
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.MEDICATIONS, 'readonly');
      const req = tx.objectStore(STORES.MEDICATIONS).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async saveLocalMedication(input: MedicationInput & { id?: string }): Promise<Medication> {
    const now = new Date().toISOString();
    const medication: Medication = {
      ...input,
      id: input.id || `med_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: input.id ? (await this.getLocalMedication(input.id))?.createdAt || now : now,
      updatedAt: now,
    };

    if (!this.isAvailable) {
      this.memoryStore.medications.set(medication.id, medication);
      return medication;
    }

    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.MEDICATIONS, 'readwrite');
      const store = tx.objectStore(STORES.MEDICATIONS);
      const req = store.put(medication);
      req.onsuccess = () => resolve(medication);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteLocalMedication(id: string): Promise<void> {
    if (!this.isAvailable) {
      this.memoryStore.medications.delete(id);
      return;
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.MEDICATIONS, 'readwrite');
      const req = tx.objectStore(STORES.MEDICATIONS).delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getLocalAllergies(): Promise<AllergyRecord[]> {
    if (!this.isAvailable) {
      return Array.from(this.memoryStore.allergies.values());
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ALLERGIES, 'readonly');
      const req = tx.objectStore(STORES.ALLERGIES).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getLocalAllergy(id: string): Promise<AllergyRecord | null> {
    if (!this.isAvailable) {
      return this.memoryStore.allergies.get(id) || null;
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ALLERGIES, 'readonly');
      const req = tx.objectStore(STORES.ALLERGIES).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async saveLocalAllergy(input: AllergyRecordInput & { id?: string }): Promise<AllergyRecord> {
    const now = new Date().toISOString();
    const record: AllergyRecord = {
      ...input,
      id: input.id || `all_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: input.id ? (await this.getLocalAllergy(input.id))?.createdAt || now : now,
      updatedAt: now,
    };

    if (!this.isAvailable) {
      this.memoryStore.allergies.set(record.id, record);
      return record;
    }

    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ALLERGIES, 'readwrite');
      const req = tx.objectStore(STORES.ALLERGIES).put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteLocalAllergy(id: string): Promise<void> {
    if (!this.isAvailable) {
      this.memoryStore.allergies.delete(id);
      return;
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ALLERGIES, 'readwrite');
      const req = tx.objectStore(STORES.ALLERGIES).delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getLocalAllergyStatus(): Promise<AllergyStatus> {
    if (!this.isAvailable) {
      return this.memoryStore.allergyStatus;
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.META, 'readonly');
      const req = tx.objectStore(STORES.META).get('allergy_status');
      req.onsuccess = () => resolve(req.result ? req.result.value : 'unknown');
      req.onerror = () => reject(req.error);
    });
  }

  async setLocalAllergyStatus(status: AllergyStatus): Promise<void> {
    if (!this.isAvailable) {
      this.memoryStore.allergyStatus = status;
      return;
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.META, 'readwrite');
      const req = tx.objectStore(STORES.META).put({ key: 'allergy_status', value: status });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getLocalPatientProfile(): Promise<PatientProfile | null> {
    if (!this.isAvailable) {
      return this.memoryStore.patient;
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PATIENT, 'readonly');
      const req = tx.objectStore(STORES.PATIENT).get('default_patient');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async saveLocalPatientProfile(
    profile: Omit<PatientProfile, 'id' | 'updatedAt'>
  ): Promise<PatientProfile> {
    const updated: PatientProfile = {
      ...profile,
      id: 'default_patient',
      updatedAt: new Date().toISOString(),
    };

    if (!this.isAvailable) {
      this.memoryStore.patient = updated;
      return updated;
    }

    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PATIENT, 'readwrite');
      const req = tx.objectStore(STORES.PATIENT).put(updated);
      req.onsuccess = () => resolve(updated);
      req.onerror = () => reject(req.error);
    });
  }

  async clearLocalData(): Promise<void> {
    if (!this.isAvailable) {
      this.memoryStore.medications.clear();
      this.memoryStore.allergies.clear();
      this.memoryStore.patient = null;
      this.memoryStore.allergyStatus = 'unknown';
      return;
    }

    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(
        [STORES.MEDICATIONS, STORES.ALLERGIES, STORES.PATIENT, STORES.META],
        'readwrite'
      );

      tx.objectStore(STORES.MEDICATIONS).clear();
      tx.objectStore(STORES.ALLERGIES).clear();
      tx.objectStore(STORES.PATIENT).clear();
      tx.objectStore(STORES.META).clear();

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const storageService = new StorageService();
