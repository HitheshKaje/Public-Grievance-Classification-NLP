import React from 'react';
import { 
  CheckCircle, PlusCircle, LayoutDashboard, Clock, FileText, 
  MapPin, ShieldAlert, Cpu, Sparkles 
} from 'lucide-react';

export default function ComplaintConfirmationView({
  formData,
  method,
  onSubmitAnother,
  onReturnToDashboard
}) {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Success / Demonstration Banner */}
      <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
          <CheckCircle className="h-8 w-8 stroke-[2]" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">
          Complaint Payload Prepared Successfully
        </h2>
        <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
          Your complaint details and attachments have passed all client-side validations and are ready to be transmitted to the government grievance intake API.
        </p>

        {/* Explicit Backend Disclaimer */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 border border-amber-200 text-[11px] text-amber-900 font-medium">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
          <span>Frontend Demonstration State &bull; Official database submission requires live backend connection</span>
        </div>
      </div>

      {/* Structured Payload Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Submission Summary
          </h3>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="h-3 w-3" /> {currentDate}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Grievance Title</span>
            <span className="font-semibold text-slate-800">{formData.title}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Incident Location</span>
            <span className="font-semibold text-slate-800">{formData.location}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Filing Channel</span>
            <span className="font-semibold text-slate-800 capitalize">
              {method === 'write'
                ? 'Direct Form Entry'
                : method === 'pdf'
                ? 'PDF Document Upload'
                : method === 'voice'
                ? 'Voice Grievance Recording'
                : 'Photo Evidence Upload'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Citizen Contact</span>
            <span className="font-semibold text-slate-800">
              {formData.phone || formData.email || formData.citizenName || 'Registered citizen profile'}
            </span>
          </div>
        </div>

        {/* Future Pipeline Preview */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 mt-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Cpu className="h-4 w-4 text-blue-600" />
            <span>Next Processing Stages (Upon Backend Integration):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
              <span className="text-blue-600 font-bold block mb-0.5">1. Ingestion</span>
              <span className="text-slate-500">FastAPI receives payload & assigns official ID</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
              <span className="text-blue-600 font-bold block mb-0.5">2. NLP Classification</span>
              <span className="text-slate-500">TF-IDF & Logistic Regression routes to department</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
              <span className="text-blue-600 font-bold block mb-0.5">3. Officer Review</span>
              <span className="text-slate-500">Verification & work order generation</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
              <span className="text-blue-600 font-bold block mb-0.5">4. Resolution</span>
              <span className="text-slate-500">Citizen notification & grievance resolution</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
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
          className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-[#1e6bf3] hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
