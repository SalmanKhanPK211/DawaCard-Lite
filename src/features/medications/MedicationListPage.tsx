import React, { useState, useEffect } from 'react';
import { Pill, Search, Plus, Filter, ScanLine, AlertCircle } from 'lucide-react';
import { Medication, MedicationStatus } from '../../types/medication';
import { storageService } from '../../services/storage/db';
import { MedicationCard } from './MedicationCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { LocalDataBanner } from '../../components/common/LocalDataBanner';
import { DisclaimerBanner } from '../../components/common/DisclaimerBanner';

export interface MedicationListPageProps {
  onAddMedicationClick: () => void;
  onScanClick: () => void;
  onEditMedicationClick: (med: Medication) => void;
}

export const MedicationListPage: React.FC<MedicationListPageProps> = ({
  onAddMedicationClick,
  onScanClick,
  onEditMedicationClick,
}) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MedicationStatus>('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadMedications = async () => {
    setIsLoading(true);
    try {
      const list = await storageService.getMedications();
      setMedications(list);
    } catch (err) {
      console.error('Failed to load medications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedications();
  }, []);

  const filteredMedications = medications.filter((med) => {
    const matchesStatus = statusFilter === 'all' || med.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      med.name.toLowerCase().includes(q) ||
      (med.strength && med.strength.toLowerCase().includes(q)) ||
      (med.dosageForm && med.dosageForm.toLowerCase().includes(q)) ||
      (med.prescribedInstructions && med.prescribedInstructions.toLowerCase().includes(q)) ||
      (med.notes && med.notes.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const currentCount = medications.filter((m) => m.status === 'current').length;
  const discontinuedCount = medications.filter((m) => m.status === 'discontinued').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Medication Management</h1>
          <p className="text-sm text-slate-500">
            Organize, update, or discontinue your prescribed medication records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={onAddMedicationClick}
          >
            Add Medication
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<ScanLine className="w-4 h-4 text-[#0F766E]" />}
            onClick={onScanClick}
          >
            Scan Prescription
          </Button>
        </div>
      </div>

      <LocalDataBanner onDataChanged={loadMedications} />
      <DisclaimerBanner />

      {/* Filter and Search Bar */}
      <Card className="p-4 border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, strength, instructions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({medications.length})
            </button>
            <button
              onClick={() => setStatusFilter('current')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'current'
                  ? 'bg-white text-[#0F766E] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Current ({currentCount})
            </button>
            <button
              onClick={() => setStatusFilter('discontinued')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'discontinued'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Discontinued ({discontinuedCount})
            </button>
          </div>
        </div>
      </Card>

      {/* Medication Cards List */}
      {medications.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-slate-300 bg-slate-50/50 space-y-3">
          <Pill className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No medications added yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add medications manually or upload a prescription photo for AI extraction.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={onAddMedicationClick}>
              Add Medication
            </Button>
          </div>
        </Card>
      ) : filteredMedications.length === 0 ? (
        <Card className="p-8 text-center border-slate-200">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No matching medications found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search terms or filter selection.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="mt-3"
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMedications.map((med) => (
            <MedicationCard
              key={med.id}
              medication={med}
              onUpdated={loadMedications}
              onEdit={onEditMedicationClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
