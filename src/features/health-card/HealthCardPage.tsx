import React, { useState, useEffect } from 'react';
import { generateBrandedQRCode } from '../../utils/qrLogo';
import { Printer, Pill, ShieldAlert, QrCode, Calendar, Layers } from 'lucide-react';
import { Medication } from '../../types/medication';
import { AllergyRecord, AllergyStatus } from '../../types/allergy';
import { PatientProfile } from '../../types/patient';
import { storageService } from '../../services/storage/db';
import { Button } from '../../components/ui/Button';
import { PatientProfileModal } from '../patient/PatientProfileModal';
import { DailyScheduleGrid } from '../../components/common/DailyScheduleGrid';
import { EmergencyQRModal } from './EmergencyQRModal';
import { generateEmergencyPayload, getEmergencyUrl } from '../../utils/qrPayload';
import { SEO } from '../../components/common/SEO';

export const HealthCardPage: React.FC = () => {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergies, setAllergies] = useState<AllergyRecord[]>([]);
  const [allergyStatus, setAllergyStatusState] = useState<AllergyStatus>('unknown');
  const [includeDiscontinued, setIncludeDiscontinued] = useState(false);
  const [includeScheduleGrid, setIncludeScheduleGrid] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [printedQrUrl, setPrintedQrUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const loadHealthCardData = async () => {
    setIsLoading(true);
    try {
      const p = await storageService.getPatientProfile();
      const m = await storageService.getMedications();
      const a = await storageService.getAllergies();
      const s = await storageService.getAllergyStatus();

      setPatient(p);
      setMedications(m);
      setAllergies(a);
      setAllergyStatusState(s);

      // Generate compact emergency QR code for the print page
      const payload = generateEmergencyPayload(p, m, a, s);
      const url = getEmergencyUrl(payload);
      generateBrandedQRCode(url, 200)
        .then(setPrintedQrUrl)
        .catch(console.error);
    } catch (err) {
      console.error('Failed to load health card data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHealthCardData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const displayedMedications = includeDiscontinued
    ? medications
    : medications.filter((m) => m.status === 'current');

  const generatedDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const lastUpdatedMed = medications.reduce((latest, m) => {
    const d = new Date(m.updatedAt).getTime();
    return d > latest ? d : latest;
  }, 0);

  const lastUpdatedText = lastUpdatedMed
    ? new Date(lastUpdatedMed).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : generatedDate;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <SEO
        title="Personal Health Card"
        titleUr="ایمرجنسی ہیلتھ کارڈ"
        description="Generate and print a clean medication and allergy summary with instant EMT emergency QR code."
        descriptionUr="پرنٹ کے قابل A4 میڈیکل سمری کارڈ اور ریسکیو عملے کے لیے ایمرجنسی کیو آر کوڈ۔"
        canonicalPath="/health-card"
      />
      {/* Top Action Header (No Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personal Health Card</h1>
          <p className="text-sm text-slate-500">
            Generate and print a clean medication and allergy summary to take to appointments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<QrCode className="w-4 h-4 text-[#0F766E]" />}
            onClick={() => setIsQRModalOpen(true)}
          >
            Emergency QR Pass
          </Button>

          <Button
            size="md"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Option Toggles Toolbar (No Print) */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 no-print">
        <span className="font-bold text-slate-900">Print Options:</span>

        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeScheduleGrid}
            onChange={(e) => setIncludeScheduleGrid(e.target.checked)}
            className="rounded text-[#0F766E] focus:ring-[#0F766E]"
          />
          <span>Include 4-Box Daily Pill Organizer Grid</span>
        </label>

        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeDiscontinued}
            onChange={(e) => setIncludeDiscontinued(e.target.checked)}
            className="rounded text-[#0F766E] focus:ring-[#0F766E]"
          />
          <span>Include Discontinued Medications</span>
        </label>
      </div>

      {/* PRINTABLE HEALTH CARD SUMMARY CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-300 p-8 shadow-sm print-page space-y-6">
        {/* Card Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white font-bold no-print">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                Medication & Health Summary
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Patient-Maintained Personal Health Record • DawaCard Lite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Embedded Printable Offline QR Code */}
            {printedQrUrl && (
              <div className="flex items-center gap-2 text-right">
                <div>
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-tighter block">
                    Offline Emergency QR
                  </span>
                  <span className="text-[9px] text-slate-500 block">
                    Scan for instant record
                  </span>
                </div>
                <img
                  src={printedQrUrl}
                  alt="Offline Emergency QR"
                  className="w-16 h-16 border border-slate-300 rounded p-0.5 bg-white shrink-0"
                />
              </div>
            )}

            <div className="text-right text-xs text-slate-600 space-y-0.5 border-l border-slate-200 pl-3">
              <p>
                <strong className="text-slate-900">Generated:</strong> {generatedDate}
              </p>
              <p>
                <strong className="text-slate-900">Last Updated:</strong> {lastUpdatedText}
              </p>
            </div>
          </div>
        </div>

        {/* Patient Profile Section */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Patient Identification
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              {patient?.displayName || 'Name Not Provided'}
            </h3>
            {patient?.dateOfBirth && (
              <p className="text-xs text-slate-600">
                <strong>Date of Birth:</strong> {patient.dateOfBirth}
              </p>
            )}
            {patient?.notes && (
              <p className="text-xs text-slate-500 italic mt-1 font-normal">
                Notes: {patient.notes}
              </p>
            )}
          </div>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="text-xs font-semibold text-[#0F766E] hover:underline no-print cursor-pointer"
          >
            {patient ? 'Edit Patient Info' : '+ Add Patient Info'}
          </button>
        </div>

        {/* Allergy Summary Section */}
        <div className="border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Allergy & Reaction Record
            </h3>
            <span className="text-xs text-slate-500">
              Status:{' '}
              <strong className="text-slate-900">
                {allergyStatus === 'known_allergies'
                  ? 'Known Allergies Recorded'
                  : allergyStatus === 'no_known_allergies'
                  ? 'No Known Allergies (NKA)'
                  : 'Unknown / Not Recorded'}
              </strong>
            </span>
          </div>

          {allergyStatus === 'no_known_allergies' ? (
            <p className="text-xs text-emerald-800 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              ✓ Patient explicitly reports NO KNOWN DRUG ALLERGIES (NKA).
            </p>
          ) : allergyStatus === 'unknown' ? (
            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              ⚠️ Allergy status has not been specified or recorded yet.
            </p>
          ) : allergies.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No specific allergens entered.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allergies.map((a) => (
                <div
                  key={a.id}
                  className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-200 text-xs"
                >
                  <strong className="text-amber-950 block text-sm">{a.allergen}</strong>
                  {a.reportedReaction && (
                    <p className="text-amber-900 mt-0.5">
                      <strong>Reaction:</strong> {a.reportedReaction}
                    </p>
                  )}
                  {a.notes && <p className="text-amber-800 text-[11px] italic mt-0.5">{a.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Medications Table / List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#0F766E]" />
              Medication List ({displayedMedications.length})
            </h3>
          </div>

          {displayedMedications.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed rounded-xl">
              No medications recorded to display on card.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <th className="py-2.5 px-3">Medication & Strength</th>
                    <th className="py-2.5 px-3">Form & Route</th>
                    <th className="py-2.5 px-3">Instructions / Dose</th>
                    <th className="py-2.5 px-3">Frequency</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {displayedMedications.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {med.name}
                        {med.strength && (
                          <span className="block font-normal text-slate-600 text-[11px]">
                            {med.strength}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {med.dosageForm || '—'}
                        {med.route && <span className="block text-[11px] text-slate-500">{med.route}</span>}
                      </td>
                      <td className="py-3 px-3 text-slate-800 max-w-xs leading-relaxed">
                        {med.prescribedInstructions || '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {med.frequency || '—'}
                        {med.duration && (
                          <span className="block text-[11px] text-slate-500">{med.duration}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            med.status === 'current'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                          }`}
                        >
                          {med.status === 'current' ? 'Current' : 'Discontinued'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 4-Box Daily Pill Schedule Organizer Grid */}
        {includeScheduleGrid && displayedMedications.length > 0 && (
          <div className="pt-2">
            <DailyScheduleGrid
              medications={displayedMedications}
              title="Daily Pill Schedule (4-Box Organizer View)"
            />
          </div>
        )}

        {/* Printable Mandatory Medical Disclaimer Footer */}
        <div className="border-t-2 border-slate-900 pt-4 text-[11px] text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <p className="font-bold text-slate-900">
            NOTICE TO HEALTHCARE PROVIDERS & PHARMACISTS:
          </p>
          <p className="leading-relaxed">
            This card is a patient-maintained summary intended for convenience during appointments. It does not replace an official electronic medical record or official prescription. Please verify all medications, strengths, and dosage instructions directly with the patient and prescribing clinician.
          </p>
        </div>
      </div>

      {/* Modals */}
      <PatientProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={patient}
        onProfileSaved={(updated) => {
          setPatient(updated);
        }}
      />

      <EmergencyQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        patient={patient}
        medications={medications}
        allergies={allergies}
        allergyStatus={allergyStatus}
      />
    </div>
  );
};
