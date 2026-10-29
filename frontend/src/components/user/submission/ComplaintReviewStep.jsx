import React, { useMemo } from 'react';
import { 
  ArrowLeft, Send, CheckCircle2, FileText, Image as ImageIcon, 
  MapPin, User, Phone, Mail, Paperclip, AlertTriangle, ShieldCheck,
  Volume2, FileAudio, Sparkles, Globe
} from 'lucide-react';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function ComplaintReviewStep({
  formData,
  method, // 'write' | 'pdf' | 'image' | 'voice'
  onBackToEdit,
  onSubmitFinal,
  isSubmitting = false,
  submitError = null
}) {
  const audioPlaybackUrl = useMemo(() => {
    const audioSource = formData.audioFile || formData.audioBlob;
    if (audioSource instanceof Blob || audioSource instanceof File) {
      return URL.createObjectURL(audioSource);
    }
    return null;
  }, [formData.audioFile, formData.audioBlob]);
  const methodLabels = {
    write: { label: 'Direct Written Complaint', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    pdf: { label: 'PDF Document Complaint', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    image: { label: 'Photographic Evidence Complaint', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    voice: { label: 'Voice Grievance Recording', color: 'bg-violet-50 text-violet-700 border-violet-200' }
  };

  const badge = methodLabels[method] || methodLabels.write;

  return (
    <div className="space-y-6">
      {/* Submission Error Alert */}
      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3 text-xs animate-in fade-in">
          <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-900">Submission Failed</p>
            <p className="text-rose-700 leading-relaxed">{submitError}</p>
          </div>
        </div>
      )}

      {/* Review Header Banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Review Grievance Details
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${badge.color}`}>
              {badge.label}
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBackToEdit}
          className="px-3 py-1.5 text-xs text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Edit Details</span>
        </button>
      </div>

      {/* Structured Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
        {/* Title */}
        <div className="p-4 sm:p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Complaint Title
          </span>
          <h3 className="text-sm sm:text-base font-bold text-slate-800">
            {formData.title || <span className="text-slate-400 italic">No title provided</span>}
          </h3>
        </div>

        {/* Location */}
        <div className="p-4 sm:p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Incident Location
          </span>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <MapPin className="h-4 w-4 text-rose-500 flex-shrink-0" />
            <span>{formData.location || <span className="text-slate-400 italic">No location provided</span>}</span>
          </div>
        </div>

        {/* Description / Text Details */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Complaint Description & Context
            </span>
            {formData.detectedLanguage && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-800 border border-violet-200 flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <span>Intake: {formData.detectedLanguage}</span>
              </span>
            )}
          </div>

          {/* Original Statement if in Hindi or Kannada */}
          {(formData.originalLanguageText || (formData.detectedLanguage && formData.detectedLanguage !== 'English')) && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Original Citizen Statement {formData.detectedLanguage ? `(${formData.detectedLanguage})` : ''}
              </span>
              <p className="text-xs text-slate-700 italic">
                "{formData.originalLanguageText || formData.description}"
              </p>
            </div>
          )}

          {/* Converted English Sentence */}
          {(formData.englishTranslation || formData.description)?.trim() ? (
            <div className="p-3.5 bg-violet-50/50 rounded-xl border border-violet-100 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed space-y-1">
              {formData.detectedLanguage && formData.detectedLanguage !== 'English' && (
                <span className="text-[10px] uppercase font-bold text-violet-700 block mb-0.5">
                  Official Converted English Statement
                </span>
              )}
              <p className="font-medium text-slate-800">
                {formData.englishTranslation || formData.description}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No written description provided. Details are contained within the attached primary document.
            </p>
          )}
        </div>

        {/* Primary Attached File (for PDF, Image, or Voice methods) */}
        {(formData.pdfFile || formData.imageFile || formData.audioFile || formData.audioBlob) && (
          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Primary Document / Evidence
            </span>

            {formData.pdfFile && (
              <div className="flex items-center gap-3 p-3 bg-rose-50/40 border border-rose-200/80 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{formData.pdfFile.name}</p>
                  <p className="text-[11px] text-slate-500">{formatBytes(formData.pdfFile.size)} &bull; Official Petition Document</p>
                </div>
              </div>
            )}

            {formData.imageFile && (
              <div className="flex items-center gap-3 p-3 bg-blue-50/40 border border-blue-200/80 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{formData.imageFile.name}</p>
                  <p className="text-[11px] text-slate-500">{formatBytes(formData.imageFile.size)} &bull; Photographic Proof</p>
                </div>
              </div>
            )}

            {(formData.audioFile || formData.audioBlob) && (
              <div className="p-3.5 bg-violet-50/50 border border-violet-200/80 rounded-xl space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0">
                    <FileAudio className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {formData.audioFile?.name || 'Grievance Voice Recording'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {formData.audioFile?.size ? formatBytes(formData.audioFile.size) : 'Recorded Audio Note'} &bull; Audio Grievance
                    </p>
                  </div>
                </div>
                {/* Audio playback control */}
                {audioPlaybackUrl && (
                  <audio
                    controls
                    src={audioPlaybackUrl}
                    className="w-full h-9 rounded-lg"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Optional Supporting Attachments */}
        {formData.attachments && formData.attachments.length > 0 && (
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-1.5 mb-2">
              <Paperclip className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Supporting Attachments ({formData.attachments.length})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {formData.attachments.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg text-xs">
                  <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate flex-1 font-medium text-slate-700">{file.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{formatBytes(file.size)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="p-4 sm:p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Citizen Contact Information
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>{formData.citizenName?.trim() || <span className="text-slate-400 italic">Not provided</span>}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <span>{formData.phone?.trim() || <span className="text-slate-400 italic">Not provided</span>}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>{formData.email?.trim() || <span className="text-slate-400 italic">Not provided</span>}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBackToEdit}
          className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Edit</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmitFinal}
          className={`bg-[#1e6bf3] hover:bg-blue-700 text-white rounded-xl px-7 py-2.5 flex items-center gap-2 text-xs font-semibold shadow-md shadow-blue-600/25 transition-all ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Submitting Complaint...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Submit Complaint</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
