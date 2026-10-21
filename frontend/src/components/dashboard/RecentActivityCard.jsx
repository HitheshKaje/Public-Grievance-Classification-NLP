import React from 'react';
import { Clock, ChevronRight, FileEdit, CheckCircle2, Send, FileText } from 'lucide-react';

export default function RecentActivityCard({
  activities = [],
  onViewAll
}) {
  const formatTime = (dateStr) => {
    if (!dateStr) return 'Recent';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            Recent Activity
          </h2>
        </div>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
          >
            View All
          </button>
        )}
      </div>

      {/* Activity List */}
      <div className="space-y-2.5">
        {activities.length === 0 ? (
          <div className="py-7 flex flex-col items-center justify-center text-center">
            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
              <FileEdit className="h-4.5 w-4.5 stroke-[1.5]" />
            </div>
            <span className="text-xs font-medium text-slate-500">
              No recent activity in MongoDB
            </span>
          </div>
        ) : (
          activities.slice(0, 4).map((act, i) => (
            <div key={act.id || i} className="p-2 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start justify-between gap-2 text-xs">
              <div className="min-w-0">
                <span className="font-mono text-[10px] text-blue-600 font-bold block">
                  {act.complaint_id}
                </span>
                <p className="font-semibold text-slate-800 truncate leading-tight">
                  {act.title}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {act.action} &bull; {act.department}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                {formatTime(act.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
