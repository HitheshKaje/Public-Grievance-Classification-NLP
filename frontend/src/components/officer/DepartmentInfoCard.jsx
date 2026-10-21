import React from 'react';
import { Droplets, ChevronRight } from 'lucide-react';

export default function DepartmentInfoCard({ departmentName = "Water Supply Department" }) {
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
        <ChevronRight className="h-4 w-4 text-slate-400 cursor-pointer" />
      </div>

      {/* Department Tile */}
      <div className="p-3.5 rounded-xl border border-blue-100/80 bg-blue-50/50 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
          <Droplets className="h-5 w-5 fill-current" />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-900 block leading-tight">
            {departmentName}
          </span>
        </div>
      </div>
    </div>
  );
}
