import React, { useState, useEffect } from 'react';
import {
  Upload,
  ScanLine,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  HelpCircle,
  ShieldCheck,
  X,
  FileText,
  Sun,
  CloudSun,
  Moon,
  BedDouble,
  Zap,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import {
  extractPrescriptionFromImage,
  checkAiBackendStatus,
} from '../../services/ai/aiService';
import { PrescriptionExtractionResult, ExtractedField, ConfidenceCategory } from '../../types/ai';
import { MedicationInput, MedicationStatus, TimeOfDay } from '../../types/medication';
import { storageService } from '../../services/storage/db';

export interface PrescriptionReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMedicationSaved: () => void;
}

export const PrescriptionReaderModal: React.FC<PrescriptionReaderModalProps> = ({
  isOpen,
  onClose,
  onMedicationSaved,
}) => {
  // Step 1: Upload, Step 2: Processing, Step 3: Mandatory Review
  const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');

  // Backend status check
  const [backendStatus, setBackendStatus] = useState<{ available: boolean; message: string } | null>(
    null
  );

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // AI Result
  const [extractionResult, setExtractionResult] = useState<PrescriptionExtractionResult | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable Form Fields state for Review Screen (FR-06)
  const [reviewFields, setReviewFields] = useState<{
    name: string;
    strength: string;
    dosageForm: string;
    prescribedInstructions: string;
    route: string;
    frequency: string;
    duration: string;
    notes: string;
    timesOfDay: TimeOfDay[];
    status: MedicationStatus;
  }>({
    name: '',
    strength: '',
    dosageForm: '',
    prescribedInstructions: '',
    route: '',
    frequency: '',
    duration: '',
    notes: '',
    timesOfDay: [],
    status: 'current',
  });

  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Check AI proxy health on modal open
  useEffect(() => {
    if (isOpen) {
      checkAiBackendStatus().then(setBackendStatus);
    } else {
      resetAll();
    }
  }, [isOpen]);

  const resetAll = () => {
    setStep('upload');
    setSelectedFile(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    setExtractionResult(null);
    setErrorMsg(null);
    setFormError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5 MB limit. Please select a smaller prescription image.');
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type.toLowerCase())) {
      setErrorMsg('Invalid file format. Please upload JPEG, PNG, or WebP.');
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    setErrorMsg(null);
  };

  const handleExtract = async () => {
    if (!selectedFile) return;

    setStep('processing');
    setErrorMsg(null);

    try {
      const result = await extractPrescriptionFromImage(selectedFile);
      setExtractionResult(result);

      // Populate review fields from extracted candidate fields
      const fieldMap: Record<string, string> = {};
      result.fields.forEach((f) => {
        fieldMap[f.field] = f.value || '';
      });

      // Simple heuristic for default pillbox timing
      const freqLower = (fieldMap.frequency || '').toLowerCase() + ' ' + (fieldMap.prescribedInstructions || '').toLowerCase();
      const detectedTimes: TimeOfDay[] = [];
      if (freqLower.includes('morning') || freqLower.includes('daily') || freqLower.includes('qam')) detectedTimes.push('morning');
      if (freqLower.includes('noon') || freqLower.includes('afternoon') || freqLower.includes('lunch') || freqLower.includes('tid')) detectedTimes.push('afternoon');
      if (freqLower.includes('evening') || freqLower.includes('dinner') || freqLower.includes('bid') || freqLower.includes('tid')) detectedTimes.push('evening');
      if (freqLower.includes('night') || freqLower.includes('bedtime') || freqLower.includes('qhs')) detectedTimes.push('bedtime');
      if (freqLower.includes('prn') || freqLower.includes('as needed')) detectedTimes.push('as_needed');

      setReviewFields({
        name: fieldMap.name || '',
        strength: fieldMap.strength || '',
        dosageForm: fieldMap.dosageForm || '',
        prescribedInstructions: fieldMap.prescribedInstructions || '',
        route: fieldMap.route || '',
        frequency: fieldMap.frequency || '',
        duration: fieldMap.duration || '',
        notes: fieldMap.notes || '',
        timesOfDay: detectedTimes,
        status: 'current',
      });

      setStep('review');
    } catch (err: any) {
      console.error('Extraction error:', err);
      setErrorMsg(err.message || 'Prescription extraction failed.');
      setStep('upload');
    }
  };

  const handleSaveConfirmedRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewFields.name.trim()) {
      setFormError('Medication name is required before saving.');
      return;
    }

    setIsSaving(true);
    try {
      await storageService.saveMedication({
        name: reviewFields.name.trim(),
        strength: reviewFields.strength.trim() || undefined,
        dosageForm: reviewFields.dosageForm.trim() || undefined,
        prescribedInstructions: reviewFields.prescribedInstructions.trim() || undefined,
        route: reviewFields.route.trim() || undefined,
        frequency: reviewFields.frequency.trim() || undefined,
        duration: reviewFields.duration.trim() || undefined,
        timesOfDay: reviewFields.timesOfDay.length > 0 ? reviewFields.timesOfDay : undefined,
        status: reviewFields.status,
        notes: reviewFields.notes.trim() || undefined,
        source: 'ai-reviewed',
      });

      onMedicationSaved();
      onClose();
    } catch (err) {
      console.error('Save confirmed record error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getFieldInfo = (fieldName: string): ExtractedField | undefined => {
    return extractionResult?.fields.find((f) => f.field === fieldName);
  };

  const renderConfidenceBadge = (confidence?: ConfidenceCategory, isValueMissing?: boolean) => {
    if (isValueMissing || !confidence || confidence === 'uncertain') {
      return (
        <Badge variant="uncertain" icon={<XCircle className="w-3 h-3 text-rose-700" />}>
          Missing / Uncertain — Verify
        </Badge>
      );
    }
    if (confidence === 'high') {
      return (
        <Badge variant="high" icon={<CheckCircle className="w-3 h-3 text-emerald-700" />}>
          High Confidence
        </Badge>
      );
    }
    if (confidence === 'medium') {
      return (
        <Badge variant="medium" icon={<AlertTriangle className="w-3 h-3 text-amber-700" />}>
          Medium Confidence — Check Image
        </Badge>
      );
    }
    return (
      <Badge variant="low" icon={<AlertTriangle className="w-3 h-3 text-orange-700" />}>
        Low Confidence — Needs Verification
      </Badge>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'review' ? 'Mandatory AI Extraction Review' : 'Scan Prescription with AI'}
      maxWidth={step === 'review' ? '4xl' : 'xl'}
    >
      {/* Backend Availability Banner */}
      {backendStatus && !backendStatus.available && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-950">AI Extraction Unavailable</p>
            <p className="mt-0.5 text-amber-800">{backendStatus.message}</p>
            <p className="mt-1 text-[11px] text-slate-600">
              You can still use DawaCard Lite completely offline by adding medications manually using the "Add Medication" button.
            </p>
          </div>
        </div>
      )}

      {/* STEP 1: UPLOAD */}
      {step === 'upload' && (
        <div className="space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            Upload a clear photo or scan of a prescription paper (JPEG, PNG, or WebP up to 5 MB). AI will attempt to extract visible candidate fields for human review.
          </p>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 font-medium">
              {errorMsg}
            </div>
          )}

          {!selectedFile ? (
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 hover:border-[#0F766E] rounded-xl bg-slate-50 hover:bg-emerald-50/30 transition-colors cursor-pointer text-center">
              <Upload className="w-10 h-10 text-slate-400 mb-2" />
              <span className="text-sm font-semibold text-slate-800">
                Click to select prescription image
              </span>
              <span className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP (Max 5 MB)</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-h-64 flex items-center justify-center">
                <img
                  src={imagePreviewUrl!}
                  alt="Prescription preview"
                  className="max-h-64 object-contain"
                />
                <button
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-1.5 rounded-full cursor-pointer transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-slate-800 truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                  <span>({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="text-xs text-red-600 hover:underline cursor-pointer"
                >
                  Choose Different
                </button>
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
            <p>
              <strong>Privacy Notice:</strong> Clicking extract sends your selected image securely to the backend proxy for Gemini analysis. Images are processed temporarily and are not permanently saved on any cloud server.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              icon={<Sparkles className="w-4 h-4" />}
              disabled={!selectedFile || (backendStatus ? !backendStatus.available : false)}
              onClick={handleExtract}
            >
              Extract Information with AI
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: PROCESSING */}
      {step === 'processing' && (
        <div className="py-12 text-center space-y-4">
          <div className="inline-flex p-4 rounded-full bg-emerald-50 text-[#0F766E] animate-pulse">
            <ScanLine className="w-10 h-10 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Analyzing Prescription Image...</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Gemini AI is reading visible medicine names, strengths, and written dosage instructions.
            </p>
          </div>
        </div>
      )}

      {/* STEP 3: MANDATORY HUMAN REVIEW SCREEN (FR-06) */}
      {step === 'review' && extractionResult && (
        <form onSubmit={handleSaveConfirmedRecord} className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Human Verification Required</p>
              <p className="mt-0.5 leading-relaxed">
                Compare every field against the original prescription image before saving. AI-extracted candidate values must be verified or corrected by you.
              </p>
            </div>
          </div>

          {extractionResult.warnings.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-900 space-y-1">
              <p className="font-bold text-rose-950">Extraction Warnings / Difficulties:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {extractionResult.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 font-semibold">
              {formError}
            </div>
          )}

          {/* Dual Column Layout: Image Preview vs Editable Review Form */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Original Image Preview Sticky */}
            <div className="md:col-span-5 bg-slate-900 rounded-xl p-3 space-y-2 border border-slate-300 md:sticky md:top-4">
              <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-700 pb-2">
                <span className="font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  Original Prescription Image
                </span>
              </div>
              <div className="overflow-hidden rounded-lg max-h-96 flex items-center justify-center bg-slate-950">
                <img
                  src={imagePreviewUrl!}
                  alt="Original prescription"
                  className="w-full max-h-96 object-contain"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Zoom or inspect the image to double-check candidate values.
              </p>
            </div>

            {/* Right: Editable Candidate Fields */}
            <div className="md:col-span-7 space-y-4 max-h-[600px] overflow-y-auto pr-1">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
                Extracted Candidate Fields
              </h3>

              {/* Field 1: Medication Name */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Medication Name <span className="text-red-600">*</span>
                  </label>
                  {renderConfidenceBadge(
                    getFieldInfo('name')?.confidence,
                    !reviewFields.name.trim()
                  )}
                </div>
                <Input
                  value={reviewFields.name}
                  onChange={(e) => {
                    setReviewFields({ ...reviewFields, name: e.target.value });
                    if (formError) setFormError('');
                  }}
                  placeholder="Enter or confirm medication name"
                />
                {getFieldInfo('name')?.supportingText && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100">
                    <span className="font-medium text-slate-700">Snippet:</span> "
                    {getFieldInfo('name')?.supportingText}"
                  </p>
                )}
              </div>

              {/* Field 2: Strength */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Strength</label>
                  {renderConfidenceBadge(
                    getFieldInfo('strength')?.confidence,
                    !reviewFields.strength.trim()
                  )}
                </div>
                <Input
                  value={reviewFields.strength}
                  onChange={(e) => setReviewFields({ ...reviewFields, strength: e.target.value })}
                  placeholder="e.g. 500 mg, 10 mg"
                />
                {getFieldInfo('strength')?.supportingText && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100">
                    <span className="font-medium text-slate-700">Snippet:</span> "
                    {getFieldInfo('strength')?.supportingText}"
                  </p>
                )}
              </div>

              {/* Field 3: Prescribed Instructions */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Prescribed Instructions
                  </label>
                  {renderConfidenceBadge(
                    getFieldInfo('prescribedInstructions')?.confidence,
                    !reviewFields.prescribedInstructions.trim()
                  )}
                </div>
                <Textarea
                  value={reviewFields.prescribedInstructions}
                  onChange={(e) =>
                    setReviewFields({ ...reviewFields, prescribedInstructions: e.target.value })
                  }
                  rows={2}
                  placeholder="e.g. Take 1 tablet every 8 hours"
                />
                {getFieldInfo('prescribedInstructions')?.supportingText && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100">
                    <span className="font-medium text-slate-700">Snippet:</span> "
                    {getFieldInfo('prescribedInstructions')?.supportingText}"
                  </p>
                )}
              </div>

              {/* Pillbox Time of Day (4-Box Organizer) */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                <label className="text-xs font-bold text-slate-800">
                  Pillbox Time of Day (Daily Schedule Organizer)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {[
                    { id: 'morning' as TimeOfDay, label: 'Morning', icon: Sun },
                    { id: 'afternoon' as TimeOfDay, label: 'Afternoon', icon: CloudSun },
                    { id: 'evening' as TimeOfDay, label: 'Evening', icon: Moon },
                    { id: 'bedtime' as TimeOfDay, label: 'Bedtime', icon: BedDouble },
                    { id: 'as_needed' as TimeOfDay, label: 'As Needed', icon: Zap },
                  ].map((slot) => {
                    const Icon = slot.icon;
                    const isSelected = reviewFields.timesOfDay.includes(slot.id);
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          const current = reviewFields.timesOfDay;
                          const updated = isSelected
                            ? current.filter((t) => t !== slot.id)
                            : [...current, slot.id];
                          setReviewFields({ ...reviewFields, timesOfDay: updated });
                        }}
                        className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
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
              </div>

              {/* Field 4: Dosage Form & Route */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">Dosage Form</label>
                    {renderConfidenceBadge(
                      getFieldInfo('dosageForm')?.confidence,
                      !reviewFields.dosageForm.trim()
                    )}
                  </div>
                  <Input
                    value={reviewFields.dosageForm}
                    onChange={(e) =>
                      setReviewFields({ ...reviewFields, dosageForm: e.target.value })
                    }
                    placeholder="Tablet, Capsule, Syrup"
                  />
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">Route</label>
                    {renderConfidenceBadge(
                      getFieldInfo('route')?.confidence,
                      !reviewFields.route.trim()
                    )}
                  </div>
                  <Input
                    value={reviewFields.route}
                    onChange={(e) => setReviewFields({ ...reviewFields, route: e.target.value })}
                    placeholder="Oral, Topical"
                  />
                </div>
              </div>

              {/* Field 5: Frequency & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">Frequency</label>
                    {renderConfidenceBadge(
                      getFieldInfo('frequency')?.confidence,
                      !reviewFields.frequency.trim()
                    )}
                  </div>
                  <Input
                    value={reviewFields.frequency}
                    onChange={(e) =>
                      setReviewFields({ ...reviewFields, frequency: e.target.value })
                    }
                    placeholder="Once daily, Every 8 hrs"
                  />
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">Duration</label>
                    {renderConfidenceBadge(
                      getFieldInfo('duration')?.confidence,
                      !reviewFields.duration.trim()
                    )}
                  </div>
                  <Input
                    value={reviewFields.duration}
                    onChange={(e) =>
                      setReviewFields({ ...reviewFields, duration: e.target.value })
                    }
                    placeholder="7 days"
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                <label className="text-xs font-bold text-slate-800">Notes</label>
                <Textarea
                  value={reviewFields.notes}
                  onChange={(e) => setReviewFields({ ...reviewFields, notes: e.target.value })}
                  rows={2}
                  placeholder="Additional prescribers notes or comments"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => setStep('upload')}
            >
              Back to Upload
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel without Saving
              </Button>
              <Button
                type="submit"
                size="sm"
                icon={<CheckCircle className="w-4 h-4" />}
                isLoading={isSaving}
              >
                Confirm & Save to Medication List
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
