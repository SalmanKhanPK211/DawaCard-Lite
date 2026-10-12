import React, { useState } from 'react';
import { Database, ShieldCheck, Download, Upload, Trash2, Info, Cloud, CheckCircle2, LogIn } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { storageService } from '../../services/storage/db';
import { useAuth } from '../../contexts/AuthContext';

export interface LocalDataBannerProps {
  onDataChanged?: () => void;
  onAuthClick?: () => void;
}

export const LocalDataBanner: React.FC<LocalDataBannerProps> = ({ onDataChanged, onAuthClick }) => {
  const { user } = useAuth();
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      const dataStr = await storageService.exportData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dawacard_cloud_backup_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result as string;
        await storageService.importData(content);
        setImportStatus('Data imported successfully to Supabase cloud!');
        if (onDataChanged) onDataChanged();
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err: any) {
        setImportStatus(`Import error: ${err.message || 'Invalid JSON backup file'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = async () => {
    await storageService.clearAllData();
    setIsClearConfirmOpen(false);
    setIsDataModalOpen(false);
    if (onDataChanged) onDataChanged();
  };

  return (
    <>
      {user ? (
        <div className="bg-teal-50/90 border border-teal-200/90 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-2 text-teal-950 no-print">
          <div className="flex items-center gap-2 font-medium">
            <Cloud className="w-4 h-4 text-[#0F766E] shrink-0" />
            <span>
              <strong>Cloud Database Active (Supabase):</strong> Connected as{' '}
              <span className="font-semibold text-[#0F766E]">{user.email}</span>. Data is securely stored with Row Level Security.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="text-[#0F766E] font-semibold hover:underline cursor-pointer"
            >
              Cloud Data & Backups
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-2 text-amber-950 no-print">
          <div className="flex items-center gap-2 font-medium">
            <Cloud className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Cloud Account Required:</strong> Sign in or create an account to save, view, and sync your prescriptions across devices.
            </span>
          </div>
          {onAuthClick && (
            <button
              onClick={onAuthClick}
              className="text-amber-800 font-bold hover:underline cursor-pointer flex items-center gap-1 underline-offset-2"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Sign Up</span>
            </button>
          )}
        </div>
      )}

      {/* Cloud Data Management & Backup Modal */}
      <Modal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        title="Cloud Database & Security"
      >
        <div className="space-y-5 text-sm text-slate-700">
          <div className="flex items-start gap-3 p-3 bg-teal-50/60 border border-teal-200/70 rounded-lg">
            <Info className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-slate-700">
              <p className="font-semibold text-slate-900 text-sm">Supabase PostgreSQL Cloud Storage</p>
              <p>
                All your medication records, allergy data, and patient profile are securely saved in your private Supabase PostgreSQL database.
              </p>
              <p className="text-[#0F766E] font-medium pt-1">
                🔒 Protected by Row Level Security (RLS): Only your authenticated account can query or modify your records.
              </p>
            </div>
          </div>

          {importStatus && (
            <div
              className={`p-3 text-xs rounded-lg font-medium ${
                importStatus.includes('error') ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              {importStatus}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <h4 className="font-semibold text-slate-900 border-b pb-1">Export & Import Cloud Backups</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="w-4 h-4" />}
                onClick={handleExport}
                className="w-full justify-center"
              >
                Export JSON Backup
              </Button>

              <label className="inline-flex items-center justify-center font-medium rounded-lg transition-colors border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 px-3 py-1.5 text-xs gap-1.5 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import JSON Backup</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => setIsClearConfirmOpen(true)}
            >
              Delete All Cloud Records
            </Button>

            <Button variant="secondary" size="sm" onClick={() => setIsDataModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation modal for clearing data */}
      <Modal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        title="Confirm Cloud Data Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 text-sm text-slate-700">
          <p className="text-red-700 font-medium">
            Are you sure you want to delete all cloud medication records and allergy data from your account?
          </p>
          <p className="text-xs text-slate-500">
            This permanently deletes rows from your Supabase PostgreSQL database unless you export a JSON backup file first.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsClearConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleClearAll}>
              Yes, Delete Cloud Data
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
