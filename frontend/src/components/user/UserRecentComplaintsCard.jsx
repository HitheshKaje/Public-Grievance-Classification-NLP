import React, { useState } from 'react';
import { FileText, ArrowRight, Search, Copy, Check, Plus, Loader2 } from 'lucide-react';

export default function UserRecentComplaintsCard({
  complaints = [],
  loading = false,
  onViewAll,
  onTrack,
  onSubmitNew
}) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyId = async (id, e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const renderStatusBadge = (status) => {
    const s = (status || 'Pending').toLowerCase();
    if (s.includes('progress') || s.includes('process')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span>In Processing</span>
        </span>
      );
    }
    if (s.includes('resolve')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Resolved</span>
        </span>
      );
    }
    if (s.includes('reject')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>Rejected</span>
        </span>
      );
    }
    // Default Pending
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        <span>Pending Review</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            My Recent Complaints
          </h2>
          {complaints.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
              {complaints.length}
            </span>
          )}
        </div>

        {onViewAll && complaints.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Table Structure */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#f4f7fb] text-slate-700 font-semibold border-b border-slate-100">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">Complaint</th>
              <th className="py-2.5 px-4 font-semibold">Department</th>
              <th className="py-2.5 px-4 font-semibold">Date</th>
              <th className="py-2.5 px-4 font-semibold">Status</th>
              <th className="py-2.5 px-4 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                    <span className="text-xs font-medium">Loading complaints...</span>
                  </div>
                </td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <FileText className="h-5 w-5 stroke-[1.5]" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      No complaints yet
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs mx-auto">
                      Whenever you submit a grievance, it will appear here with live tracking.
                    </p>
                    {onSubmitNew && (
                      <button
                        type="button"
                        onClick={onSubmitNew}
                        className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Submit a Grievance</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              complaints.map((c) => {
                const id = c.complaint_id || c.id;
                const dept = c.assigned_department || c.department;
                const isCopied = copiedId === id;

                return (
                  <tr
                    key={id}
                    className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors"
                  >
                    {/* ID */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900">{id}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(id, e)}
                          title="Copy ID"
                          className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Complaint Title & Details */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate" title={c.title || c.text}>
                        {c.title || c.text || 'Grievance Petition'}
                      </div>
                      {c.location && (
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          📍 {c.location}
                        </div>
                      )}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {dept ? (
                        <span className="font-medium text-slate-700">{dept}</span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Triage Pending
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(c.created_at)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderStatusBadge(c.status)}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {onTrack && (
                        <button
                          type="button"
                          onClick={() => onTrack(id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200/50 transition-colors cursor-pointer"
                        >
                          <Search className="h-3 w-3" />
                          <span>Track</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
