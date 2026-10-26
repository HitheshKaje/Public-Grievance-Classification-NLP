import React, { useState, useRef } from 'react';
import { 
  FileText, UploadCloud, Trash2, RefreshCw, AlertCircle, 
  MapPin, User, Phone, Mail, ArrowRight, Info, CheckCircle2, ShieldAlert,
  Sparkles
} from 'lucide-react';
import SupportingDocumentsDropzone from './SupportingDocumentsDropzone';
import { processMultimodalComplaint } from '../../../services/complaintService';

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function PdfComplaintUpload({ formData, onUpdateFormData, onProceedToReview }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [errors, setErrors] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState(null);
  const [translationError, setTranslationError] = useState('');
  const fileInputRef = useRef(null);

  const selectedPdf = formData.pdfFile || null;

  const handleFileValidationAndSet = (file) => {
    setUploadError('');
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isPdf = fileName.endsWith('.pdf') || file.type === 'application/pdf';

    if (!isPdf) {
      setUploadError('Invalid file format. Only PDF documents (.pdf) are accepted for document-based filing.');
      return;
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      setUploadError(`File exceeds maximum size of 10MB (${formatBytes(file.size)}). Please compress or select a smaller PDF.`);
      return;
    }

    // Auto-populate title if empty and filename looks meaningful
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    const updates = { pdfFile: file };
    if (!formData.title?.trim() && cleanName.length >= 5) {
      updates.title = cleanName;
    }

    onUpdateFormData(updates);
    if (errors.pdfFile) {
      setErrors((prev) => ({ ...prev, pdfFile: '' }));
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
      handleFileValidationAndSet(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePdf = () => {
    onUpdateFormData({ pdfFile: null });
    setUploadError('');
    setTranslationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // AI Multilingual PDF Extraction & English Conversion Handler
  const handleAiAnalyzePdf = async () => {
    if (!formData.pdfFile) return;
    setIsTranslating(true);
    setTranslationError('');
    try {
      const result = await processMultimodalComplaint(formData, 'pdf');
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
      if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
    } catch (err) {
      console.error('PDF analysis error:', err);
      setTranslationError(err.message || 'AI PDF petition conversion could not be completed. The backend will process and translate upon submission.');
    } finally {
      setIsTranslating(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!selectedPdf) {
      errs.pdfFile = 'Please upload a PDF complaint document before proceeding.';
    }

    // Auto-populate title if empty and PDF attached
    if (!formData.title?.trim()) {
      if (translationResult?.structured_title) {
        onUpdateFormData({ title: translationResult.structured_title });
      } else if (selectedPdf) {
        onUpdateFormData({ title: 'PDF Grievance Petition' });
      } else {
        errs.title = 'Complaint title is required.';
      }
    }

    if (!formData.location?.trim()) {
      if (translationResult?.incident_location && translationResult.incident_location !== 'Reported Incident Site') {
        onUpdateFormData({ location: translationResult.incident_location });
      } else {
        errs.location = 'Incident location or area is required.';
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
      {/* PDF Dropzone Area */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
          Upload PDF Complaint Document <span className="text-rose-500">*</span>
        </label>

        {!selectedPdf ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all bg-white ${
              isDragging
                ? 'border-blue-500 bg-blue-50/40'
                : errors.pdfFile
                ? 'border-rose-300 bg-rose-50/20'
                : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50'
            }`}
          >
            <div className="mx-auto w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3 shadow-sm">
              <UploadCloud className="h-6 w-6 stroke-[1.8]" />
            </div>

            <p className="text-xs font-semibold text-slate-800 mb-1">
              Drag and drop your PDF complaint file here
            </p>
            <p className="text-[11px] text-slate-500 mb-3.5">
              Supports official petitions, typed complaints, or scanned letters up to 10MB
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileValidationAndSet(e.target.files[0]);
                }
              }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200/60 cursor-pointer"
            >
              Browse PDF File
            </button>
          </div>
        ) : (
          /* Selected PDF File Card */
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-rose-100/80 border border-rose-200 flex items-center justify-center text-rose-600 flex-shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800 truncate block">
                    {selectedPdf.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200 flex-shrink-0">
                    PDF
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                  <span>{formatBytes(selectedPdf.size)}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="h-3 w-3" /> Ready for upload
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileValidationAndSet(e.target.files[0]);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Replace PDF"
                className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleRemovePdf}
                title="Remove PDF"
                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Upload Error */}
        {uploadError && (
          <p className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{uploadError}</span>
          </p>
        )}
        {errors.pdfFile && !uploadError && (
          <p className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{errors.pdfFile}</span>
          </p>
        )}
      </div>

      {/* Complaint Title */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Complaint Subject / Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => {
            onUpdateFormData({ title: e.target.value });
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          placeholder="e.g., Formal petition regarding defective sewage main line"
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

      {/* Optional Brief Synopsis */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-slate-700">
            Brief Overview / Key Extract Points <span className="text-slate-400 font-normal">(Optional context)</span>
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            {formData.description?.length || 0} / 1000 chars
          </span>
        </div>
        <textarea
          rows={3}
          value={formData.description || ''}
          maxLength={1000}
          onChange={(e) => onUpdateFormData({ description: e.target.value })}
          placeholder="Add key highlights from your attached document to assist fast routing (optional)..."
          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all leading-relaxed"
        />
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
            placeholder="Street address, ward, locality, or landmark referenced in the petition"
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

      {/* Contact Details */}
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

      {/* Action */}
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
