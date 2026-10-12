import { describe, it, expect } from 'vitest';
import { analyzeWithClinicalRules } from '../src/services/ai/conflictRules';

describe('AI Drug-Drug & Allergy Conflict Checker', () => {
  it('detects critical drug-allergy cross-reactivity (Penicillin allergy with Amoxicillin / Augmentin)', () => {
    const report = analyzeWithClinicalRules(
      [{ name: 'Augmentin 625mg', status: 'current' }],
      [{ allergen: 'Penicillin', reportedReaction: 'Severe Anaphylaxis and hives' }]
    );

    expect(report.overallRisk).toBe('critical');
    expect(report.conflicts.length).toBeGreaterThan(0);
    const allergyConflict = report.conflicts.find((c) => c.type === 'drug_allergy');
    expect(allergyConflict).toBeDefined();
    expect(allergyConflict?.severity).toBe('critical');
    expect(allergyConflict?.description).toContain('penicillin-class antibiotic');
  });

  it('detects critical drug-drug bleeding risk (Warfarin + Aspirin)', () => {
    const report = analyzeWithClinicalRules(
      [
        { name: 'Warfarin 5mg', status: 'current' },
        { name: 'Aspirin 81mg', status: 'current' },
      ],
      []
    );

    expect(report.overallRisk).toBe('critical');
    const ddConflict = report.conflicts.find(
      (c) => c.type === 'drug_drug' && c.severity === 'critical'
    );
    expect(ddConflict).toBeDefined();
    expect(ddConflict?.title).toContain('Major Bleeding Risk');
    expect(ddConflict?.description).toContain('blood-thinning agents');
  });

  it('detects compound NSAID toxicity when combining two NSAIDs', () => {
    const report = analyzeWithClinicalRules(
      [
        { name: 'Ibuprofen 400mg', status: 'current' },
        { name: 'Naproxen 250mg', status: 'current' },
      ],
      []
    );

    expect(report.overallRisk).toBe('high');
    const nsaidConflict = report.conflicts.find((c) => c.title.includes('Compound NSAID Toxicity'));
    expect(nsaidConflict).toBeDefined();
    expect(nsaidConflict?.severity).toBe('high');
  });

  it('detects hyperkalemia risk between ACE inhibitors and potassium-sparing diuretics', () => {
    const report = analyzeWithClinicalRules(
      [
        { name: 'Lisinopril 10mg', status: 'current' },
        { name: 'Spironolactone 25mg', status: 'current' },
      ],
      []
    );

    expect(report.overallRisk).toBe('high');
    const hyperkConflict = report.conflicts.find((c) => c.title.includes('Hyperkalemia Risk'));
    expect(hyperkConflict).toBeDefined();
  });

  it('returns safe regimen for compatible medications without allergies', () => {
    const report = analyzeWithClinicalRules(
      [
        { name: 'Paracetamol 500mg', status: 'current' },
        { name: 'Omeprazole 20mg', status: 'current' },
      ],
      []
    );

    expect(report.overallRisk).toBe('safe');
    expect(report.conflicts.length).toBe(0);
  });

  it('generates specific food and lifestyle precautions', () => {
    const report = analyzeWithClinicalRules(
      [
        { name: 'Atorvastatin 20mg', status: 'current' },
        { name: 'Metronidazole 400mg', status: 'current' },
      ],
      []
    );

    expect(report.foodAndLifestyleWarnings.some((w) => w.toLowerCase().includes('grapefruit'))).toBe(true);
    expect(report.foodAndLifestyleWarnings.some((w) => w.toLowerCase().includes('alcohol'))).toBe(true);
  });

  it('simulates a candidate drug against current regimen', () => {
    const candidateReport = analyzeWithClinicalRules(
      [{ name: 'Warfarin 5mg', status: 'current' }],
      [],
      { name: 'Brufen' } // Brufen is Ibuprofen brand
    );

    expect(candidateReport.overallRisk).toBe('critical');
    expect(candidateReport.conflicts.some((c) => c.title.includes('Major Bleeding Risk'))).toBe(true);
  });
});
