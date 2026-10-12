import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Sparkles, ChevronRight, AlertTriangle } from 'lucide-react';
import { storageService } from '../../services/storage/db';
import { checkSafetyInteractions } from '../../services/ai/aiService';
import { RegimenSafetyReport } from '../../types/safety';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const SafetyAlertWidget: React.FC = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState<RegimenSafetyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const runCheck = async () => {
      try {
        const meds = await storageService.getMedications();
        const allg = await storageService.getAllergies();
        const res = await checkSafetyInteractions(meds, allg);
        if (isMounted) setReport(res);
      } catch (err) {
        console.error('Safety alert widget check failed:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    runCheck();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || !report) return null;

  const isSafe = report.overallRisk === 'safe';
  const conflictCount = report.conflicts.length;

  return (
    <Card
      className={`p-4 transition-all ${
        isSafe
          ? 'border-emerald-200/80 bg-linear-to-r from-emerald-50/50 via-white to-white'
          : report.overallRisk === 'critical'
          ? 'border-red-300 bg-linear-to-r from-red-50/50 via-white to-white ring-1 ring-red-400/20'
          : 'border-amber-300 bg-linear-to-r from-amber-50/50 via-white to-white ring-1 ring-amber-400/20'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isSafe
                ? 'bg-emerald-100 text-[#0F766E]'
                : report.overallRisk === 'critical'
                ? 'bg-red-100 text-red-600'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isSafe ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {isSafe
                  ? 'Drug Safety & Compatibility Verified'
                  : `${conflictCount} Potential Clinical Conflict${conflictCount > 1 ? 's' : ''} Flagged`}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-[#0F766E] border border-teal-200 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                AI Monitored
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isSafe
                ? `0 interactions detected across ${report.totalCheckedMedications} medications and ${report.totalCheckedAllergies} allergy records.`
                : `${report.conflicts[0]?.title}. Review clinical guidance before administration.`}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant={isSafe ? 'outline' : 'primary'}
          onClick={() => navigate('/safety')}
          className={`shrink-0 text-xs ${!isSafe ? 'bg-red-600 hover:bg-red-700 border-red-600 text-white' : ''}`}
        >
          <span>{isSafe ? 'View Safety Report' : 'Review Conflicts'}</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </Card>
  );
};
