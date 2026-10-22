import React from 'react';
import { BarChart2, TrendingUp, AlertCircle } from 'lucide-react';

export default function OfficerWorkloadCard({
  stats = {
    pending: 0,
    in_progress: 0,
    resolved: 0,
    overdue: 0,
    total_assigned: 0
  },
  complaints = []
}) {
  // Extract values from stats
  let pending = Number(stats?.pending) || 0;
  let inProgress = Number(stats?.in_progress) || 0;
  let resolved = Number(stats?.resolved) || 0;
  let overdue = Number(stats?.overdue) || 0;

  // Fallback: If stats are zero but complaints list contains active records,
  // dynamically compute the breakdown from the live complaints array
  if (pending === 0 && inProgress === 0 && resolved === 0 && Array.isArray(complaints) && complaints.length > 0) {
    complaints.forEach((c) => {
      const s = (c.status || '').toLowerCase();
      if (s.includes('progress') || s.includes('process')) {
        inProgress += 1;
      } else if (s.includes('resolve') || s.includes('closed')) {
        resolved += 1;
      } else {
        pending += 1;
      }

      // Check if complaint is older than 3 days for overdue tally
      if (c.created_at && !s.includes('resolve')) {
        const createdDate = new Date(c.created_at);
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        if (createdDate < threeDaysAgo) {
          overdue += 1;
        }
      }
    });
  } else if (pending === 0 && inProgress === 0 && resolved === 0 && (stats?.total_assigned || 0) > 0) {
    // If total_assigned is reported but sub-status was unassigned, default to pending triage
    pending = Number(stats.total_assigned);
  }

  const total = pending + inProgress + resolved;

  // Donut geometry for radius = 40
  const CIRCUMFERENCE = 2 * Math.PI * 40; // ~251.327

  // Segment stroke lengths
  const pPending = total > 0 ? (pending / total) * CIRCUMFERENCE : 0;
  const pProgress = total > 0 ? (inProgress / total) * CIRCUMFERENCE : 0;
  const pResolved = total > 0 ? (resolved / total) * CIRCUMFERENCE : 0;

  // Offsets (starting from top at -90deg rotation)
  const offsetPending = 0;
  const offsetProgress = -pPending;
  const offsetResolved = -(pPending + pProgress);

  const calcPercentage = (val) => {
    if (!total || total === 0) return '0%';
    return `${Math.round((val / total) * 100)}%`;
  };

  const workloadStats = [
    { 
      label: 'Assigned / Pending', 
      value: pending, 
      pct: calcPercentage(pending),
      color: 'bg-blue-600', 
      borderColor: 'border-blue-500',
      active: pending > 0 
    },
    { 
      label: 'In Progress', 
      value: inProgress, 
      pct: calcPercentage(inProgress),
      color: 'bg-amber-500', 
      borderColor: 'border-amber-400',
      active: inProgress > 0 
    },
    { 
      label: 'Resolved', 
      value: resolved, 
      pct: calcPercentage(resolved),
      color: 'bg-emerald-500', 
      borderColor: 'border-emerald-400',
      active: resolved > 0 
    },
    { 
      label: 'Overdue (SLA > 3d)', 
      value: overdue, 
      pct: overdue > 0 ? `${overdue} cases` : null,
      color: 'bg-rose-500', 
      borderColor: 'border-rose-400',
      active: overdue > 0 
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            My Workload
          </h2>
        </div>

        {total > 0 && (
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
            {total} {total === 1 ? 'case' : 'cases'}
          </span>
        )}
      </div>

      {/* Donut Gauge & Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2 my-auto">
        {/* Circular Donut Ring */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative h-32 w-32 flex items-center justify-center">
            {/* Background circular track & colored segments */}
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              {/* Neutral background track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#e2e8f0"
                strokeWidth="11"
                fill="none"
              />

              {total > 0 && (
                <>
                  {/* Pending segment (Blue) */}
                  {pending > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#2563eb"
                      strokeWidth="11"
                      strokeDasharray={`${pPending} ${CIRCUMFERENCE}`}
                      strokeDashoffset={offsetPending}
                      fill="none"
                      strokeLinecap={pending === total ? 'butt' : 'round'}
                      className="transition-all duration-700 ease-out"
                    />
                  )}

                  {/* In Progress segment (Amber) */}
                  {inProgress > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#f59e0b"
                      strokeWidth="11"
                      strokeDasharray={`${pProgress} ${CIRCUMFERENCE}`}
                      strokeDashoffset={offsetProgress}
                      fill="none"
                      strokeLinecap={inProgress === total ? 'butt' : 'round'}
                      className="transition-all duration-700 ease-out"
                    />
                  )}

                  {/* Resolved segment (Emerald) */}
                  {resolved > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#10b981"
                      strokeWidth="11"
                      strokeDasharray={`${pResolved} ${CIRCUMFERENCE}`}
                      strokeDashoffset={offsetResolved}
                      fill="none"
                      strokeLinecap={resolved === total ? 'butt' : 'round'}
                      className="transition-all duration-700 ease-out"
                    />
                  )}
                </>
              )}
            </svg>

            {/* Donut Ring Center: Dynamic Live Counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-800 leading-none font-mono tracking-tight">
                {total}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">
                Total
              </span>
            </div>
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-2.5 w-full sm:w-auto min-w-[170px]">
          {workloadStats.map((item) => (
            <div 
              key={item.label} 
              className="flex items-center justify-between gap-3 text-xs p-1.5 px-2 rounded-xl transition-colors hover:bg-slate-50/80"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${item.color} flex-shrink-0 ${item.active ? 'ring-2 ring-slate-100' : ''}`} />
                <span className="text-slate-700 font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {total > 0 && item.pct && item.value > 0 && (
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {item.pct}
                  </span>
                )}
                <span className="font-bold text-slate-900 font-mono text-xs w-4 text-right">
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
