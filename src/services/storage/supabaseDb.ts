import { supabase } from '../auth/supabase';
import { Medication, MedicationInput } from '../../types/medication';
import { AllergyRecord, AllergyRecordInput, AllergyStatus } from '../../types/allergy';
import { PatientProfile } from '../../types/patient';

// --- MAPPING HELPERS ---

function mapMedicationFromRow(row: any): Medication {
  return {
    id: row.id,
    name: row.name,
    strength: row.strength || undefined,
    dosageForm: row.dosage_form || undefined,
    prescribedInstructions: row.prescribed_instructions || undefined,
    route: row.route || undefined,
    frequency: row.frequency || undefined,
    duration: row.duration || undefined,
    timesOfDay: Array.isArray(row.times_of_day) ? row.times_of_day : undefined,
    startDate: row.start_date || undefined,
    endDate: row.end_date || undefined,
    status: row.status || 'current',
    notes: row.notes || undefined,
    source: row.source || 'manual',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function mapMedicationToRow(med: Medication, userId: string): any {
  return {
    id: med.id,
    user_id: userId,
    name: med.name,
    strength: med.strength || null,
    dosage_form: med.dosageForm || null,
    prescribed_instructions: med.prescribedInstructions || null,
    route: med.route || null,
    frequency: med.frequency || null,
    duration: med.duration || null,
    times_of_day: med.timesOfDay || [],
    start_date: med.startDate || null,
    end_date: med.endDate || null,
    status: med.status,
    notes: med.notes || null,
    source: med.source,
    created_at: med.createdAt,
    updated_at: med.updatedAt,
  };
}

function mapAllergyFromRow(row: any): AllergyRecord {
  return {
    id: row.id,
    allergen: row.allergen,
    reportedReaction: row.reported_reaction || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function mapAllergyToRow(allergy: AllergyRecord, userId: string): any {
  return {
    id: allergy.id,
    user_id: userId,
    allergen: allergy.allergen,
    reported_reaction: allergy.reportedReaction || null,
    notes: allergy.notes || null,
    created_at: allergy.createdAt,
    updated_at: allergy.updatedAt,
  };
}

export class SupabaseDbService {
  // --- MEDICATIONS ---
  async getMedications(userId: string): Promise<Medication[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Supabase getMedications error:', error.message);
      throw error;
    }

    return (data || []).map(mapMedicationFromRow);
  }

  async getMedication(id: string, userId: string): Promise<Medication | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Supabase getMedication error:', error.message);
      throw error;
    }

    return data ? mapMedicationFromRow(data) : null;
  }

  async saveMedication(
    input: MedicationInput & { id?: string },
    userId: string
  ): Promise<Medication> {
    if (!supabase) throw new Error('Supabase client not initialized');

    const now = new Date().toISOString();
    const id = input.id || `med_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // If updating, preserve existing createdAt
    let createdAt = now;
    if (input.id) {
      const existing = await this.getMedication(input.id, userId);
      if (existing) {
        createdAt = existing.createdAt;
      }
    }

    const medication: Medication = {
      ...input,
      id,
      createdAt,
      updatedAt: now,
    };

    const row = mapMedicationToRow(medication, userId);

    const isEditing = Boolean(input.id);
    let queryError: any = null;

    if (isEditing) {
      const { error } = await supabase
        .from('medications')
        .update(row)
        .eq('id', id)
        .eq('user_id', userId);
      queryError = error;
    } else {
      const { error } = await supabase.from('medications').insert(row);
      queryError = error;
    }

    if (queryError) {
      console.error('Supabase saveMedication error:', queryError);
      throw new Error(queryError.message || 'Failed to save medication to cloud database.');
    }

    return medication;
  }

  async deleteMedication(id: string, userId: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase deleteMedication error:', error.message);
      throw error;
    }
  }

  // --- ALLERGIES ---
  async getAllergies(userId: string): Promise<AllergyRecord[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('allergies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase getAllergies error:', error.message);
      throw error;
    }

    return (data || []).map(mapAllergyFromRow);
  }

  async getAllergy(id: string, userId: string): Promise<AllergyRecord | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('allergies')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Supabase getAllergy error:', error.message);
      throw error;
    }

    return data ? mapAllergyFromRow(data) : null;
  }

  async saveAllergy(
    input: AllergyRecordInput & { id?: string },
    userId: string
  ): Promise<AllergyRecord> {
    if (!supabase) throw new Error('Supabase client not initialized');

    const now = new Date().toISOString();
    const id = input.id || `all_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    let createdAt = now;
    if (input.id) {
      const existing = await this.getAllergy(input.id, userId);
      if (existing) {
        createdAt = existing.createdAt;
      }
    }

    const record: AllergyRecord = {
      ...input,
      id,
      createdAt,
      updatedAt: now,
    };

    const row = mapAllergyToRow(record, userId);
    const isEditing = Boolean(input.id);
    let queryError: any = null;

    if (isEditing) {
      const { error } = await supabase
        .from('allergies')
        .update(row)
        .eq('id', id)
        .eq('user_id', userId);
      queryError = error;
    } else {
      const { error } = await supabase.from('allergies').insert(row);
      queryError = error;
    }

    if (queryError) {
      console.error('Supabase saveAllergy error:', queryError);
      throw new Error(queryError.message || 'Failed to save allergy to cloud database.');
    }

    return record;
  }

  async deleteAllergy(id: string, userId: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase
      .from('allergies')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase deleteAllergy error:', error.message);
      throw error;
    }
  }

  // --- PATIENT PROFILE & ALLERGY STATUS ---
  async getPatientProfile(userId: string): Promise<PatientProfile | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Supabase getPatientProfile error:', error.message);
      return null;
    }

    if (!data) return null;

    return {
      id: data.user_id,
      displayName: data.display_name || undefined,
      dateOfBirth: data.date_of_birth || undefined,
      notes: data.notes || undefined,
      updatedAt: data.updated_at,
    };
  }

  async savePatientProfile(
    profile: Omit<PatientProfile, 'id' | 'updatedAt'>,
    userId: string
  ): Promise<PatientProfile> {
    if (!supabase) throw new Error('Supabase client not initialized');

    const now = new Date().toISOString();
    const row = {
      user_id: userId,
      display_name: profile.displayName || null,
      date_of_birth: profile.dateOfBirth || null,
      notes: profile.notes || null,
      updated_at: now,
    };

    const { error } = await supabase.from('patient_profiles').upsert(row);

    if (error) {
      console.warn('Supabase savePatientProfile error:', error.message);
      throw error;
    }

    return {
      ...profile,
      id: userId,
      updatedAt: now,
    };
  }

  async getAllergyStatus(userId: string): Promise<AllergyStatus> {
    if (!supabase) return 'unknown';

    const { data, error } = await supabase
      .from('patient_profiles')
      .select('allergy_status')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return 'unknown';
    }

    return (data.allergy_status as AllergyStatus) || 'unknown';
  }

  async setAllergyStatus(status: AllergyStatus, userId: string): Promise<void> {
    if (!supabase) return;

    const now = new Date().toISOString();
    const { error } = await supabase.from('patient_profiles').upsert({
      user_id: userId,
      allergy_status: status,
      updated_at: now,
    });

    if (error) {
      console.warn('Supabase setAllergyStatus error:', error.message);
      throw error;
    }
  }

  // --- BULK OPERATIONS ---
  async clearAllUserData(userId: string): Promise<void> {
    if (!supabase) return;

    await Promise.all([
      supabase.from('medications').delete().eq('user_id', userId),
      supabase.from('allergies').delete().eq('user_id', userId),
      supabase.from('patient_profiles').delete().eq('user_id', userId),
    ]);
  }

  async syncLocalToCloud(
    userId: string,
    localData: {
      medications: Medication[];
      allergies: AllergyRecord[];
      patient: PatientProfile | null;
      allergyStatus: AllergyStatus;
    }
  ): Promise<void> {
    if (!supabase) return;

    // 1. Sync Patient Profile & Allergy Status
    const now = new Date().toISOString();
    await supabase.from('patient_profiles').upsert({
      user_id: userId,
      display_name: localData.patient?.displayName || null,
      date_of_birth: localData.patient?.dateOfBirth || null,
      notes: localData.patient?.notes || null,
      allergy_status: localData.allergyStatus || 'unknown',
      updated_at: now,
    });

    // 2. Sync Medications
    if (localData.medications.length > 0) {
      const medRows = localData.medications.map((m) => mapMedicationToRow(m, userId));
      await supabase.from('medications').upsert(medRows);
    }

    // 3. Sync Allergies
    if (localData.allergies.length > 0) {
      const allergyRows = localData.allergies.map((a) => mapAllergyToRow(a, userId));
      await supabase.from('allergies').upsert(allergyRows);
    }
  }
}

export const supabaseDbService = new SupabaseDbService();
