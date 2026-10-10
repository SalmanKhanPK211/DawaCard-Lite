import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-50/90 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5 no-print">
      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <p className="font-semibold text-amber-950">Patient-Maintained Health Summary</p>
        <p className="text-amber-800 leading-relaxed">
          DawaCard Lite helps organize personal records and does not provide medical diagnosis, treatment advice, or automated safety checks. Always review and verify your medication and allergy record with a licensed healthcare professional.
        </p>
      </div>
    </div>
  );
};
