import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  ShieldAlert,
  FileText,
  ScanLine,
  Plus,
  ArrowRight,
  BookOpen,
  QrCode,
} from 'lucide-react';
import { Medication } from '../../types/medication';
import { AllergyRecord, AllergyStatus } from '../../types/allergy';
import { PatientProfile } from '../../types/patient';
import { storageService } from '../../services/storage/db';
import { loadSampleData } from '../../utils/sampleData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LocalDataBanner } from '../../components/common/LocalDataBanner';
import { DisclaimerBanner } from '../../components/common/DisclaimerBanner';
import { DailyScheduleGrid } from '../../components/common/DailyScheduleGrid';
import { EmergencyQRModal } from '../health-card/EmergencyQRModal';

export interface DashboardPageProps {
  onAddMedicationClick: () => void;
  onScanClick: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onAddMedicationClick,
  onScanClick,
}) => {
  const navigate = useNavigate();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergies, setAllergies] = useState<AllergyRecord[]>([]);
  const [allergyStatus, setAllergyStatusState] = useState<AllergyStatus>('unknown');
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const m = await storageService.getMedications();
      const a = await storageService.getAllergies();
      const s = await storageService.getAllergyStatus();
      const p = await storageService.getPatientProfile();

      setMedications(m);
      setAllergies(a);
      setAllergyStatusState(s);
      setPatient(p);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    try {
      await loadSampleData();
      await loadData();
    } catch (err) {
      console.error('Failed to load sample data:', err);
    } finally {
      setIsLoadingSample(false);
    }
  };

  const currentMeds = medications.filter((m) => m.status === 'current');
  const discontinuedMeds = medications.filter((m) => m.status === 'discontinued');
  const recentMeds = medications.slice(0, 5);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0F766E] to-[#115E59] text-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-emerald-100 uppercase tracking-wider">
              Cloud Health Record • Supabase
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Your medication information, organized.
            </h1>
            <p className="text-sm text-emerald-100 max-w-xl leading-relaxed">
              Maintain an organized list of current prescriptions and allergies, scan paper prescriptions with AI, and generate a printable card for appointments.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0">
            <button
              onClick={onAddMedicationClick}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-[#0F766E] font-bold text-sm shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#0F766E] shrink-0" />
              <span className="text-[#0F766E]">Add Medication</span>
            </button>
            <button
              onClick={onScanClick}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0a524c] hover:bg-[#08433e] text-white border border-emerald-400/40 font-semibold text-sm transition-colors cursor-pointer shadow-sm"
            >
              <ScanLine className="w-4 h-4 text-white shrink-0" />
              <span className="text-white">Scan Prescription (AI)</span>
            </button>
          </div>
        </div>
      </div>

      <LocalDataBanner onDataChanged={loadData} />
      <DisclaimerBanner />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Medications
            </span>
            <div className="text-3xl font-bold text-slate-900">{currentMeds.length}</div>
            <p className="text-xs text-slate-500">
              {discontinuedMeds.length} discontinued in record
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0F766E] flex items-center justify-center">
            <Pill className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Allergy Record Status
            </span>
            <div className="text-base font-bold text-slate-900 truncate max-w-[130px]">
              {allergyStatus === 'known_allergies'
                ? `${allergies.length} Listed Allergen${allergies.length === 1 ? '' : 's'}`
                : allergyStatus === 'no_known_allergies'
                ? 'No Known Allergies'
                : 'Status Not Set'}
            </div>
            <p className="text-xs text-slate-500">
              {allergyStatus === 'known_allergies'
                ? 'User reported allergies'
                : allergyStatus === 'no_known_allergies'
                ? 'Explicitly confirmed NKA'
                : 'Click to record status'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </Card>

        <Card
          className="p-5 flex items-center justify-between cursor-pointer hover:border-[#0F766E]"
          onClick={() => navigate('/health-card')}
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Printable Summary
            </span>
            <div className="text-base font-bold text-[#0F766E] flex items-center gap-1">
              <span>Health Card</span>
              <ArrowRight className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-500">A4 PDF & Printout</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </Card>

        <Card
          className="p-5 flex items-center justify-between cursor-pointer hover:border-[#0F766E]"
          onClick={() => setIsQRModalOpen(true)}
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Offline Pass
            </span>
            <div className="text-base font-bold text-slate-900 flex items-center gap-1">
              <span>Emergency QR</span>
              <ArrowRight className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-500">Instant scan for EMTs</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* 4-Box Daily Pill Schedule Organizer Grid on Dashboard */}
      {currentMeds.length > 0 && (
        <Card className="p-5 border-slate-200">
          <DailyScheduleGrid
            medications={currentMeds}
            title="Daily Pill Schedule (4-Box Organizer View)"
          />
        </Card>
      )}

      {/* First-Time User Empty State */}
      {medications.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-slate-300 bg-slate-50/50 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0F766E] flex items-center justify-center mx-auto">
            <Pill className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">No medication records saved yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Start by manually adding your medications or scan a prescription image with AI extraction. You can also explore fictional sample data.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={onAddMedicationClick}
            >
              Add First Medication
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<ScanLine className="w-4 h-4 text-[#0F766E]" />}
              onClick={onScanClick}
            >
              Scan Prescription
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<BookOpen className="w-4 h-4 text-slate-600" />}
              isLoading={isLoadingSample}
              onClick={handleLoadSample}
            >
              Explore Sample Data
            </Button>
          </div>
        </Card>
      ) : (
        /* Recent Medication Records */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recently Updated Medications</h2>
              <p className="text-xs text-slate-500">
                Your recent active and discontinued medication records
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/medications')}
            >
              View All ({medications.length})
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentMeds.map((med) => (
              <Card key={med.id} className="p-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{med.name}</h3>
                      {med.strength && (
                        <span className="text-xs text-slate-500">{med.strength}</span>
                      )}
                    </div>
                    <Badge variant={med.status}>
                      {med.status === 'current' ? 'Current' : 'Discontinued'}
                    </Badge>
                  </div>

                  {med.prescribedInstructions && (
                    <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 font-medium">
                      {med.prescribedInstructions}
                    </p>
                  )}

                  {med.timesOfDay && med.timesOfDay.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {med.timesOfDay.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-[#0F766E] border border-emerald-200 capitalize"
                        >
                          {t.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mt-3">
                  <span className="capitalize">{med.dosageForm || 'Medication'}</span>
                  <span>
                    Updated {new Date(med.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Emergency QR Modal */}
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
