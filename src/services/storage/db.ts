import { Medication, MedicationInput } from '../../types/medication';
import { AllergyRecord, AllergyRecordInput, AllergyStatus } from '../../types/allergy';
import { PatientProfile } from '../../types/patient';

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

// Memory fallback store if IndexedDB fails or is unavailable
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

  // --- MEDICATIONS ---
  async getMedications(): Promise<Medication[]> {
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

  async getMedication(id: string): Promise<Medication | null> {
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

  async saveMedication(input: MedicationInput & { id?: string }): Promise<Medication> {
    const now = new Date().toISOString();
    const medication: Medication = {
      ...input,
      id: input.id || `med_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: input.id ? (await this.getMedication(input.id))?.createdAt || now : now,
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

  async deleteMedication(id: string): Promise<void> {
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

  // --- ALLERGIES ---
  async getAllergies(): Promise<AllergyRecord[]> {
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

  async saveAllergy(input: AllergyRecordInput & { id?: string }): Promise<AllergyRecord> {
    const now = new Date().toISOString();
    const record: AllergyRecord = {
      ...input,
      id: input.id || `all_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: input.id ? (await this.getAllergy(input.id))?.createdAt || now : now,
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

  async getAllergy(id: string): Promise<AllergyRecord | null> {
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

  async deleteAllergy(id: string): Promise<void> {
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

  // --- ALLERGY STATUS ---
  async getAllergyStatus(): Promise<AllergyStatus> {
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

  async setAllergyStatus(status: AllergyStatus): Promise<void> {
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

  // --- PATIENT PROFILE ---
  async getPatientProfile(): Promise<PatientProfile | null> {
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

  async savePatientProfile(profile: Omit<PatientProfile, 'id' | 'updatedAt'>): Promise<PatientProfile> {
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

  // --- CLEAR ALL DATA ---
  async clearAllData(): Promise<void> {
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

  // --- EXPORT & IMPORT DATA ---
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
}

export const storageService = new StorageService();
