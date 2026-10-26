import React, { useState, useEffect } from 'react';
import { 
  Search, Clock, ShieldCheck, CheckCircle2, 
  MapPin, AlertCircle, FileSearch, Tag, Building2,
  Paperclip, Copy, Check, FileText, ArrowRight, Loader2,
  ExternalLink, UserCheck
} from 'lucide-react';
import TrackComplaintCard from './TrackComplaintCard';
import { trackGrievance } from '../../services/complaintService';
import { useLanguage } from '../../context/LanguageContext';

export default function UserTrackingView({ initialTrackedId = null }) {
  const { t } = useLanguage();
  const [searchedId, setSearchedId] = useState(initialTrackedId || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchComplaintDetails = async (idToQuery) => {
    if (!idToQuery || !idToQuery.trim()) return;
    const cleanId = idToQuery.trim();
    setSearchedId(cleanId);
    setLoading(true);
    setError(null);
    setComplaint(null);

    try {
      const data = await trackGrievance(cleanId);
      setComplaint(data);
    } catch (err) {
      setError(
        err.message || `No complaint matching "${cleanId}" could be retrieved from the database.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackedId && initialTrackedId.trim()) {
      fetchComplaintDetails(initialTrackedId.trim());
    }
  }, [initialTrackedId]);

  const handleTrackSubmit = (id) => {
    fetchComplaintDetails(id);
  };

  const handleCopyId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-5">
      {/* Title & Context */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800">
          {t('track_status_title', 'Track Grievance Status')}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {t('track_status_desc', 'Query the live PGMS database for verified complaint details, department routing, and processing status.')}
        </p>
      </div>

      {/* Input Search Card */}
      <TrackComplaintCard onTrack={handleTrackSubmit} />

      {/* Results Container */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        {loading && (
          <div className="py-14 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-700">
              Querying database for Grievance #{searchedId}...
            </p>
            <p className="text-[11px] text-slate-400">
              Retrieving live MongoDB record
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Grievance Record Not Found
                </h3>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed pl-7">
                {error}
              </p>
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Please ensure the Complaint ID format matches <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">PGMS-YYYYMMDD-XXXXXX</code>.
            </p>
          </div>
        )}

        {!loading && !error && complaint && (
          <div className="space-y-6">
            {/* Lookup Header & Status Badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Official Grievance Reference
                </span>
                <div className="flex items-center gap-2.5">
                  <span className="text-base sm:text-lg font-extrabold text-blue-600 font-mono tracking-wide">
                    {complaint.complaint_id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyId(complaint.complaint_id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Copy Complaint ID"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  Status: {complaint.status || 'Pending'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Forwarding: {complaint.forwarding_status || 'Not Forwarded'}
                </span>
              </div>
            </div>

            {/* Structured Complaint Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[11px] font-medium">Grievance Title</span>
                <span className="font-bold text-slate-800 block text-sm">{complaint.title}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[11px] font-medium">Incident Location</span>
                <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                  <MapPin className="h-4 w-4 text-rose-500 flex-shrink-0" />
                  <span>{complaint.location || 'Location not specified'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[11px] font-medium">Submission Timestamp</span>
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span>{formatDate(complaint.created_at)}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[11px] font-medium">Predicted Category</span>
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Tag className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="italic">{complaint.predicted_category || 'Unclassified'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[11px] font-medium">Assigned Department</span>
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="italic">{complaint.assigned_department || 'Unassigned (Pending Review)'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[11px] font-medium">Citizen Identity</span>
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <UserCheck className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span>{complaint.citizen_id ? `Citizen ID: ${complaint.citizen_id}` : 'Unauthenticated Citizen'}</span>
                </div>
              </div>
            </div>

            {/* Description Section */}
            {complaint.description && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Complaint Description
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {complaint.description}
                </div>
              </div>
            )}

            {/* Attached Files & Evidence */}
            {complaint.file_references && complaint.file_references.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Attached Files & Evidence ({complaint.file_references.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {complaint.file_references.map((f, i) => (
                    <a
                      key={i}
                      href={f.file_path ? `http://localhost:8000${f.file_path}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-200 flex items-center justify-between gap-3 text-xs transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <span className="truncate font-medium text-slate-700 group-hover:text-blue-700">
                          {f.original_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-blue-600 flex-shrink-0 text-[11px]">
                        <span className="uppercase font-mono">{f.file_type}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Official Lifecycle Status Timeline */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Official Processing Lifecycle
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                {/* Stage 1 */}
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                      ✓
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Active</span>
                  </div>
                  <p className="font-bold text-slate-800">1. Logged in System</p>
                  <p className="text-[11px] text-slate-500">Record timestamped & saved in database</p>
                </div>

                {/* Stage 2 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                      2
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Pending</span>
                  </div>
                  <p className="font-bold text-slate-700">2. NLP Categorization</p>
                  <p className="text-[11px] text-slate-400">Automated category assignment</p>
                </div>

                {/* Stage 3 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                      3
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Not Forwarded</span>
                  </div>
                  <p className="font-bold text-slate-700">3. Admin Review & Routing</p>
                  <p className="text-[11px] text-slate-400">Forwarding to competent authority</p>
                </div>

                {/* Stage 4 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                      4
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Pending</span>
                  </div>
                  <p className="font-bold text-slate-700">4. Final Resolution</p>
                  <p className="text-[11px] text-slate-400">Field work and case closure</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !searchedId && (
          <div className="text-center py-10 px-4 max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
              <Search className="h-6 w-6 stroke-[1.8]" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              No Complaint ID Entered
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your official Complaint ID (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">PGMS-20261021-XXXXXX</code>) above to view real-time status and departmental assignment from the database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
