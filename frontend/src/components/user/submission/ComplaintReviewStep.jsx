import React from 'react';
import { 
  ArrowLeft, Send, CheckCircle2, FileText, Image as ImageIcon, 
  MapPin, User, Phone, Mail, Paperclip, AlertTriangle, ShieldCheck
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
  method, // 'write' | 'pdf' | 'image'
  onBackToEdit,
  onSubmitFinal
}) {
  const methodLabels = {
    write: { label: 'Direct Written Complaint', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    pdf: { label: 'PDF Document Complaint', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    image: { label: 'Photographic Evidence Complaint', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  };

  const badge = methodLabels[method] || methodLabels.write;

  return (
    <div className="space-y-6">
      {/* Review Header Banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Step 2 of 2 &bull; Pre-Submission Review
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Please verify all grievance details before final submission. You can click 'Edit Details' below to make corrections.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToEdit}
          className="px-3 py-1.5 text-xs text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
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
        <div className="p-4 sm:p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Complaint Description & Context
          </span>
          {formData.description?.trim() ? (
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
              {formData.description}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No written description provided. Details are contained within the attached primary document.
            </p>
          )}

          {/* Special Honest Note for PDF extracted text */}
          {method === 'pdf' && (
            <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Text Extraction Status:</strong> Document text will be extracted via the backend ingestion pipeline upon official submission. No synthetic text is displayed.
              </div>
            </div>
          )}
        </div>

        {/* Primary Attached File (for PDF or Image methods) */}
        {(formData.pdfFile || formData.imageFile) && (
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

      {/* NLP Notice */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
        <ShieldCheck className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Upon submitting, your grievance will be enqueued for <strong>NLP Department Classification</strong>. 
          No manual department routing is required. The system will assign your complaint to the relevant municipal authority.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBackToEdit}
          className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Edit</span>
        </button>

        <button
          type="button"
          onClick={onSubmitFinal}
          className="bg-[#1e6bf3] hover:bg-blue-700 text-white rounded-xl px-7 py-2.5 flex items-center gap-2 text-xs font-semibold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
        >
          <Send className="h-4 w-4" />
          <span>Submit Complaint</span>
        </button>
      </div>
    </div>
  );
}
