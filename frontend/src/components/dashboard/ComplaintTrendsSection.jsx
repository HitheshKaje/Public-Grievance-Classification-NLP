import React from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import EmptyState from '../common/EmptyState';

export default function ComplaintTrendsSection() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-800">Complaint Inflow & Resolution Trends</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Temporal intake velocity, resolution timelines, and day-over-day tracking
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          <Calendar className="h-3 w-3 text-slate-400" />
          <span>Daily Inflow</span>
        </div>
      </div>

      <div className="py-8">
        <EmptyState
          title="No trend data recorded yet"
          description="Intake trajectory and resolution timeline trends will automatically activate upon grievance registration."
          icon={TrendingUp}
        />
      </div>

      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Timeline: Real-time Inflow</span>
        <span>Awaiting Live Events</span>
      </div>
    </div>
  );
}
