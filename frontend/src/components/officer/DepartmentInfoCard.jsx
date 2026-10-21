import React from 'react';
import { Droplets, ChevronRight, Building2, CheckCircle2 } from 'lucide-react';

export default function DepartmentInfoCard({
  departmentName = "Water Supply Department",
  departmentCount = 0,
  resolvedCount = 0
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Droplets className="h-4.5 w-4.5 text-blue-600 fill-current" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            Department Information
          </h2>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active</span>
        </div>
      </div>

      {/* Department Tile */}
      <div className="p-3.5 rounded-xl border border-blue-100/80 bg-blue-50/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Droplets className="h-5 w-5 fill-current" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 block leading-tight truncate">
              {departmentName}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Nodal Operational Authority
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="text-base font-extrabold text-blue-600 font-mono block leading-none">
            {departmentCount}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Assigned
          </span>
        </div>
      </div>
    </div>
  );
}
