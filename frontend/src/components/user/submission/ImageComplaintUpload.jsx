import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, UploadCloud, Trash2, RefreshCw, AlertCircle, 
  MapPin, User, Phone, Mail, ArrowRight, Info, Eye, Image as ImageIcon,
  Sparkles, CheckCircle2
} from 'lucide-react';
import SupportingDocumentsDropzone from './SupportingDocumentsDropzone';
import { processMultimodalComplaint } from '../../../services/complaintService';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const PROBLEM_EXAMPLES = [
  'Damaged roads / Potholes',
  'Water pipeline leakage',
  'Broken streetlight',
  'Garbage accumulation',
  'Electricity wire hazard'
];

export default function ImageComplaintUpload({ formData, onUpdateFormData, onProceedToReview }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [errors, setErrors] = useState({});
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState(null);
  const [translationError, setTranslationError] = useState('');
  const fileInputRef = useRef(null);

  const primaryImage = formData.imageFile || null;

  // Generate object URL for image preview safely and clean up
  useEffect(() => {
    if (primaryImage && primaryImage instanceof File) {
      const url = URL.createObjectURL(primaryImage);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreviewUrl(null);
    }
  }, [primaryImage]);

  const handleFileValidation = (file) => {
    setUploadError('');
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const hasValidExt = lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.png');
    const hasValidMime = ALLOWED_IMAGE_TYPES.includes(file.type);

    if (!hasValidExt && !hasValidMime) {
      setUploadError('Invalid image format. Supported formats are JPG, JPEG, and PNG.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setUploadError(`Image exceeds maximum allowed size of 10MB (${formatBytes(file.size)}).`);
      return;
    }

    onUpdateFormData({ imageFile: file });
    if (errors.imageFile) {
      setErrors((prev) => ({ ...prev, imageFile: '' }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileValidation(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    onUpdateFormData({ imageFile: null });
    setUploadError('');
    setTranslationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // AI Multilingual Image OCR & English Conversion Handler
  const handleAiAnalyzeImage = async () => {
    if (!formData.imageFile) return;
    setIsTranslating(true);
    setTranslationError('');
    try {
      const result = await processMultimodalComplaint(formData, 'image');
      setTranslationResult(result);
      onUpdateFormData({
        title: result.structured_title || formData.title,
        description: result.english_sentence || result.structured_description || formData.description,
        location: (result.incident_location && result.incident_location !== 'Reported Incident Site') ? result.incident_location : (formData.location || 'Reported Incident Site'),
        detectedLanguage: result.detected_language,
        detectedLanguageCode: result.detected_language_code,
        originalLanguageText: result.original_transcription,
        englishTranslation: result.english_sentence
      });
      if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
      if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
      if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
    } catch (err) {
      console.error('Image analysis error:', err);
      setTranslationError(err.message || 'AI image conversion could not be completed. The backend will process and translate upon submission.');
    } finally {
      setIsTranslating(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!primaryImage) {
      errs.imageFile = 'Please attach at least one clear photograph of the issue.';
    }

    // Auto-populate title if citizen uploaded photo without typing
    if (!formData.title?.trim()) {
      if (translationResult?.structured_title) {
        onUpdateFormData({ title: translationResult.structured_title });
      } else if (primaryImage) {
        onUpdateFormData({ title: 'Photographic Evidence Civic Grievance' });
      } else {
        errs.title = 'Complaint title is required.';
      }
    }

    // Auto-populate description if photo attached
    if (!formData.description?.trim()) {
      if (translationResult?.english_sentence) {
        onUpdateFormData({ description: translationResult.english_sentence });
      } else if (primaryImage) {
        onUpdateFormData({ description: 'Photographic evidence attached for administrative inspection and rectification.' });
      } else {
        errs.description = 'Written explanation or AI image analysis is required.';
      }
    }

    if (!formData.location?.trim()) {
      if (translationResult?.incident_location && translationResult.incident_location !== 'Reported Incident Site') {
        onUpdateFormData({ location: translationResult.incident_location });
      } else {
        errs.location = 'Incident location or landmark is required.';
      }
    }

    if (formData.phone && !/^[0-9+\-\s]{8,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid phone number or leave blank.';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address or leave blank.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onProceedToReview();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Primary Image Upload Area */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Upload Problem Photograph <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-slate-400">JPG, JPEG, PNG (max 10MB)</span>
        </div>

        {!primaryImage ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all bg-white ${
              isDragging
                ? 'border-blue-500 bg-blue-50/40'
                : errors.imageFile
                ? 'border-rose-300 bg-rose-50/20'
                : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50'
            }`}
          >
            <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 shadow-sm">
              <Camera className="h-6 w-6 stroke-[1.8]" />
            </div>

            <p className="text-xs font-semibold text-slate-800 mb-1">
              Drag and drop your photograph here
            </p>
            <p className="text-[11px] text-slate-500 mb-3">
              Clear on-site photos of potholes, leaking pipes, broken lights, or garbage
            </p>

            {/* Quick helper tag examples */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3.5">
              {PROBLEM_EXAMPLES.map((ex, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 border border-slate-200/60"
                >
                  {ex}
                </span>
              ))}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileValidation(e.target.files[0]);
                }
              }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200/60 cursor-pointer"
            >
              Browse Photograph
            </button>
          </div>
        ) : (
          /* Image Preview & Details Card */
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Thumbnail Preview */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 group">
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Complaint Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800 truncate block">
                      {primaryImage.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
                      {primaryImage.name.split('.').pop()?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                    <span>{formatBytes(primaryImage.size)}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-600 font-medium">Visual proof attached</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileValidation(e.target.files[0]);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Image OCR & Translation Card */}
        {primaryImage && (
          <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-slate-50/90 border border-blue-200/90 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-950">
                    Multilingual Image OCR & English Conversion
                  </span>
                </div>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Reads text on boards/letters in Hindi (हिन्दी) or Kannada (ಕನ್ನಡ) or visually analyzes the scene, converting everything to English sentences.
                </p>
              </div>

              <button
                type="button"
                disabled={isTranslating}
                onClick={handleAiAnalyzeImage}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 self-start sm:self-center"
              >
                {isTranslating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Analyzing Image...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span>{translationResult ? 'Re-analyze Image' : '✨ Read Image & Convert to English'}</span>
                  </>
                )}
              </button>
            </div>

            {translationError && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1 bg-white/70 p-2 rounded-lg border border-rose-200">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{translationError}</span>
              </p>
            )}

            {translationResult && (
              <div className="bg-white/95 rounded-xl border border-blue-100 p-3.5 space-y-2.5 text-xs shadow-xs">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="font-bold text-emerald-700 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Visual Evidence & OCR Converted to English</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    Detected Language: {translationResult.detected_language}
                  </span>
                </div>

                {translationResult.original_transcription && (
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Extracted Text / Evidence ({translationResult.detected_language})
                    </span>
                    <p className="text-slate-800 italic">
                      "{translationResult.original_transcription}"
                    </p>
                  </div>
                )}

                <div className="p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-lg space-y-1">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">
                    Converted English Sentence (Official Administrative Record)
                  </span>
                  <p className="text-slate-900 font-semibold leading-relaxed">
                    "{translationResult.english_sentence}"
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-600">
                  <span>Dept: <strong className="text-slate-800">{translationResult.detected_department}</strong></span>
                  <span>&bull;</span>
                  <span>Priority: <strong className={translationResult.priority === 'High' ? 'text-rose-600' : 'text-slate-800'}>{translationResult.priority}</strong></span>
                </div>
                <p className="text-[10px] text-emerald-600 font-medium">✓ Title, English description, and landmark are auto-synced below.</p>
              </div>
            )}
          </div>
        )}

        {/* Upload Error */}
        {uploadError && (
          <p className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{uploadError}</span>
          </p>
        )}
        {errors.imageFile && !uploadError && (
          <p className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{errors.imageFile}</span>
          </p>
        )}
      </div>

      {/* Complaint Title */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Complaint Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => {
            onUpdateFormData({ title: e.target.value });
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          placeholder="e.g., Deep pothole causing vehicular damage near Main Market"
          className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
            errors.title
              ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-50/30'
              : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.title}</span>
          </p>
        )}
      </div>

      {/* Mandatory Complaint Description for NLP */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-slate-700">
            Complaint Description <span className="text-rose-500">*</span>
          </label>
          <span className={`text-[11px] font-mono ${
            (formData.description?.length || 0) < 20 ? 'text-amber-600' : 'text-slate-400'
          }`}>
            {formData.description?.length || 0} / 2000 chars (min 20)
          </span>
        </div>
        <textarea
          rows={4}
          value={formData.description || ''}
          maxLength={2000}
          onChange={(e) => {
            onUpdateFormData({ description: e.target.value });
            if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
          }}
          placeholder="Describe what is shown in the photo, the severity of the problem, and when it occurred so the AI classifier can accurately determine the department..."
          className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white text-slate-800 placeholder-slate-400 focus:outline-none transition-all leading-relaxed ${
            errors.description
              ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-50/30'
              : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.description}</span>
          </p>
        )}
      </div>

      {/* Incident Location */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Incident / Problem Location <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => {
              onUpdateFormData({ location: e.target.value });
              if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
            }}
            placeholder="Precise landmark, street name, cross road, or ward number"
            className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border bg-white text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
              errors.location
                ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-50/30'
                : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
        </div>
        {errors.location && (
          <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.location}</span>
          </p>
        )}
      </div>

      {/* Citizen Contact Details */}
      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-3">
        <span className="text-xs font-semibold text-slate-800 block">
          Citizen Contact Details
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={formData.citizenName || ''}
                onChange={(e) => onUpdateFormData({ citizenName: e.target.value })}
                placeholder="Full name"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => {
                  onUpdateFormData({ phone: e.target.value });
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                placeholder="+91 98765 43210"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            {errors.phone && <p className="text-[10px] text-rose-600 mt-0.5">{errors.phone}</p>}
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => {
                  onUpdateFormData({ email: e.target.value });
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="citizen@example.com"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            {errors.email && <p className="text-[10px] text-rose-600 mt-0.5">{errors.email}</p>}
          </div>
        </div>
      </div>

      {/* Additional Supporting Documents */}
      <SupportingDocumentsDropzone
        attachments={formData.attachments || []}
        onAttachmentsChange={(files) => onUpdateFormData({ attachments: files })}
      />

      {/* Submit Action */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          className="bg-[#1e6bf3] hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 flex items-center gap-2 text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <span>Review Submission</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
