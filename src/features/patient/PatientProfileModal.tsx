import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { PatientProfile } from '../../types/patient';
import { storageService } from '../../services/storage/db';

export interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PatientProfile | null;
  onProfileSaved: (profile: PatientProfile) => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileSaved,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setDateOfBirth(profile.dateOfBirth || '');
      setNotes(profile.notes || '');
    } else {
      setDisplayName('');
      setDateOfBirth('');
      setNotes('');
    }
  }, [profile, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const saved = await storageService.savePatientProfile({
        displayName: displayName.trim() || undefined,
        dateOfBirth: dateOfBirth.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onProfileSaved(saved);
      onClose();
    } catch (err) {
      console.error('Failed to save patient profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Patient Profile Information">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-500">
          Entering patient details is optional. This information appears on your generated printable Health Card.
        </p>

        <Input
          label="Patient Display Name"
          placeholder="e.g. Jane Doe"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          helperText="Avoid adding national IDs or sensitive numbers."
        />

        <Input
          label="Date of Birth"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />

        <Textarea
          label="Patient Notes"
          placeholder="e.g. Emergency contact, primary care physician, or important general medical notes."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSaving}>
            Save Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
};
