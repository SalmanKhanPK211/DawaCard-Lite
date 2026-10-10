import React, { useState } from 'react';
import { Pill, Edit2, Trash2, Calendar, Clock, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { Medication } from '../../types/medication';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { storageService } from '../../services/storage/db';

export interface MedicationCardProps {
  medication: Medication;
  onUpdated: () => void;
  onEdit: (med: Medication) => void;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  onUpdated,
  onEdit,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleStatus = async () => {
    const newStatus = medication.status === 'current' ? 'discontinued' : 'current';
    await storageService.saveMedication({
      ...medication,
      status: newStatus,
      endDate: newStatus === 'discontinued' ? new Date().toISOString().slice(0, 10) : undefined,
    });
    onUpdated();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await storageService.deleteMedication(medication.id);
      setIsDeleteModalOpen(false);
      onUpdated();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="hover:border-slate-300 transition-all flex flex-col justify-between h-full">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  medication.status === 'current'
                    ? 'bg-emerald-100 text-[#0F766E]'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">
                  {medication.name}
                  {medication.strength && (
                    <span className="text-slate-600 font-normal text-sm ml-1.5">
                      {medication.strength}
                    </span>
                  )}
                </h3>
                {medication.dosageForm && (
                  <p className="text-xs text-slate-500 font-medium">{medication.dosageForm}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <Badge variant={medication.status}>
                {medication.status === 'current' ? 'Current' : 'Discontinued'}
              </Badge>
              {medication.source === 'ai-reviewed' && (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md font-medium">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  AI Reviewed
                </span>
              )}
            </div>
          </div>

          {/* Instructions */}
          {medication.prescribedInstructions && (
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700 font-medium leading-relaxed">
              <span className="text-slate-400 font-normal block text-[11px]">Instructions:</span>
              {medication.prescribedInstructions}
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-100 pt-2">
            {medication.frequency && (
              <div>
                <span className="text-slate-400 text-[11px] block">Frequency:</span>
                <span className="font-medium text-slate-800">{medication.frequency}</span>
              </div>
            )}
            {medication.route && (
              <div>
                <span className="text-slate-400 text-[11px] block">Route:</span>
                <span className="font-medium text-slate-800">{medication.route}</span>
              </div>
            )}
            {medication.startDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Start: {medication.startDate}</span>
              </div>
            )}
            {medication.endDate && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>End: {medication.endDate}</span>
              </div>
            )}
          </div>

          {medication.notes && (
            <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-100">
              "{medication.notes}"
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-4 no-print">
          <button
            onClick={handleToggleStatus}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1"
          >
            {medication.status === 'current' ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Mark Discontinued</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark Current</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(medication)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
              title="Edit medication"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer transition-colors"
              title="Delete medication"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 text-sm text-slate-700">
          <p>
            Are you sure you want to delete <strong className="text-slate-900">{medication.name}</strong> from your medication list?
          </p>
          <p className="text-xs text-slate-500">This action cannot be undone.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" isLoading={isDeleting} onClick={handleDelete}>
              Delete Medication
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
