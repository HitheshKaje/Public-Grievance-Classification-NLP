import React, { useState } from 'react';
import { 
  Search, Clock, ShieldAlert, Cpu, CheckCircle2, 
  ArrowRight, Building2, AlertCircle, FileSearch 
} from 'lucide-react';
import TrackComplaintCard from './TrackComplaintCard';

const LIFECYCLE_STAGES = [
  { step: 1, title: 'Received & Logged', desc: 'Complaint timestamped and recorded in official database' },
  { step: 2, title: 'Automated NLP Categorization', desc: 'TF-IDF & Logistic Regression model assigns department' },
  { step: 3, title: 'Officer Assessment', desc: 'Departmental authority reviews and issues work order' },
  { step: 4, title: 'Field Action & Resolution', desc: 'Issue resolved on-site and citizen notified' }
];

export default function UserTrackingView({ initialTrackedId = null }) {
  const [trackedId, setTrackedId] = useState(initialTrackedId || '');
  const [searchedId, setSearchedId] = useState(initialTrackedId || '');

  const handleTrackSubmit = (id) => {
    setTrackedId(id);
    setSearchedId(id);
  };

  return (
    <div className="space-y-5">
      {/* Title & Context */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800">
          Track Grievance Status
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Monitor the real-time processing stage, assigned department, and resolution timeline of your filed complaints.
        </p>
      </div>

      {/* Input Search Card */}
      <TrackComplaintCard onTrack={handleTrackSubmit} />

      {/* Results Container */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        {searchedId ? (
          <div className="space-y-6">
            {/* Lookup Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Reference Query
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <FileSearch className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {searchedId}
                  </span>
                </div>
              </div>

              <div className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                <span>Backend Database Required</span>
              </div>
            </div>

            {/* Honest Message: No fake tracking data */}
            <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1.5 text-xs text-amber-900">
              <p className="font-semibold text-amber-950">
                Live Status Query Pending Backend Integration
              </p>
              <p className="leading-relaxed text-amber-800">
                The tracking interface is structured to display official database records from MongoDB via FastAPI. 
                In compliance with project specifications, no simulated progress, fake department routing, or invented resolution timelines are fabricated.
              </p>
            </div>

            {/* Planned Tracking Fields Specification */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Grievance Lifecycle & Tracking Fields
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {LIFECYCLE_STAGES.map((s) => (
                  <div key={s.step} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                        {s.step}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Stage {s.step}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">{s.title}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Empty State when no ID entered yet */
          <div className="text-center py-10 px-4 max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
              <Search className="h-6 w-6 stroke-[1.8]" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              No Complaint ID Entered
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter a grievance reference number (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">GRV-2024-XXXX</code>) in the search field above to track its current department, status, and resolution progress.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
