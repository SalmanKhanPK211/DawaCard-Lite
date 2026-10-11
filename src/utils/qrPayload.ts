import { Medication } from '../types/medication';
import { AllergyRecord, AllergyStatus } from '../types/allergy';
import { PatientProfile } from '../types/patient';

export interface EmergencyDataPayload {
  p?: string; // patient display name
  dob?: string; // date of birth
  as: AllergyStatus; // allergy status
  al: string[]; // allergens list
  m: Array<{
    n: string; // name
    s?: string; // strength
    i?: string; // instructions
    t?: string[]; // times of day
  }>;
  u: string; // updated date
}

export function generateEmergencyPayload(
  patient: PatientProfile | null,
  medications: Medication[],
  allergies: AllergyRecord[],
  allergyStatus: AllergyStatus
): string {
  const currentMeds = medications.filter((m) => m.status === 'current');

  const compact: EmergencyDataPayload = {
    p: patient?.displayName || undefined,
    dob: patient?.dateOfBirth || undefined,
    as: allergyStatus,
    al: allergies.map((a) => (a.reportedReaction ? `${a.allergen} (${a.reportedReaction})` : a.allergen)),
    m: currentMeds.map((m) => ({
      n: m.name,
      s: m.strength || undefined,
      i: m.prescribedInstructions || undefined,
      t: m.timesOfDay || undefined,
    })),
    u: new Date().toISOString().slice(0, 10),
  };

  const jsonStr = JSON.stringify(compact);
  try {
    return btoa(encodeURIComponent(jsonStr));
  } catch {
    return btoa(jsonStr);
  }
}

export function decodeEmergencyPayload(encoded: string): EmergencyDataPayload | null {
  try {
    const jsonStr = decodeURIComponent(atob(encoded));
    return JSON.parse(jsonStr) as EmergencyDataPayload;
  } catch {
    try {
      const jsonStr = atob(encoded);
      return JSON.parse(jsonStr) as EmergencyDataPayload;
    } catch {
      return null;
    }
  }
}

export function getEmergencyUrl(payloadBase64: string): string {
  const origin = window.location.origin;
  return `${origin}/#emergency?data=${payloadBase64}`;
}
