import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, ShieldAlert, CheckCircle, Info, ExternalLink } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Medication } from '../../types/medication';
import { AllergyRecord, AllergyStatus } from '../../types/allergy';
import { PatientProfile } from '../../types/patient';
import { generateEmergencyPayload, getEmergencyUrl } from '../../utils/qrPayload';

export interface EmergencyQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile | null;
  medications: Medication[];
  allergies: AllergyRecord[];
  allergyStatus: AllergyStatus;
}

export const EmergencyQRModal: React.FC<EmergencyQRModalProps> = ({
  isOpen,
  onClose,
  patient,
  medications,
  allergies,
  allergyStatus,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [emergencyUrl, setEmergencyUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const payload = generateEmergencyPayload(
        patient,
        medications,
        allergies,
        allergyStatus
      );
      const url = getEmergencyUrl(payload);
      setEmergencyUrl(url);

      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      })
        .then((dataUrl) => setQrDataUrl(dataUrl))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [isOpen, patient, medications, allergies, allergyStatus]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `dawacard_emergency_qr_${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
  };

  const currentMeds = medications.filter((m) => m.status === 'current');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Offline Emergency QR Code" maxWidth="md">
      <div className="space-y-5 text-center">
        <p className="text-xs text-slate-600">
          Scan this QR code with any smartphone camera to instantly access the patient's current medications and critical allergy status without needing an account or cloud login.
        </p>

        {/* QR Code Container */}
        <div className="inline-block p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-sm mx-auto">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Emergency Health QR Code" className="w-56 h-56 mx-auto" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400">
              Generating QR Code...
            </div>
          )}
          <span className="text-[11px] font-bold text-slate-600 block mt-1 tracking-wider uppercase">
            DawaCard Emergency Pass
          </span>
        </div>

        {/* Quick Summary Preview */}
        <div className="text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between border-b pb-1">
            <span className="font-bold text-slate-900">
              {patient?.displayName || 'Patient Name Not Set'}
            </span>
            {patient?.dateOfBirth && (
              <span className="text-slate-500">DOB: {patient.dateOfBirth}</span>
            )}
          </div>

          <div className="text-[11px] text-slate-700">
            <strong>Allergies:</strong>{' '}
            {allergyStatus === 'no_known_allergies'
              ? 'No Known Allergies (NKA)'
              : allergyStatus === 'known_allergies' && allergies.length > 0
              ? allergies.map((a) => a.allergen).join(', ')
              : 'Unknown / Not Recorded'}
          </div>

          <div className="text-[11px] text-slate-700">
            <strong>Active Medications ({currentMeds.length}):</strong>{' '}
            {currentMeds.length > 0
              ? currentMeds.map((m) => m.name + (m.strength ? ` ${m.strength}` : '')).join(', ')
              : 'None recorded'}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
          >
            Save QR Image (PNG)
          </Button>

          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
