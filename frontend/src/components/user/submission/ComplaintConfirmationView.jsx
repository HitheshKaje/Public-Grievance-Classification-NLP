import React, { useState } from 'react';
import { 
  CheckCircle, PlusCircle, LayoutDashboard, Clock, FileText, 
  MapPin, Copy, Check, Search, ShieldCheck, Tag, Building2,
  Paperclip, AlertCircle
} from 'lucide-react';

export default function ComplaintConfirmationView({
  formData,
  method,
  submittedComplaint,
  onSubmitAnother,
  onReturnToDashboard,
  onTrackGrievance
}) {
  const [copied, setCopied] = useState(false);

  // If no saved complaint data is present, never render a fake ID or success state
  if (!submittedComplaint || !submittedComplaint.complaint_id) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6 stroke-[2]" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">
            No Saved Complaint Information Available
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
            We could not confirm database persistence for this complaint. No Complaint ID has been assigned.
          </p>
        </div>
        <button
          type="button"
          onClick={onSubmitAnother}
          className="px-5 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-300 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
        >
          Return to Submission Form
        </button>
      </div>
    );
  }

  const complaintId = submittedComplaint.complaint_id;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(complaintId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const formattedDate = submittedComplaint.created_at
    ? new Date(submittedComplaint.created_at).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

  return (
    <div className="space-y-6">
      {/* Success Celebration Banner */}
      <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-6 sm:p-7 text-center space-y-3">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm ring-4 ring-emerald-50">
          <CheckCircle className="h-8 w-8 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Grievance Registered Successfully
          </h2>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed mt-1">
            Your complaint has been securely recorded in the official database. Use your unique Complaint ID below to track its processing status.
          </p>
        </div>

        {/* Unique Generated Complaint ID Card */}
        <div className="pt-2 max-w-md mx-auto">
          <div className="p-3.5 bg-white rounded-xl border border-emerald-300/80 shadow-sm flex items-center justify-between gap-3">
            <div className="text-left min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Official Complaint ID
              </span>
              <span className="text-base sm:text-lg font-extrabold text-blue-600 font-mono tracking-wide truncate block">
                {complaintId}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyId}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Copy Complaint ID to Clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Official Grievance Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Recorded Complaint Record
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" /> {formattedDate}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Complaint Title</span>
            <span className="font-semibold text-slate-800">{submittedComplaint.title}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Incident Location</span>
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
              <span>{submittedComplaint.location || 'Not specified'}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Complaint Status</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 mt-0.5">
              {submittedComplaint.status || 'Pending'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Forwarding Status</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 mt-0.5">
              {submittedComplaint.forwarding_status || 'Not Forwarded'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Predicted Category</span>
            <div className="flex items-center gap-1.5 text-slate-600 mt-0.5">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
              <span className="italic">{submittedComplaint.predicted_category || 'Unclassified'}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Assigned Department</span>
            <div className="flex items-center gap-1.5 text-slate-600 mt-0.5">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              <span className="italic">{submittedComplaint.assigned_department || 'Unassigned (Pending Review)'}</span>
            </div>
          </div>
        </div>

        {/* Complaint Description Context */}
        {submittedComplaint.description && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-slate-400 block text-[11px] font-medium mb-1">
              Registered Description
            </span>
            <p className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed">
              {submittedComplaint.description}
            </p>
          </div>
        )}

        {/* File References */}
        {submittedComplaint.file_references && submittedComplaint.file_references.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Paperclip className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Saved Attachments ({submittedComplaint.file_references.length})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {submittedComplaint.file_references.map((f, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs">
                  <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="truncate flex-1 font-medium text-slate-700">{f.original_name}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{f.file_type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {onTrackGrievance && (
          <button
            type="button"
            onClick={() => onTrackGrievance(complaintId)}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-[#1e6bf3] hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Search className="h-4 w-4" />
            <span>Track This Grievance</span>
          </button>
        )}

        <button
          type="button"
          onClick={onSubmitAnother}
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Submit Another Grievance</span>
        </button>

        <button
          type="button"
          onClick={onReturnToDashboard}
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
