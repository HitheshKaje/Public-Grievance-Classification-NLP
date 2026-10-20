import React from 'react';
import { Activity, ShieldAlert } from 'lucide-react';
import EmptyState from '../common/EmptyState';

export default function DepartmentPerformanceSection() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-800">Department Performance & SLA Adherence</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Officer resolution velocity, SLA breaches, and citizen feedback scores
          </p>
        </div>
        <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          SLA Tracker
        </span>
      </div>

      <div className="py-8">
        <EmptyState
          title="No department performance data available yet"
          description="SLA resolution statistics and performance benchmarks will calculate automatically once complaints are dispatched."
          icon={Activity}
        />
      </div>

      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Standard Resolution SLA: 72 Hours</span>
        <span>Awaiting Officer Assignments</span>
      </div>
    </div>
  );
}
