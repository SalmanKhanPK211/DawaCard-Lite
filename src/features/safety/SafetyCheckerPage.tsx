import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Search,
  Pill,
  Utensils,
  BookOpen,
  Info,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { storageService } from '../../services/storage/db';
import { checkSafetyInteractions } from '../../services/ai/aiService';
import { Medication } from '../../types/medication';
import { AllergyRecord } from '../../types/allergy';
import { ConflictItem, RegimenSafetyReport } from '../../types/safety';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { DisclaimerBanner } from '../../components/common/DisclaimerBanner';

export const SafetyCheckerPage: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergies, setAllergies] = useState<AllergyRecord[]>([]);
  const [report, setReport] = useState<RegimenSafetyReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'drug_drug' | 'drug_allergy' | 'food_lifestyle'>('all');

  // Interactive drug simulator state
  const [simulatedDrug, setSimulatedDrug] = useState('');
  const [simulationReport, setSimulationReport] = useState<RegimenSafetyReport | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const loadDataAndAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const meds = await storageService.getMedications();
      const allg = await storageService.getAllergies();
      setMedications(meds);
      setAllergies(allg);

      const safetyReport = await checkSafetyInteractions(meds, allg);
      setReport(safetyReport);
    } catch (err) {
      console.error('Failed to analyze safety interactions:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    loadDataAndAnalyze();
  }, []);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedDrug.trim()) return;

    setIsSimulating(true);
    try {
      const simResult = await checkSafetyInteractions(
        medications,
        allergies,
        { name: simulatedDrug.trim() }
      );
      setSimulationReport(simResult);
    } catch (err) {
      console.error('Simulation check failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const clearSimulation = () => {
    setSimulatedDrug('');
    setSimulationReport(null);
  };

  const getSeverityBadge = (severity: ConflictItem['severity']) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="danger" className="uppercase font-bold tracking-wider text-[10px]">Critical Risk</Badge>;
      case 'high':
        return <Badge variant="warning" className="bg-orange-100 text-orange-900 border-orange-300 uppercase font-bold tracking-wider text-[10px]">High Caution</Badge>;
      case 'moderate':
        return <Badge variant="warning" className="uppercase font-semibold tracking-wider text-[10px]">Moderate Caution</Badge>;
      default:
        return <Badge variant="info" className="uppercase font-medium tracking-wider text-[10px]">Low / Minor</Badge>;
    }
  };

  const filteredConflicts = (report?.conflicts || []).filter((c) => {
    if (activeTab === 'all') return true;
    return c.type === activeTab;
  });

  const drugDrugCount = (report?.conflicts || []).filter((c) => c.type === 'drug_drug').length;
  const allergyCount = (report?.conflicts || []).filter((c) => c.type === 'drug_allergy').length;
  const foodCount = report?.foodAndLifestyleWarnings?.length || 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              AI Drug & Allergy Safety Checker
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-[#0F766E] border border-teal-200">
              <Sparkles className="w-3 h-3 text-[#0F766E]" />
              AI Powered
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Clinical pharmacovigilance engine checking active medications and recorded allergies for dangerous contraindications.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<RefreshCw className={`w-4 h-4 text-[#0F766E] ${isAnalyzing ? 'animate-spin' : ''}`} />}
          onClick={loadDataAndAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Re-scan Regimen'}
        </Button>
      </div>

      <DisclaimerBanner />

      {/* Regimen Status Banner */}
      {report && (
        <div
          className={`p-6 rounded-2xl border transition-all shadow-xs ${
            report.overallRisk === 'critical'
              ? 'bg-red-50/70 border-red-200 text-red-950'
              : report.overallRisk === 'high'
              ? 'bg-orange-50/70 border-orange-200 text-orange-950'
              : report.overallRisk === 'moderate'
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-xl shrink-0 ${
                  report.overallRisk === 'critical'
                    ? 'bg-red-600 text-white shadow-sm'
                    : report.overallRisk === 'high'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : report.overallRisk === 'moderate'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-[#0F766E] text-white shadow-sm'
                }`}
              >
                {report.overallRisk === 'safe' ? (
                  <ShieldCheck className="w-8 h-8" />
                ) : (
                  <ShieldAlert className="w-8 h-8" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold">
                    {report.overallRisk === 'safe'
                      ? 'Regimen Verified Safe: No High-Risk Interactions'
                      : report.overallRisk === 'critical'
                      ? 'Critical Clinical Alert: Immediate Attention Required'
                      : report.overallRisk === 'high'
                      ? 'High Caution: Significant Drug Interactions Found'
                      : 'Moderate Caution: Interaction Advisory'}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-2xl leading-relaxed">
                  {report.overallRisk === 'safe'
                    ? `Analyzed ${report.totalCheckedMedications} active medications against ${report.totalCheckedAllergies} allergy records. No cross-sensitivities or dangerous pharmacokinetic combinations were identified.`
                    : `Identified ${report.conflicts.length} interaction conflict(s) between your active medications and allergy profile. Please consult your physician before altering your doses.`}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs opacity-75">
                  <span>Checked: <strong>{report.totalCheckedMedications} Medications</strong></span>
                  <span>•</span>
                  <span>Checked: <strong>{report.totalCheckedAllergies} Allergies</strong></span>
                  <span>•</span>
                  <span>
                    Analysis: <strong>{report.source === 'hybrid' ? 'Google Gemini AI + Clinical Rules' : 'Clinical Rules Engine'}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-current/15 gap-2 shrink-0">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Overall Safety</span>
              <span
                className={`text-sm sm:text-base font-extrabold px-3 py-1 rounded-lg ${
                  report.overallRisk === 'safe'
                    ? 'bg-emerald-100 text-emerald-800'
                    : report.overallRisk === 'critical'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {report.overallRisk.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Prospective Drug Simulation Tool */}
      <Card className="border-teal-200/80 bg-linear-to-r from-teal-50/40 via-white to-white p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#0F766E]" />
          <h3 className="text-sm font-bold text-slate-900">
            Simulate a New Medication Before Taking It
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Planning to start an over-the-counter medicine or new prescription? Test it here to verify if it conflicts with your existing medications or allergies.
        </p>

        <form onSubmit={handleSimulate} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="e.g. Aspirin, Brufen, Augmentin, Ciprofloxacin, Panadol..."
              value={simulatedDrug}
              onChange={(e) => setSimulatedDrug(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] bg-white"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={!simulatedDrug.trim() || isSimulating}
            className="sm:w-auto w-full"
          >
            {isSimulating ? 'Checking...' : 'Check Interaction'}
          </Button>
          {simulationReport && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSimulation}
            >
              Clear
            </Button>
          )}
        </form>

        {/* Simulation Results Box */}
        {simulationReport && (
          <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-[#0F766E]" />
                Simulation Result for "{simulatedDrug}":
              </span>
              {simulationReport.conflicts.length === 0 ? (
                <Badge variant="success" className="text-xs">
                  Safe to Add
                </Badge>
              ) : (
                getSeverityBadge(simulationReport.conflicts[0].severity)
              )}
            </div>

            {simulationReport.conflicts.length === 0 ? (
              <p className="text-xs text-slate-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  No direct interactions or allergy cross-sensitivities identified between <strong>{simulatedDrug}</strong> and your current medication list. Always verify with your pharmacist.
                </span>
              </p>
            ) : (
              <div className="space-y-2">
                {simulationReport.conflicts.map((simC, idx) => (
                  <div key={idx} className="p-3 bg-red-50/60 border border-red-200 rounded-lg text-xs space-y-1">
                    <div className="font-semibold text-red-950 flex items-center justify-between">
                      <span>{simC.title}</span>
                      {getSeverityBadge(simC.severity)}
                    </div>
                    <p className="text-red-900">{simC.description}</p>
                    <p className="text-slate-700 font-medium pt-1">
                      <strong>Recommendation:</strong> {simC.clinicalRecommendation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-[#0F766E] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>All Advisories</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10">
            {(report?.conflicts?.length || 0) + foodCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('drug_drug')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'drug_drug'
              ? 'bg-[#0F766E] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Drug-Drug</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10">
            {drugDrugCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('drug_allergy')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'drug_allergy'
              ? 'bg-[#0F766E] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Allergy Alerts</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10">
            {allergyCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('food_lifestyle')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'food_lifestyle'
              ? 'bg-[#0F766E] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Food & Timing</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10">
            {foodCount}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'food_lifestyle' ? (
        /* Food & Lifestyle Tab Content */
        <div className="space-y-3">
          {report?.foodAndLifestyleWarnings && report.foodAndLifestyleWarnings.length > 0 ? (
            report.foodAndLifestyleWarnings.map((warning, idx) => (
              <Card key={idx} className="p-4 border-amber-200 bg-amber-50/40">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-950">Dietary & Administration Advisory</h4>
                    <p className="text-xs text-amber-900 mt-1 leading-relaxed">{warning}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center text-slate-500">
              <Utensils className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">No special dietary or food interactions flagged for your active medications.</p>
            </Card>
          )}
        </div>
      ) : (
        /* Conflict Cards List */
        <div className="space-y-4">
          {filteredConflicts.length > 0 ? (
            filteredConflicts.map((conflict) => (
              <Card
                key={conflict.id}
                className={`p-5 transition-all ${
                  conflict.severity === 'critical'
                    ? 'border-red-300 bg-linear-to-r from-red-50/40 via-white to-white'
                    : conflict.severity === 'high'
                    ? 'border-orange-300 bg-linear-to-r from-orange-50/30 via-white to-white'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        conflict.severity === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : conflict.severity === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{conflict.title}</h3>
                        {getSeverityBadge(conflict.severity)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="font-semibold text-slate-700">{conflict.substanceA}</span>
                        {conflict.substanceB && (
                          <>
                            <span>↔</span>
                            <span className="font-semibold text-slate-700">{conflict.substanceB}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 space-y-2.5 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                    <span className="font-bold text-slate-900 block mb-0.5">Clinical Mechanism & Risk:</span>
                    <p className="leading-relaxed">{conflict.description}</p>
                  </div>

                  <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-100 text-teal-950">
                    <span className="font-bold text-[#0F766E] block mb-0.5">Recommended Action:</span>
                    <p className="leading-relaxed">{conflict.clinicalRecommendation}</p>
                  </div>

                  {conflict.references && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                      <BookOpen className="w-3 h-3" />
                      <span>Reference: {conflict.references}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {medications.length === 0
                  ? 'No Active Medications Recorded'
                  : 'Zero Interaction Conflicts Identified'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                {medications.length === 0
                  ? 'Add your current medications or scan a prescription to run automated clinical pharmacovigilance checks.'
                  : 'Your active medication regimen and allergy profile have been evaluated and have 0 known critical clashes.'}
              </p>
            </Card>
          )}

          {/* Safe combination positive notes */}
          {report?.safeCombinationsNotes && report.safeCombinationsNotes.length > 0 && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-emerald-950">Verified Combinations</span>
                <p className="mt-0.5">{report.safeCombinationsNotes.join(' ')}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
