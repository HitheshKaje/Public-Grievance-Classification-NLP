import React from 'react';
import { FileText, ArrowRight, Loader2, Clock } from 'lucide-react';

export default function MyComplaintsStatCard({
  totalCount = 0,
  inProcessingCount = 0,
  pendingCount = 0,
  loading = false,
  onViewAll
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex flex-col justify-between">
      <div>
        <div className="flex items-start gap-4">
          {/* Emerald Icon Badge */}
          <div className="h-12 w-12 rounded-xl bg-[#10b981] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-500/20">
            <FileText className="h-6 w-6 stroke-[2]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 block">
                My Complaints
              </span>
              {loading && (
                <Loader2 className="h-3.5 w-3.5 text-slate-400 animate-spin" />
              )}
            </div>

            {/* Total Count */}
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 leading-none tracking-tight">
                {loading ? '—' : totalCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {totalCount === 1 ? 'grievance filed' : 'grievances filed'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Processing & Status Indicator Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100/90 flex flex-wrap items-center gap-2">
          {/* In Processing Count Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              inProcessingCount > 0
                ? 'bg-blue-50 text-blue-700 border border-blue-200/70 shadow-xs'
                : 'bg-slate-50 text-slate-500 border border-slate-200/50'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {inProcessingCount > 0 && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  inProcessingCount > 0 ? 'bg-blue-600' : 'bg-slate-400'
                }`}
              ></span>
            </span>
            <span>
              {loading ? '...' : inProcessingCount} In Processing
            </span>
          </div>

          {/* Pending Count Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50/80 text-amber-800 border border-amber-200/60">
            <Clock className="h-3 w-3 text-amber-600" />
            <span>
              {loading ? '...' : pendingCount} Pending
            </span>
          </div>
        </div>
      </div>

      {/* View All Link */}
      <div className="flex justify-end pt-3">
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All Grievances</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
