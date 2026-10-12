import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, HelpCircle, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { AllergyRecord, AllergyStatus } from '../../types/allergy';
import { storageService } from '../../services/storage/db';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { DisclaimerBanner } from '../../components/common/DisclaimerBanner';
import { useAuth } from '../../contexts/AuthContext';
import { SEO } from '../../components/common/SEO';

export const AllergyPage: React.FC = () => {
  const { user } = useAuth();
  const [allergyStatus, setAllergyStatusState] = useState<AllergyStatus>('unknown');
  const [allergies, setAllergies] = useState<AllergyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states for add/edit allergy
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<AllergyRecord | null>(null);
  const [allergen, setAllergen] = useState('');
  const [reportedReaction, setReportedReaction] = useState('');
  const [notes, setNotes] = useState('');
  const [allergenError, setAllergenError] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAllergyData = async () => {
    setIsLoading(true);
    try {
      const status = await storageService.getAllergyStatus();
      const list = await storageService.getAllergies();
      setAllergyStatusState(status);
      setAllergies(list);
    } catch (err) {
      console.error('Failed to load allergy data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllergyData();
  }, []);

  const handleStatusChange = async (newStatus: AllergyStatus) => {
    await storageService.setAllergyStatus(newStatus);
    setAllergyStatusState(newStatus);
  };

  const handleOpenAddModal = () => {
    setEditingAllergy(null);
    setAllergen('');
    setReportedReaction('');
    setNotes('');
    setAllergenError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: AllergyRecord) => {
    setEditingAllergy(rec);
    setAllergen(rec.allergen);
    setReportedReaction(rec.reportedReaction || '');
    setNotes(rec.notes || '');
    setAllergenError('');
    setIsModalOpen(true);
  };

  const handleSaveAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    if (!allergen.trim()) {
      setAllergenError('Allergen name is required.');
      return;
    }

    if (!user) {
      setSaveError('Authentication required: Please sign in to save allergies to the cloud database.');
      return;
    }

    setIsSaving(true);
    try {
      await storageService.saveAllergy({
        id: editingAllergy?.id,
        allergen: allergen.trim(),
        reportedReaction: reportedReaction.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      // Automatically set status to known_allergies if user adds a record
      await handleStatusChange('known_allergies');

      setIsModalOpen(false);
      await loadAllergyData();
    } catch (err: any) {
      console.error('Save allergy error:', err);
      setSaveError(err.message || 'Failed to save allergy to cloud database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAllergy = async (id: string) => {
    await storageService.deleteAllergy(id);
    setDeletingId(null);
    await loadAllergyData();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <SEO
        title="Allergy Tracking"
        titleUr="الرجی اور ردعمل کا ریکارڈ"
        description="Record user-reported drug, food, or environmental allergies and explicit allergy status."
        descriptionUr="معلوم الرجیز، منفی ردعمل اور طبی الرجی اسٹیٹس کا اندراج۔"
        canonicalPath="/allergies"
      />
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Allergy Management</h1>
        <p className="text-sm text-slate-500">
          Record user-reported drug, food, or environmental allergies and explicit allergy status.
        </p>
      </div>

      <DisclaimerBanner />

      {/* 3 Explicit Allergy States Selector */}
      <Card className="p-5 border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Allergy Status Category</h3>
        <p className="text-xs text-slate-500 mb-4">
          Select your current allergy status. Unknown status is distinct from having no known allergies.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Option 1: Known Allergies */}
          <button
            onClick={() => handleStatusChange('known_allergies')}
            className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 hover:-translate-y-0.5 hover:shadow-xs ${
              allergyStatus === 'known_allergies'
                ? 'border-[#0F766E] bg-emerald-50/50 ring-2 ring-[#0F766E]/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <ShieldAlert
                className={`w-6 h-6 ${
                  allergyStatus === 'known_allergies' ? 'text-amber-600' : 'text-slate-400'
                }`}
              />
              {allergyStatus === 'known_allergies' && (
                <span className="text-xs font-bold text-[#0F766E] bg-emerald-100 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Known Allergies Recorded</h4>
              <p className="text-xs text-slate-500 mt-1">
                You have one or more specific known allergies to record.
              </p>
            </div>
          </button>

          {/* Option 2: Explicit No Known Allergies */}
          <button
            onClick={() => handleStatusChange('no_known_allergies')}
            className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 hover:-translate-y-0.5 hover:shadow-xs ${
              allergyStatus === 'no_known_allergies'
                ? 'border-[#0F766E] bg-emerald-50/50 ring-2 ring-[#0F766E]/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <ShieldCheck
                className={`w-6 h-6 ${
                  allergyStatus === 'no_known_allergies' ? 'text-emerald-600' : 'text-slate-400'
                }`}
              />
              {allergyStatus === 'no_known_allergies' && (
                <span className="text-xs font-bold text-[#0F766E] bg-emerald-100 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">No Known Allergies (NKA)</h4>
              <p className="text-xs text-slate-500 mt-1">
                You explicitly report having no known drug or substance allergies.
              </p>
            </div>
          </button>

          {/* Option 3: Unknown / Not Recorded */}
          <button
            onClick={() => handleStatusChange('unknown')}
            className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 hover:-translate-y-0.5 hover:shadow-xs ${
              allergyStatus === 'unknown'
                ? 'border-[#0F766E] bg-emerald-50/50 ring-2 ring-[#0F766E]/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <HelpCircle
                className={`w-6 h-6 ${
                  allergyStatus === 'unknown' ? 'text-slate-600' : 'text-slate-400'
                }`}
              />
              {allergyStatus === 'unknown' && (
                <span className="text-xs font-bold text-[#0F766E] bg-emerald-100 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Unknown / Not Yet Recorded</h4>
              <p className="text-xs text-slate-500 mt-1">
                Allergy status has not been confirmed or reported yet.
              </p>
            </div>
          </button>
        </div>
      </Card>

      {/* Known Allergies List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recorded Allergens</h2>
            <p className="text-xs text-slate-500">
              List individual allergens and your described reaction notes.
            </p>
          </div>

          <Button
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAddModal}
          >
            Add Allergen
          </Button>
        </div>

        {allergies.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-slate-300 bg-slate-50/50">
            <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No specific allergens listed</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {allergyStatus === 'no_known_allergies'
                ? 'You have explicitly marked your status as No Known Allergies.'
                : 'Add known allergens like Penicillin, Aspirin, Peanuts, or Latex if applicable.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenAddModal}
              className="mt-4"
            >
              Add Your First Allergen
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allergies.map((item) => (
              <Card key={item.id} className="p-4 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                        !
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{item.allergen}</h3>
                    </div>
                  </div>

                  {item.reportedReaction && (
                    <div className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-100 text-xs text-amber-900 font-medium">
                      <span className="text-amber-700 font-semibold block text-[11px]">
                        Reported Reaction:
                      </span>
                      {item.reportedReaction}
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-xs text-slate-500 italic">"{item.notes}"</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 no-print">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md cursor-pointer text-xs flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setDeletingId(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Allergy Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAllergy ? 'Edit Allergy Record' : 'Add New Allergen'}
      >
        {!user && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Sign in required: You must be logged in to save allergies to your cloud database.</span>
          </div>
        )}

        {saveError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <form onSubmit={handleSaveAllergy} className="space-y-4">
          <Input
            label="Allergen Name"
            placeholder="e.g. Penicillin, Aspirin, Peanuts, Latex"
            required
            value={allergen}
            onChange={(e) => {
              setAllergen(e.target.value);
              if (allergenError) setAllergenError('');
            }}
            error={allergenError}
          />

          <Textarea
            label="Reported Reaction (Optional)"
            placeholder="e.g. Skin rash, shortness of breath, facial swelling, nausea"
            value={reportedReaction}
            onChange={(e) => setReportedReaction(e.target.value)}
            rows={2}
          />

          <Textarea
            label="Additional Notes (Optional)"
            placeholder="e.g. Discovered during hospital stay in 2021"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSaving} disabled={!user || isSaving}>
              {!user ? 'Sign In Required' : 'Save Allergen'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Confirm Allergen Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 text-sm text-slate-700">
          <p>Are you sure you want to remove this allergen entry from your record?</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => deletingId && handleDeleteAllergy(deletingId)}
            >
              Delete Allergen
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
