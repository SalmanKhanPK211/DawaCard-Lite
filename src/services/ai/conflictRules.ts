import { ConflictItem, RegimenSafetyReport } from '../../types/safety';

interface DrugClassMapping {
  classes: string[];
  genericName: string;
}

// Normalized drug alias dictionary covering generic and common commercial/brand names
const DRUG_ALIASES: Record<string, DrugClassMapping> = {
  // NSAIDs & Antiplatelets
  aspirin: { classes: ['nsaid', 'antiplatelet', 'salicylate'], genericName: 'Aspirin' },
  disprin: { classes: ['nsaid', 'antiplatelet', 'salicylate'], genericName: 'Aspirin' },
  ecosprin: { classes: ['nsaid', 'antiplatelet', 'salicylate'], genericName: 'Aspirin' },
  asat: { classes: ['nsaid', 'antiplatelet', 'salicylate'], genericName: 'Aspirin' },
  ibuprofen: { classes: ['nsaid'], genericName: 'Ibuprofen' },
  brufen: { classes: ['nsaid'], genericName: 'Ibuprofen' },
  advil: { classes: ['nsaid'], genericName: 'Ibuprofen' },
  motrin: { classes: ['nsaid'], genericName: 'Ibuprofen' },
  naproxen: { classes: ['nsaid'], genericName: 'Naproxen' },
  aleve: { classes: ['nsaid'], genericName: 'Naproxen' },
  synflex: { classes: ['nsaid'], genericName: 'Naproxen' },
  diclofenac: { classes: ['nsaid'], genericName: 'Diclofenac' },
  voltaren: { classes: ['nsaid'], genericName: 'Diclofenac' },
  voveran: { classes: ['nsaid'], genericName: 'Diclofenac' },
  cataflam: { classes: ['nsaid'], genericName: 'Diclofenac' },
  meloxicam: { classes: ['nsaid'], genericName: 'Meloxicam' },
  mobic: { classes: ['nsaid'], genericName: 'Meloxicam' },
  celecoxib: { classes: ['nsaid', 'cox2'], genericName: 'Celecoxib' },
  celebrex: { classes: ['nsaid', 'cox2'], genericName: 'Celecoxib' },

  // Anticoagulants
  warfarin: { classes: ['anticoagulant', 'vka'], genericName: 'Warfarin' },
  coumadin: { classes: ['anticoagulant', 'vka'], genericName: 'Warfarin' },
  clopidogrel: { classes: ['antiplatelet'], genericName: 'Clopidogrel' },
  plavix: { classes: ['antiplatelet'], genericName: 'Clopidogrel' },
  noplaq: { classes: ['antiplatelet'], genericName: 'Clopidogrel' },
  apixaban: { classes: ['anticoagulant', 'doac'], genericName: 'Apixaban' },
  eliquis: { classes: ['anticoagulant', 'doac'], genericName: 'Apixaban' },
  rivaroxaban: { classes: ['anticoagulant', 'doac'], genericName: 'Rivaroxaban' },
  xarelto: { classes: ['anticoagulant', 'doac'], genericName: 'Rivaroxaban' },

  // Penicillins & Beta-lactams
  penicillin: { classes: ['penicillin', 'beta_lactam'], genericName: 'Penicillin' },
  amoxicillin: { classes: ['penicillin', 'beta_lactam'], genericName: 'Amoxicillin' },
  amoxil: { classes: ['penicillin', 'beta_lactam'], genericName: 'Amoxicillin' },
  augmentin: { classes: ['penicillin', 'beta_lactam'], genericName: 'Amoxicillin/Clavulanate' },
  amoxiclav: { classes: ['penicillin', 'beta_lactam'], genericName: 'Amoxicillin/Clavulanate' },
  ampicillin: { classes: ['penicillin', 'beta_lactam'], genericName: 'Ampicillin' },
  piperacillin: { classes: ['penicillin', 'beta_lactam'], genericName: 'Piperacillin' },

  // Cephalosporins
  cephalexin: { classes: ['cephalosporin', 'beta_lactam'], genericName: 'Cephalexin' },
  keflex: { classes: ['cephalosporin', 'beta_lactam'], genericName: 'Cephalexin' },
  ceftriaxone: { classes: ['cephalosporin', 'beta_lactam'], genericName: 'Ceftriaxone' },
  rocephin: { classes: ['cephalosporin', 'beta_lactam'], genericName: 'Ceftriaxone' },
  cefixime: { classes: ['cephalosporin', 'beta_lactam'], genericName: 'Cefixime' },
  cefspan: { classes: ['cephalosporin', 'beta_lactam'], genericName: 'Cefixime' },

  // Sulfonamides
  sulfamethoxazole: { classes: ['sulfonamide'], genericName: 'Sulfamethoxazole' },
  bactrim: { classes: ['sulfonamide'], genericName: 'Trimethoprim/Sulfamethoxazole' },
  septra: { classes: ['sulfonamide'], genericName: 'Trimethoprim/Sulfamethoxazole' },
  sulfasalazine: { classes: ['sulfonamide'], genericName: 'Sulfasalazine' },

  // ACE Inhibitors & ARBs
  lisinopril: { classes: ['ace_inhibitor', 'raas'], genericName: 'Lisinopril' },
  zestril: { classes: ['ace_inhibitor', 'raas'], genericName: 'Lisinopril' },
  enalapril: { classes: ['ace_inhibitor', 'raas'], genericName: 'Enalapril' },
  vasotec: { classes: ['ace_inhibitor', 'raas'], genericName: 'Enalapril' },
  ramipril: { classes: ['ace_inhibitor', 'raas'], genericName: 'Ramipril' },
  altace: { classes: ['ace_inhibitor', 'raas'], genericName: 'Ramipril' },
  losartan: { classes: ['arb', 'raas'], genericName: 'Losartan' },
  cozaar: { classes: ['arb', 'raas'], genericName: 'Losartan' },
  valsartan: { classes: ['arb', 'raas'], genericName: 'Valsartan' },
  diovan: { classes: ['arb', 'raas'], genericName: 'Valsartan' },

  // Potassium & Diuretics
  spironolactone: { classes: ['potassium_sparing', 'diuretic'], genericName: 'Spironolactone' },
  aldactone: { classes: ['potassium_sparing', 'diuretic'], genericName: 'Spironolactone' },
  potassium: { classes: ['potassium_supplement'], genericName: 'Potassium Supplement' },
  'potassium chloride': { classes: ['potassium_supplement'], genericName: 'Potassium Chloride' },
  klorcon: { classes: ['potassium_supplement'], genericName: 'Potassium Chloride' },

  // Statins
  atorvastatin: { classes: ['statin', 'cyp3a4_substrate'], genericName: 'Atorvastatin' },
  lipitor: { classes: ['statin', 'cyp3a4_substrate'], genericName: 'Atorvastatin' },
  simvastatin: { classes: ['statin', 'cyp3a4_substrate'], genericName: 'Simvastatin' },
  zocor: { classes: ['statin', 'cyp3a4_substrate'], genericName: 'Simvastatin' },
  rosuvastatin: { classes: ['statin'], genericName: 'Rosuvastatin' },
  crestor: { classes: ['statin'], genericName: 'Rosuvastatin' },

  // Macrolides & Azoles
  clarithromycin: { classes: ['macrolide', 'cyp3a4_inhibitor'], genericName: 'Clarithromycin' },
  biaxin: { classes: ['macrolide', 'cyp3a4_inhibitor'], genericName: 'Clarithromycin' },
  erythromycin: { classes: ['macrolide', 'cyp3a4_inhibitor'], genericName: 'Erythromycin' },
  fluconazole: { classes: ['azole_antifungal', 'cyp3a4_inhibitor'], genericName: 'Fluconazole' },
  diflucan: { classes: ['azole_antifungal', 'cyp3a4_inhibitor'], genericName: 'Fluconazole' },

  // Antidepressants (SSRIs / SNRIs)
  sertraline: { classes: ['ssri', 'serotonergic'], genericName: 'Sertraline' },
  zoloft: { classes: ['ssri', 'serotonergic'], genericName: 'Sertraline' },
  escitalopram: { classes: ['ssri', 'serotonergic'], genericName: 'Escitalopram' },
  lexapro: { classes: ['ssri', 'serotonergic'], genericName: 'Escitalopram' },
  fluoxetine: { classes: ['ssri', 'serotonergic'], genericName: 'Fluoxetine' },
  prozac: { classes: ['ssri', 'serotonergic'], genericName: 'Fluoxetine' },
  venlafaxine: { classes: ['snri', 'serotonergic'], genericName: 'Venlafaxine' },
  effexor: { classes: ['snri', 'serotonergic'], genericName: 'Venlafaxine' },

  // Opioids & Pain
  tramadol: { classes: ['opioid', 'serotonergic'], genericName: 'Tramadol' },
  ultram: { classes: ['opioid', 'serotonergic'], genericName: 'Tramadol' },
  tramal: { classes: ['opioid', 'serotonergic'], genericName: 'Tramadol' },
  codeine: { classes: ['opioid'], genericName: 'Codeine' },
  morphine: { classes: ['opioid'], genericName: 'Morphine' },
  paracetamol: { classes: ['analgesic'], genericName: 'Paracetamol' },
  acetaminophen: { classes: ['analgesic'], genericName: 'Paracetamol' },
  panadol: { classes: ['analgesic'], genericName: 'Paracetamol' },
  tylenol: { classes: ['analgesic'], genericName: 'Paracetamol' },

  // Cardiac & Beta Blockers / CCBs
  metoprolol: { classes: ['beta_blocker'], genericName: 'Metoprolol' },
  lopressor: { classes: ['beta_blocker'], genericName: 'Metoprolol' },
  atenolol: { classes: ['beta_blocker'], genericName: 'Atenolol' },
  bisoprolol: { classes: ['beta_blocker'], genericName: 'Bisoprolol' },
  concor: { classes: ['beta_blocker'], genericName: 'Bisoprolol' },
  verapamil: { classes: ['non_dhp_ccb'], genericName: 'Verapamil' },
  isoptin: { classes: ['non_dhp_ccb'], genericName: 'Verapamil' },
  diltiazem: { classes: ['non_dhp_ccb'], genericName: 'Diltiazem' },
  cardizem: { classes: ['non_dhp_ccb'], genericName: 'Diltiazem' },
  amlodipine: { classes: ['dhp_ccb'], genericName: 'Amlodipine' },
  norvasc: { classes: ['dhp_ccb'], genericName: 'Amlodipine' },

  // Antibiotics & Cations
  ciprofloxacin: { classes: ['fluoroquinolone'], genericName: 'Ciprofloxacin' },
  cipro: { classes: ['fluoroquinolone'], genericName: 'Ciprofloxacin' },
  novidat: { classes: ['fluoroquinolone'], genericName: 'Ciprofloxacin' },
  levofloxacin: { classes: ['fluoroquinolone'], genericName: 'Levofloxacin' },
  levaquin: { classes: ['fluoroquinolone'], genericName: 'Levofloxacin' },
  doxycycline: { classes: ['tetracycline'], genericName: 'Doxycycline' },
  vibramycin: { classes: ['tetracycline'], genericName: 'Doxycycline' },
  calcium: { classes: ['multivalent_cation'], genericName: 'Calcium Supplement' },
  iron: { classes: ['multivalent_cation', 'iron_supplement'], genericName: 'Iron Supplement' },
  ferrous: { classes: ['multivalent_cation', 'iron_supplement'], genericName: 'Iron Supplement' },
  antacid: { classes: ['multivalent_cation'], genericName: 'Antacid' },
  gaviscon: { classes: ['multivalent_cation'], genericName: 'Antacid' },

  // Diabetes & GI
  metformin: { classes: ['biguanide'], genericName: 'Metformin' },
  glucophage: { classes: ['biguanide'], genericName: 'Metformin' },
  omeprazole: { classes: ['ppi'], genericName: 'Omeprazole' },
  prilosec: { classes: ['ppi'], genericName: 'Omeprazole' },
  methotrexate: { classes: ['antimetabolite'], genericName: 'Methotrexate' },
  metronidazole: { classes: ['nitroimidazole'], genericName: 'Metronidazole' },
  flagyl: { classes: ['nitroimidazole'], genericName: 'Metronidazole' },
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function resolveDrugInfo(rawName: string): { genericName: string; classes: string[] } {
  const norm = normalizeText(rawName);
  // Check exact token matches
  for (const [key, val] of Object.entries(DRUG_ALIASES)) {
    if (norm === key || norm.includes(key)) {
      return val;
    }
  }
  return { genericName: rawName.trim(), classes: [] };
}

export function analyzeWithClinicalRules(
  medications: Array<{ name: string; strength?: string; dosageForm?: string; status?: string }>,
  allergies: Array<{ allergen: string; reportedReaction?: string }>,
  candidateMedication?: { name: string; strength?: string; dosageForm?: string }
): RegimenSafetyReport {
  const conflicts: ConflictItem[] = [];
  const foodWarnings: Set<string> = new Set();
  const safeNotes: string[] = [];

  // Active meds list + candidate (if any)
  const activeMeds = medications.filter((m) => m.status !== 'discontinued');
  const allMedsToCheck = [...activeMeds];
  if (candidateMedication && candidateMedication.name.trim()) {
    allMedsToCheck.push({ ...candidateMedication, status: 'current' });
  }

  // 1. DRUG-ALLERGY CROSS SENSITIVITY CHECK
  for (const med of allMedsToCheck) {
    const medInfo = resolveDrugInfo(med.name);
    const medNorm = normalizeText(med.name);

    for (const allergy of allergies) {
      const allergyNorm = normalizeText(allergy.allergen);
      let matched = false;
      let reason = '';

      // Direct name match
      if (
        medNorm.includes(allergyNorm) ||
        allergyNorm.includes(medNorm) ||
        (medInfo.genericName && normalizeText(medInfo.genericName).includes(allergyNorm))
      ) {
        matched = true;
        reason = `Direct allergy match: "${med.name}" matches recorded allergen "${allergy.allergen}".`;
      }
      // Penicillin class
      else if (
        allergyNorm.includes('penicillin') &&
        (medInfo.classes.includes('penicillin') || medNorm.includes('cillin') || medNorm.includes('augmentin'))
      ) {
        matched = true;
        reason = `Severe Cross-Reactivity: "${med.name}" is a penicillin-class antibiotic, contraindicated for patients with a penicillin allergy.`;
      }
      // Sulfa class
      else if (
        (allergyNorm.includes('sulfa') || allergyNorm.includes('sulfonamide')) &&
        (medInfo.classes.includes('sulfonamide') || medNorm.includes('sulfa') || medNorm.includes('bactrim'))
      ) {
        matched = true;
        reason = `Sulfonamide Allergy: "${med.name}" contains sulfonamide components contraindicated with your sulfa allergy.`;
      }
      // NSAID / Aspirin class
      else if (
        (allergyNorm.includes('nsaid') || allergyNorm.includes('aspirin') || allergyNorm.includes('ibuprofen')) &&
        medInfo.classes.includes('nsaid')
      ) {
        matched = true;
        reason = `NSAID Class Allergy: "${med.name}" is a non-steroidal anti-inflammatory drug (NSAID) which may trigger acute bronchospasm, urticaria, or anaphylaxis.`;
      }
      // Cephalosporin class
      else if (
        allergyNorm.includes('cephalosporin') &&
        medInfo.classes.includes('cephalosporin')
      ) {
        matched = true;
        reason = `Cephalosporin Allergy: "${med.name}" belongs to the cephalosporin family and poses severe hypersensitivity risk.`;
      }
      // Opioid class
      else if (
        (allergyNorm.includes('opioid') || allergyNorm.includes('codeine')) &&
        medInfo.classes.includes('opioid')
      ) {
        matched = true;
        reason = `Opioid Hypersensitivity: "${med.name}" is an opioid analgesic matching recorded allergy.`;
      }

      if (matched) {
        conflicts.push({
          id: `allergy-${med.name}-${allergy.allergen}-${Date.now()}-${Math.random()}`,
          type: 'drug_allergy',
          severity: 'critical',
          substanceA: med.name,
          substanceB: allergy.allergen,
          title: `Critical Allergy Contraindication: ${medInfo.genericName}`,
          description: reason + (allergy.reportedReaction ? ` (Recorded reaction: ${allergy.reportedReaction})` : ''),
          clinicalRecommendation: `DO NOT ADMINISTER without direct physician consultation. Request an alternative therapeutic class from your doctor.`,
          references: 'Clinical Immunology & Cross-Reactivity Guidelines',
        });
      }
    }
  }

  // 2. DRUG-DRUG INTERACTIONS CHECK (Pairwise)
  for (let i = 0; i < allMedsToCheck.length; i++) {
    for (let j = i + 1; j < allMedsToCheck.length; j++) {
      const medA = allMedsToCheck[i];
      const medB = allMedsToCheck[j];
      const infoA = resolveDrugInfo(medA.name);
      const infoB = resolveDrugInfo(medB.name);

      const hasClass = (info: typeof infoA, cls: string) => info.classes.includes(cls);

      // (A) Anticoagulant / Antiplatelet + NSAID / Aspirin
      if (
        (hasClass(infoA, 'anticoagulant') && (hasClass(infoB, 'nsaid') || hasClass(infoB, 'antiplatelet'))) ||
        (hasClass(infoB, 'anticoagulant') && (hasClass(infoA, 'nsaid') || hasClass(infoA, 'antiplatelet'))) ||
        (hasClass(infoA, 'antiplatelet') && hasClass(infoB, 'nsaid')) ||
        (hasClass(infoB, 'antiplatelet') && hasClass(infoA, 'nsaid'))
      ) {
        conflicts.push({
          id: `dd-bleed-${medA.name}-${medB.name}`,
          type: 'drug_drug',
          severity: 'critical',
          substanceA: medA.name,
          substanceB: medB.name,
          title: `Major Bleeding Risk: ${infoA.genericName} + ${infoB.genericName}`,
          description: `Concurrent use of blood-thinning agents (${infoA.genericName}) and anti-inflammatory / antiplatelet drugs (${infoB.genericName}) significantly multiplies the risk of severe gastrointestinal and internal hemorrhage.`,
          clinicalRecommendation: `Consult your physician immediately. Gastroprotective co-therapy (e.g. PPI) or a safer analgesic alternative (e.g. Paracetamol) may be required.`,
          references: 'American Heart Association / British National Formulary (BNF)',
        });
      }

      // (B) Multiple Concurrent NSAIDs
      else if (hasClass(infoA, 'nsaid') && hasClass(infoB, 'nsaid')) {
        conflicts.push({
          id: `dd-nsaid-${medA.name}-${medB.name}`,
          type: 'drug_drug',
          severity: 'high',
          substanceA: medA.name,
          substanceB: medB.name,
          title: `Compound NSAID Toxicity: ${infoA.genericName} + ${infoB.genericName}`,
          description: `Combining two or more NSAIDs does not provide additional pain relief, but significantly escalates the risk of gastric ulcers, intestinal bleeding, and acute kidney impairment.`,
          clinicalRecommendation: `Avoid taking two systemic NSAIDs together. Use only one as prescribed, or consult your doctor for alternative multimodal analgesia.`,
          references: 'FDA Drug Safety Communication',
        });
      }

      // (C) ACE Inhibitor / ARB + Potassium Sparing Diuretic or Potassium
      else if (
        (hasClass(infoA, 'raas') && (hasClass(infoB, 'potassium_sparing') || hasClass(infoB, 'potassium_supplement'))) ||
        (hasClass(infoB, 'raas') && (hasClass(infoA, 'potassium_sparing') || hasClass(infoA, 'potassium_supplement')))
      ) {
        conflicts.push({
          id: `dd-hyperk-${medA.name}-${medB.name}`,
          type: 'drug_drug',
          severity: 'high',
          substanceA: medA.name,
          substanceB: medB.name,
          title: `Hyperkalemia Risk: ${infoA.genericName} + ${infoB.genericName}`,
          description: `Combining RAAS inhibitors with potassium-sparing agents or potassium supplements can cause dangerous blood potassium elevation (hyperkalemia), potentially triggering life-threatening cardiac arrhythmias.`,
          clinicalRecommendation: `Requires regular serum potassium and renal function monitoring by your physician.`,
          references: 'KDIGO Clinical Practice Guidelines',
        });
      }

      // (D) Serotonergic Toxicity (SSRIs / SNRIs + Tramadol)
      else if (
        (hasClass(infoA, 'serotonergic') && hasClass(infoB, 'serotonergic')) &&
        (infoA.genericName !== infoB.genericName)
      ) {
        conflicts.push({
          id: `dd-serotonin-${medA.name}-${medB.name}`,
          type: 'drug_drug',
          severity: 'critical',
          substanceA: medA.name,
          substanceB: medB.name,
          title: `Serotonin Syndrome Warning: ${infoA.genericName} + ${infoB.genericName}`,
          description: `Concurrent use of multiple serotonergic agents (${infoA.genericName} and ${infoB.genericName}) can trigger Serotonin Toxicity, presenting with tremors, agitation, hyperthermia, and neuromuscular rigidity.`,
          clinicalRecommendation: `Discuss with prescriber before combining. Watch for shivering, mental confusion, or sudden muscle spasms.`,
          references: 'Hunter Serotonin Toxicity Criteria',
        });
      }

      // (E) Statin + CYP3A4 Inhibitor (Clarithromycin / Azoles)
      else if (
        (hasClass(infoA, 'cyp3a4_substrate') && hasClass(infoB, 'cyp3a4_inhibitor')) ||
        (hasClass(infoB, 'cyp3a4_substrate') && hasClass(infoA, 'cyp3a4_inhibitor'))
      ) {
        conflicts.push({
          id: `dd-statin-${medA.name}-${medB.name}`,
          type: 'drug_drug',
          severity: 'high',
          substanceA: medA.name,
          substanceB: medB.name,
          title: `Statin Toxicity & Rhabdomyolysis Risk: ${infoA.genericName} + ${infoB.genericName}`,
          description: `Strong CYP3A4 inhibition dramatically slows statin clearance, raising blood concentration and risking severe muscle pain, breakdown (rhabdomyolysis), and kidney failure.`,
          clinicalRecommendation: `Statin should usually be paused temporarily while taking clarithromycin/azole courses. Consult your doctor.`,
          references: 'FDA Statin Safety Warnings',
        });
      }

      // (F) Beta Blocker + Non-DHP Calcium Channel Blocker
      else if (
        (hasClass(infoA, 'beta_blocker') && hasClass(infoB, 'non_dhp_ccb')) ||
        (hasClass(infoB, 'beta_blocker') && hasClass(infoA, 'non_dhp_ccb'))
      ) {
        conflicts.push({
          id: `dd-brady-${medA.name}-${medB.name}`,
          type: 'drug_drug',
          severity: 'high',
          substanceA: medA.name,
          substanceB: medB.name,
          title: `Severe Bradycardia & Heart Block: ${infoA.genericName} + ${infoB.genericName}`,
          description: `Additive negative dromotropic effects can cause severe slowing of the heart rate, conduction abnormalities, and pronounced hypotension.`,
          clinicalRecommendation: `Combination requires cardiologist supervision and heart rate monitoring.`,
          references: 'ACC/AHA Guidelines',
        });
      }

      // (G) Fluoroquinolones / Tetracyclines + Multivalent Cations (Calcium / Iron / Antacids)
      else if (
        ((hasClass(infoA, 'fluoroquinolone') || hasClass(infoA, 'tetracycline')) && hasClass(infoB, 'multivalent_cation')) ||
        ((hasClass(infoB, 'fluoroquinolone') || hasClass(infoB, 'tetracycline')) && hasClass(infoA, 'multivalent_cation'))
      ) {
        conflicts.push({
          id: `dd-chelate-${medA.name}-${medB.name}`,
          type: 'drug_drug',
          severity: 'moderate',
          substanceA: medA.name,
          substanceB: medB.name,
          title: `Reduced Antibiotic Absorption (Chelation): ${infoA.genericName} + ${infoB.genericName}`,
          description: `Cations bind directly to ${infoA.genericName} in the gut, decreasing antibiotic absorption by up to 90% and risking therapeutic failure.`,
          clinicalRecommendation: `Separate administration by at least 2 to 4 hours. Take antibiotic first, or reschedule the mineral supplement.`,
          references: 'Clinical Pharmacokinetics Guidance',
        });
      }

      // (H) Methotrexate + NSAIDs
      else if (
        (hasClass(infoA, 'antimetabolite') && hasClass(infoB, 'nsaid')) ||
        (hasClass(infoB, 'antimetabolite') && hasClass(infoA, 'nsaid'))
      ) {
        conflicts.push({
          id: `dd-mtx-${medA.name}-${medB.name}`,
          type: 'drug_drug',
          severity: 'high',
          substanceA: medA.name,
          substanceB: medB.name,
          title: `Severe Methotrexate Toxicity: ${infoA.genericName} + ${infoB.genericName}`,
          description: `NSAIDs reduce renal elimination of Methotrexate, potentially causing life-threatening bone marrow suppression, leukopenia, and hepatic toxicity.`,
          clinicalRecommendation: `Do not take OTC NSAIDs with methotrexate without direct rheumatologist guidance.`,
          references: 'EULAR Clinical Recommendations',
        });
      }
    }
  }

  // 3. FOOD & LIFESTYLE PRECAUTIONS
  for (const med of allMedsToCheck) {
    const info = resolveDrugInfo(med.name);
    if (info.classes.includes('statin') && info.classes.includes('cyp3a4_substrate')) {
      foodWarnings.add(`${info.genericName}: Avoid large amounts of grapefruit juice, which inhibits gut CYP3A4 enzymes and raises medication levels.`);
    }
    if (info.classes.includes('fluoroquinolone') || info.classes.includes('tetracycline')) {
      foodWarnings.add(`${info.genericName}: Do not take with dairy milk or calcium-fortified juice simultaneously; separate by at least 2 hours.`);
    }
    if (info.classes.includes('vka')) {
      foodWarnings.add(`${info.genericName} (Warfarin): Maintain consistent dietary intake of Vitamin K-rich green leafy vegetables (spinach, kale) to avoid INR fluctuations.`);
    }
    if (info.classes.includes('nitroimidazole')) {
      foodWarnings.add(`${info.genericName} (Metronidazole): Strictly avoid alcohol during treatment and for 48 hours after; triggers severe flushing, nausea, and rapid heart rate.`);
    }
    if (info.classes.includes('iron_supplement')) {
      foodWarnings.add(`${info.genericName}: Best absorbed on an empty stomach or with Vitamin C (orange juice). Avoid taking with tea, coffee, or calcium.`);
    }
    if (info.classes.includes('nsaid')) {
      foodWarnings.add(`${info.genericName}: Always take with food or milk to minimize gastric mucosa irritation.`);
    }
  }

  if (conflicts.length === 0 && allMedsToCheck.length > 1) {
    safeNotes.push(`Analyzed ${allMedsToCheck.length} active medications: No high-risk pharmacokinetic or pharmacodynamic interactions identified.`);
  }

  // Determine overall risk
  let overallRisk: RegimenSafetyReport['overallRisk'] = 'safe';
  if (conflicts.some((c) => c.severity === 'critical')) {
    overallRisk = 'critical';
  } else if (conflicts.some((c) => c.severity === 'high')) {
    overallRisk = 'high';
  } else if (conflicts.some((c) => c.severity === 'moderate')) {
    overallRisk = 'moderate';
  } else if (conflicts.some((c) => c.severity === 'low')) {
    overallRisk = 'low';
  }

  return {
    overallRisk,
    totalCheckedMedications: allMedsToCheck.length,
    totalCheckedAllergies: allergies.length,
    conflicts,
    foodAndLifestyleWarnings: Array.from(foodWarnings),
    safeCombinationsNotes: safeNotes,
    analyzedAt: new Date().toISOString(),
    source: 'clinical-rules',
  };
}
