import React, { useState } from 'react';
import { 
  MapPin, User, Phone, Mail, ArrowRight, Info, AlertCircle,
  Sparkles, RefreshCw, Globe, CheckCircle2
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

  const handleTranslateText = async () => {
    if (!formData.description?.trim() && !formData.title?.trim()) return;
    setIsTranslating(true);
    setTranslationError('');
    try {
      const result = await processMultimodalComplaint(formData, 'write');
      setTranslationResult(result);
      onUpdateFormData({
        // Only set title if user hasn't already provided one
        title: formData.title?.trim() ? formData.title : (result.structured_title || formData.title),
        // Preserve original user message in the top description box
        description: formData.description,
        location: (result.incident_location && result.incident_location !== 'Reported Incident Site') ? result.incident_location : (formData.location || 'Reported Incident Site'),
        detectedLanguage: result.detected_language,
        detectedLanguageCode: result.detected_language_code,
        originalLanguageText: formData.description,
        englishTranslation: result.english_sentence || result.structured_description
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

      {/* Complaint Description with Character Counter */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-slate-700">
            {t('form_desc_label', 'Complaint Description')} <span className="text-rose-500">*</span>
          </label>
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
            onUpdateFormData({ description: e.target.value });
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
            className="px-3 py-1 text-xs rounded-lg font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 self-start sm:self-center"
          >
            {isTranslating ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>✨ Translate to English</span>
              </>
            )}
          </button>
        </div>

        {translationResult && (
          <div className="mt-2 p-3 bg-violet-50/80 border border-violet-200 rounded-xl space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-violet-900 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Translated from {translationResult.detected_language} to English</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-200 text-violet-800">
                {translationResult.detected_language}
              </span>
            </div>
            <p className="text-slate-800 italic bg-white/80 p-2 rounded-lg border border-violet-100">
              "{translationResult.english_sentence || translationResult.structured_description}"
            </p>
            <p className="text-[10px] text-emerald-700">✓ English translation generated below. Your original message above is preserved.</p>
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
