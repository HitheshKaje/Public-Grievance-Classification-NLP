import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';

export default function MyComplaintsStatCard({ onViewAll }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex flex-col justify-between">
      <div className="flex items-start gap-4">
        {/* Emerald Icon Badge */}
        <div className="h-12 w-12 rounded-xl bg-[#10b981] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-500/20">
          <FileText className="h-6 w-6 stroke-[2]" />
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-800 block">
            My Complaints
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 leading-none tracking-wider">
            —
          </div>
        </div>
      </div>

      {/* View All Link */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
