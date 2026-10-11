import React from 'react';
import { ShieldAlert, ShieldCheck, HelpCircle, Pill, AlertTriangle, X } from 'lucide-react';
import { EmergencyDataPayload } from '../../utils/qrPayload';
import { Button } from '../../components/ui/Button';

export interface EmergencyViewerModalProps {
  payload: EmergencyDataPayload;
  onClose: () => void;
}

export const EmergencyViewerModal: React.FC<EmergencyViewerModalProps> = ({
  payload,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden space-y-4 my-8">
        {/* Urgent Header */}
        <div className="bg-red-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-wide uppercase">
                Emergency Health Record
              </h2>
              <span className="text-[11px] text-red-100">
                Scanned via DawaCard Offline QR Pass
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-red-100 hover:text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-slate-800">
          {/* Patient Header */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Patient Name
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {payload.p || 'Name Not Specified'}
              </h3>
            </div>
            {payload.dob && (
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Date of Birth
                </span>
                <span className="text-xs font-semibold text-slate-700">{payload.dob}</span>
              </div>
            )}
          </div>

          {/* Allergy Critical Section */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              payload.as === 'known_allergies'
                ? 'bg-red-50 border-red-200 text-red-950'
                : payload.as === 'no_known_allergies'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            {payload.as === 'known_allergies' ? (
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            ) : payload.as === 'no_known_allergies' ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <HelpCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h4 className="font-bold text-sm">
                {payload.as === 'known_allergies'
                  ? 'CRITICAL ALLERGY ALERT'
                  : payload.as === 'no_known_allergies'
                  ? 'NO KNOWN ALLERGIES (NKA)'
                  : 'Allergy Status Unknown'}
              </h4>
              {payload.as === 'known_allergies' && payload.al.length > 0 ? (
                <ul className="list-disc pl-4 text-xs space-y-0.5 font-semibold text-red-900">
                  {payload.al.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              ) : payload.as === 'no_known_allergies' ? (
                <p className="text-xs text-emerald-800">
                  Patient explicitly reports no known drug or substance allergies.
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Allergy status has not been recorded by patient.
                </p>
              )}
            </div>
          </div>

          {/* Medications List */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-[#0F766E]" />
              Current Medications ({payload.m.length})
            </h4>

            {payload.m.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                No active medications reported.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                {payload.m.map((med, idx) => (
                  <div key={idx} className="p-3 bg-white hover:bg-slate-50 text-xs space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>{med.n}</span>
                      {med.s && <span className="text-slate-500 font-medium">{med.s}</span>}
                    </div>
                    {med.i && (
                      <p className="text-slate-600 bg-slate-50 p-1 rounded text-[11px]">
                        {med.i}
                      </p>
                    )}
                    {med.t && med.t.length > 0 && (
                      <div className="flex gap-1 pt-0.5">
                        {med.t.map((t, ti) => (
                          <span
                            key={ti}
                            className="px-1.5 py-0.2 bg-teal-50 text-[#0F766E] border border-teal-200 rounded text-[10px] capitalize font-medium"
                          >
                            {t.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 text-center">
            <Button variant="primary" size="sm" onClick={onClose} className="w-full">
              Close Emergency Pass
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
