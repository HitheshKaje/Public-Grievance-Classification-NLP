import React from 'react';
import { Clock, ChevronRight, FileEdit } from 'lucide-react';

export default function RecentActivityCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            Recent Activity
          </h2>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 cursor-pointer" />
      </div>

      {/* Empty State Body */}
      <div className="py-7 flex flex-col items-center justify-center text-center">
        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          <FileEdit className="h-4.5 w-4.5 stroke-[1.5]" />
        </div>
        <span className="text-xs font-medium text-slate-500">
          No recent activity
        </span>
      </div>
    </div>
  );
}
