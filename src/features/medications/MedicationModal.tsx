import React, { useState, useEffect } from 'react';
import { Sun, CloudSun, Moon, BedDouble, Zap, AlertCircle, LogIn } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Medication, MedicationStatus, TimeOfDay } from '../../types/medication';
import { storageService } from '../../services/storage/db';
import { useAuth } from '../../contexts/AuthContext';

export interface MedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicationToEdit?: Medication | null;
  onSaved: () => void;
  initialValues?: Partial<Medication>;
  onAuthClick?: () => void;
}

export const MedicationModal: React.FC<MedicationModalProps> = ({
  isOpen,
  onClose,
  medicationToEdit,
  onSaved,
  initialValues,
  onAuthClick,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosageForm, setDosageForm] = useState('');
  const [prescribedInstructions, setPrescribedInstructions] = useState('');
  const [route, setRoute] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [timesOfDay, setTimesOfDay] = useState<TimeOfDay[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<MedicationStatus>('current');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (medicationToEdit) {
      setName(medicationToEdit.name || '');
      setStrength(medicationToEdit.strength || '');
      setDosageForm(medicationToEdit.dosageForm || '');
      setPrescribedInstructions(medicationToEdit.prescribedInstructions || '');
      setRoute(medicationToEdit.route || '');
      setFrequency(medicationToEdit.frequency || '');
      setDuration(medicationToEdit.duration || '');
      setTimesOfDay(medicationToEdit.timesOfDay || []);
      setStartDate(medicationToEdit.startDate || '');
      setEndDate(medicationToEdit.endDate || '');
      setStatus(medicationToEdit.status || 'current');
      setNotes(medicationToEdit.notes || '');
    } else if (initialValues) {
      setName(initialValues.name || '');
      setStrength(initialValues.strength || '');
      setDosageForm(initialValues.dosageForm || '');
      setPrescribedInstructions(initialValues.prescribedInstructions || '');
      setRoute(initialValues.route || '');
      setFrequency(initialValues.frequency || '');
      setDuration(initialValues.duration || '');
      setTimesOfDay(initialValues.timesOfDay || []);
      setStartDate(initialValues.startDate || '');
      setEndDate(initialValues.endDate || '');
      setStatus(initialValues.status || 'current');
      setNotes(initialValues.notes || '');
    } else {
      resetForm();
    }
    setErrors({});
  }, [medicationToEdit, initialValues, isOpen]);

  const resetForm = () => {
    setName('');
    setStrength('');
    setDosageForm('');
    setPrescribedInstructions('');
    setRoute('');
    setFrequency('');
    setDuration('');
    setTimesOfDay([]);
    setStartDate('');
    setEndDate('');
    setStatus('current');
    setNotes('');
  };

  const toggleTimeOfDay = (time: TimeOfDay) => {
    setTimesOfDay((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim()) {
      setErrors({ name: 'Medication name is required.' });
      return;
    }

    if (!user) {
      setSubmitError('Authentication required: Please sign in or create an account to save medications to the cloud database.');
      return;
    }

    setIsSubmitting(true);
    try {
      await storageService.saveMedication({
        id: medicationToEdit?.id,
        name: name.trim(),
        strength: strength.trim() || undefined,
        dosageForm: dosageForm.trim() || undefined,
        prescribedInstructions: prescribedInstructions.trim() || undefined,
        route: route.trim() || undefined,
        frequency: frequency.trim() || undefined,
        duration: duration.trim() || undefined,
        timesOfDay: timesOfDay.length > 0 ? timesOfDay : undefined,
        startDate: startDate.trim() || undefined,
        endDate: endDate.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
        source: medicationToEdit?.source || (initialValues?.source as any) || 'manual',
      });
      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Failed to save medication:', err);
      setSubmitError(err.message || 'Failed to save medication to cloud database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlotButtons = [
    { id: 'morning' as TimeOfDay, label: 'Morning', icon: Sun },
    { id: 'afternoon' as TimeOfDay, label: 'Afternoon', icon: CloudSun },
    { id: 'evening' as TimeOfDay, label: 'Evening', icon: Moon },
    { id: 'bedtime' as TimeOfDay, label: 'Bedtime', icon: BedDouble },
    { id: 'as_needed' as TimeOfDay, label: 'As Needed', icon: Zap },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={medicationToEdit ? 'Edit Medication Record' : 'Add Medication Record'}
      maxWidth="xl"
    >
      {!user && (
        <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-semibold block text-amber-950">Sign In Required</span>
              <span>You must be signed in to save prescriptions to your cloud database.</span>
            </div>
          </div>
          {onAuthClick && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                onClose();
                onAuthClick();
              }}
              className="shrink-0 bg-white"
            >
              Sign In
            </Button>
          )}
        </div>
      )}

      {submitError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1: Basic Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            1. Basic Medication Info
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Medication Name"
              placeholder="e.g. Amoxicillin"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({});
              }}
              error={errors.name}
            />

            <Input
              label="Strength (Optional)"
              placeholder="e.g. 500 mg, 10 mg/5ml"
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Dosage Form (Optional)"
              placeholder="e.g. Tablet, Capsule, Syrup, Inhaler"
              value={dosageForm}
              onChange={(e) => setDosageForm(e.target.value)}
            />

            <Input
              label="Route (Optional)"
              placeholder="e.g. Oral, Topical, Inhalation"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Instructions & Daily Pillbox Timings */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            2. Prescribed Dose & Daily Schedule
          </h4>
          <Textarea
            label="Prescribed Dose / Instructions (Optional)"
            placeholder="e.g. Take 1 capsule by mouth every 8 hours with food."
            value={prescribedInstructions}
            onChange={(e) => setPrescribedInstructions(e.target.value)}
            rows={2}
          />

          {/* 4-Box Pillbox Time of Day Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Pillbox Time of Day (Optional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {timeSlotButtons.map((slot) => {
                const Icon = slot.icon;
                const isSelected = timesOfDay.includes(slot.id);
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => toggleTimeOfDay(slot.id)}
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{slot.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Select times to populate your 4-box pill schedule organizer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Frequency (Optional)"
              placeholder="e.g. Once daily, Every 8 hours"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />

            <Input
              label="Duration (Optional)"
              placeholder="e.g. 7 days, Ongoing"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>

        {/* Section 3: Status & Dates */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            3. Status & Dates
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as MedicationStatus)}
              options={[
                { value: 'current', label: 'Current Medication' },
                { value: 'discontinued', label: 'Discontinued' },
              ]}
            />

            <Input
              label="Start Date (Optional)"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              label="End Date (Optional)"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Section 4: Notes */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            4. Additional Notes
          </h4>
          <Textarea
            label="Notes or Prescriber Note (Optional)"
            placeholder="e.g. Prescribed by Dr. Smith for ear infection. Stop taking if rash occurs."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isSubmitting}
            disabled={!user || isSubmitting}
          >
            {!user ? 'Sign In Required' : medicationToEdit ? 'Update Medication' : 'Save Medication'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
