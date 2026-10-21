import React from 'react';
import { BarChart2 } from 'lucide-react';

export default function OfficerWorkloadCard({
  stats = {
    pending: 0,
    in_progress: 0,
    resolved: 0,
    overdue: 0,
    total_assigned: 0
  }
}) {
  const pending = stats.pending || 0;
  const inProgress = stats.in_progress || 0;
  const resolved = stats.resolved || 0;
  const overdue = stats.overdue || 0;
  const total = pending + inProgress + resolved;

  // Donut circumference for r=40 is ~251.32
  const CIRCUMFERENCE = 251.32;

  // Calculate segment lengths
  const pPending = total > 0 ? (pending / total) * CIRCUMFERENCE : 0;
  const pProgress = total > 0 ? (inProgress / total) * CIRCUMFERENCE : 0;
  const pResolved = total > 0 ? (resolved / total) * CIRCUMFERENCE : 0;

  // Offsets
  const offsetPending = 0;
  const offsetProgress = -pPending;
  const offsetResolved = -(pPending + pProgress);

  const workloadStats = [
    { label: 'Assigned / Pending', value: pending, color: 'bg-blue-600', textColor: 'text-slate-700' },
    { label: 'In Progress', value: inProgress, color: 'bg-amber-500', textColor: 'text-slate-700' },
    { label: 'Resolved', value: resolved, color: 'bg-emerald-500', textColor: 'text-slate-700' },
    { label: 'Overdue (SLA > 3d)', value: overdue, color: 'bg-rose-500', textColor: 'text-slate-700' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">
          My Workload
        </h2>
      </div>

      {/* Donut Gauge & Legend */}
      <div className="flex items-center justify-around py-3">
        {/* Circular Donut Ring */}
        <div className="flex flex-col items-center">
          <div className="relative h-28 w-28 flex items-center justify-center">
            {/* Background circular track */}
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
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
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#2563eb"
                    strokeWidth="11"
                    strokeDasharray={`${pPending} ${CIRCUMFERENCE}`}
                    strokeDashoffset={offsetPending}
                    fill="none"
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  {/* In Progress segment (Amber) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#f59e0b"
                    strokeWidth="11"
                    strokeDasharray={`${pProgress} ${CIRCUMFERENCE}`}
                    strokeDashoffset={offsetProgress}
                    fill="none"
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  {/* Resolved segment (Emerald) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#10b981"
                    strokeWidth="11"
                    strokeDasharray={`${pResolved} ${CIRCUMFERENCE}`}
                    strokeDashoffset={offsetResolved}
                    fill="none"
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </>
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-slate-800 leading-none font-mono">
                {total}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 mt-2">
            Total
          </span>
        </div>

        {/* Legend List */}
        <div className="space-y-2.5">
          {workloadStats.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-6 text-xs">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                <span className="text-slate-700 font-medium">{item.label}</span>
              </div>
              <span className="font-bold text-slate-800 font-mono">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
