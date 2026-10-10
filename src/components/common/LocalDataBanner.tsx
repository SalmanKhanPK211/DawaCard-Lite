import React, { useState } from 'react';
import { Database, ShieldCheck, Download, Upload, Trash2, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { storageService } from '../../services/storage/db';

export interface LocalDataBannerProps {
  onDataChanged?: () => void;
}

export const LocalDataBanner: React.FC<LocalDataBannerProps> = ({ onDataChanged }) => {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      const dataStr = await storageService.exportData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dawacard_backup_${new Date().toISOString().slice(0, 10)}.json`;
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
        setImportStatus('Data imported successfully!');
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
    setIsPrivacyModalOpen(false);
    if (onDataChanged) onDataChanged();
  };

  return (
    <>
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-2 text-emerald-900 no-print">
        <div className="flex items-center gap-2 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0" />
          <span>
            <strong>Local-First & Private:</strong> Your medication data is stored inside your browser's IndexedDB. No cloud account or automatic tracking.
          </span>
        </div>
        <button
          onClick={() => setIsPrivacyModalOpen(true)}
          className="text-[#0F766E] font-semibold hover:underline cursor-pointer underline-offset-2"
        >
          Manage Data & Privacy
        </button>
      </div>

      {/* Privacy & Data Management Modal */}
      <Modal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        title="Local Storage & Privacy"
      >
        <div className="space-y-5 text-sm text-slate-700">
          <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-slate-600">
              <p className="font-semibold text-slate-800 text-sm">Where is my health data saved?</p>
              <p>
                DawaCard Lite stores all your medication and allergy records locally inside your browser using IndexedDB.
              </p>
              <p className="text-amber-700 font-medium pt-1">
                ⚠️ Note: Clearing site data, using private/incognito windows, or switching browsers may erase local data unless you export a backup JSON file.
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
            <h4 className="font-semibold text-slate-900 border-b pb-1">Backup & Local Actions</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="w-4 h-4" />}
                onClick={handleExport}
                className="w-full justify-center"
              >
                Export Backup (JSON)
              </Button>

              <label className="inline-flex items-center justify-center font-medium rounded-lg transition-colors border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 px-3 py-1.5 text-xs gap-1.5 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import Backup (JSON)</span>
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
              Clear All Saved Data
            </Button>

            <Button variant="secondary" size="sm" onClick={() => setIsPrivacyModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation modal for clearing data */}
      <Modal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        title="Confirm Data Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 text-sm text-slate-700">
          <p className="text-red-700 font-medium">
            Are you sure you want to delete all stored patient information, medication records, and allergy data?
          </p>
          <p className="text-xs text-slate-500">
            This action cannot be undone unless you have an exported JSON backup file.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsClearConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleClearAll}>
              Yes, Delete Everything
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
