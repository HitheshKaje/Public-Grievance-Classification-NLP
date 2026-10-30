import React, { useState } from 'react';
import { 
  MapPin, User, Phone, Mail, ArrowRight, Info, AlertCircle,
  Sparkles, RefreshCw, Globe, CheckCircle2, Copy, Check, RotateCcw
} from 'lucide-react';
import SupportingDocumentsDropzone from './SupportingDocumentsDropzone';
import { useLanguage } from '../../../context/LanguageContext';
import { processMultimodalComplaint } from '../../../services/complaintService';

export default function WriteComplaintForm({ formData, onUpdateFormData, onProceedToReview }) {
  const { t } = useLanguage();
  const [errors, setErrors] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState(null);
  const [translationError, setTranslationError] = useState('');
  const [copiedTranslation, setCopiedTranslation] = useState(false);

  const handleTranslateText = async () => {
    const rawDesc = formData.description?.trim();
    const rawTitle = formData.title?.trim();
    if (!rawDesc && !rawTitle) return;

    setIsTranslating(true);
    setTranslationError('');
    try {
      // 1. Strictly capture the citizen's original message in Box 1
      const originalInputDescription = formData.description || '';
      const originalInputTitle = formData.title || '';

      const result = await processMultimodalComplaint(formData, 'write');
      setTranslationResult(result);

      const convertedEnglish = result.english_sentence || result.structured_description || '';

      onUpdateFormData({
        // Only auto-fill title if citizen hasn't already provided one
        title: originalInputTitle ? originalInputTitle : (result.structured_title || originalInputTitle),
        // BOX 1: Keep citizen's original message in their input language (e.g., Hindi/Kannada)
        description: originalInputDescription,
        originalLanguageText: originalInputDescription,
        // BOX 2: Converted English translation ONLY
        englishTranslation: convertedEnglish,
        location: (result.incident_location && result.incident_location !== 'Reported Incident Site')
          ? result.incident_location
          : (formData.location || 'Reported Incident Site'),
        detectedLanguage: result.detected_language,
        detectedLanguageCode: result.detected_language_code,
      });

      if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
      if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
      if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
    } catch (err) {
      console.error('Translation error:', err);
      setTranslationError(err.message || 'Translation failed. The backend will process upon submission.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopyEnglish = async (textToCopy) => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedTranslation(true);
      setTimeout(() => setCopiedTranslation(false), 2000);
    } catch (err) {
      console.error('Failed to copy translation:', err);
    }
  };

  const activeEnglish = translationResult?.english_sentence || formData.englishTranslation || translationResult?.structured_description;
  const activeLanguage = translationResult?.detected_language || formData.detectedLanguage;

  const validate = () => {
    const errs = {};
    if (!formData.title?.trim()) {
      errs.title = 'Complaint title is required.';
    } else if (formData.title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters long.';
    }

    if (!formData.description?.trim()) {
      errs.description = 'Please describe your grievance in detail.';
    } else if (formData.description.trim().length < 20) {
      errs.description = 'Description should be at least 20 characters so the NLP classifier can route it effectively.';
    }

    if (!formData.location?.trim()) {
      errs.location = 'Incident location or area is required.';
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
      {/* Complaint Title */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          {t('form_title_label', 'Complaint Title')} <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => {
            onUpdateFormData({ title: e.target.value });
            if (errors.title) setErrors({ ...errors, title: '' });
          }}
          placeholder={t('form_title_placeholder', 'Brief summary of the issue (e.g., Major drinking water pipeline leakage in 4th Block)')}
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

      {/* Complaint Description with Character Counter (BOX 1: Citizen Input) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700">
              {t('form_desc_label', 'Complaint Description')} <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
              Box 1 (Citizen Message)
            </span>
          </div>
          <span className={`text-[11px] font-mono ${
            (formData.description?.length || 0) < 20 ? 'text-amber-600' : 'text-slate-400'
          }`}>
            {formData.description?.length || 0} / 2000 chars (min 20)
          </span>
        </div>
        <textarea
          rows={5}
          value={formData.description || ''}
          maxLength={2000}
          onChange={(e) => {
            const val = e.target.value;
            onUpdateFormData({ 
              description: val,
              originalLanguageText: val,
              // Reset translation when citizen edits their text so they can re-translate
              englishTranslation: ''
            });
            if (translationResult) setTranslationResult(null);
            if (errors.description) setErrors({ ...errors, description: '' });
          }}
          placeholder={t('form_desc_placeholder', 'Describe the problem clearly. Mention when it started, how it affects residents, and specific context to assist department officers...')}
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

        {/* Restore Original Hindi Text Helper (if description was previously overwritten) */}
        {formData.originalLanguageText && formData.originalLanguageText !== formData.description && (
          <div className="mt-1.5 flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            <span className="text-[11px]">
              Original message detected in memory: <em>"{formData.originalLanguageText.substring(0, 60)}..."</em>
            </span>
            <button
              type="button"
              onClick={() => onUpdateFormData({ description: formData.originalLanguageText })}
              className="px-2.5 py-1 text-[11px] font-semibold bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Restore Original</span>
            </button>
          </div>
        )}

        {/* Multilingual Translation Helper & Action */}
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <Globe className="h-3.5 w-3.5 text-violet-600 flex-shrink-0" />
            <span>You can write in <strong>Hindi (हिन्दी)</strong>, <strong>Kannada (ಕನ್ನಡ)</strong>, or <strong>English</strong>.</span>
          </div>

          <button
            type="button"
            disabled={isTranslating || (!formData.description?.trim() && !formData.title?.trim())}
            onClick={handleTranslateText}
            className="px-3 py-1.5 text-xs rounded-lg font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 self-start sm:self-center shadow-xs"
          >
            {isTranslating ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Translating to English...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>✨ Translate to English</span>
              </>
            )}
          </button>
        </div>

        {translationError && (
          <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{translationError}</span>
          </div>
        )}

        {/* BOX 2: Converted English Translation ONLY */}
        {activeEnglish && (
          <div className="mt-3 p-3.5 bg-violet-50/90 border border-violet-200/90 rounded-xl space-y-2 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-violet-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>
                  Translated from {activeLanguage || 'Non-English'} to English
                </span>
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-200 text-violet-800 uppercase tracking-wide">
                  {activeLanguage || 'Translated'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyEnglish(activeEnglish)}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-violet-200 text-slate-700 hover:bg-violet-50 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Copy translated English text"
                >
                  {copiedTranslation ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-violet-700 uppercase tracking-wider block">
                Official Converted English Statement (Box 2)
              </span>
              <p className="text-slate-800 bg-white/95 p-3 rounded-lg border border-violet-100 leading-relaxed font-medium">
                "{activeEnglish}"
              </p>
            </div>

            <p className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
              <span>✓ English translation generated in this second box only. Your original message in the description box above is preserved.</span>
            </p>
          </div>
        )}
      </div>

      {/* Incident Location */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          {t('form_location_label', 'Incident / Problem Location')} <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => {
              onUpdateFormData({ location: e.target.value });
              if (errors.location) setErrors({ ...errors, location: '' });
            }}
            placeholder={t('form_location_placeholder', 'Street name, landmark, Ward number, locality, or pin code')}
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

      {/* Contact Details (Optional / Updates) */}
      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-3">
        <span className="text-xs font-semibold text-slate-800 block">
          {t('form_contact_header', 'Citizen Contact Details')}
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">{t('full_name', 'Citizen Name')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={formData.citizenName || ''}
                onChange={(e) => onUpdateFormData({ citizenName: e.target.value })}
                placeholder="Your full name"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">{t('phone', 'Mobile Number')}</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => {
                  onUpdateFormData({ phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
                placeholder="+91 98765 43210"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            {errors.phone && <p className="text-[10px] text-rose-600 mt-0.5">{errors.phone}</p>}
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">{t('email', 'Email Address')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => {
                  onUpdateFormData({ email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="citizen@example.com"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            {errors.email && <p className="text-[10px] text-rose-600 mt-0.5">{errors.email}</p>}
          </div>
        </div>
      </div>

      {/* Supporting Documents (Optional) */}
      <SupportingDocumentsDropzone
        attachments={formData.attachments || []}
        onAttachmentsChange={(files) => onUpdateFormData({ attachments: files })}
      />

      {/* Form Action */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          className="bg-[#1e6bf3] hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 flex items-center gap-2 text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <span>{t('review_submission_btn', 'Review Complaint')}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
