import React from 'react';
import { Zap, FileText, RefreshCw, CheckCircle2, FileEdit, ArrowRight } from 'lucide-react';

export default function OfficerQuickActionsCard({ onActionClick }) {
  const actions = [
    {
      id: 'view_assigned',
      label: 'View Assigned Complaints',
      icon: FileText,
      bgColor: 'bg-[#eff6ff]',
      borderColor: 'border-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 'update_status',
      label: 'Update Complaint Status',
      icon: RefreshCw,
      bgColor: 'bg-[#fffbeb]',
      borderColor: 'border-amber-100',
      iconColor: 'text-amber-500',
    },
    {
      id: 'mark_resolved',
      label: 'Mark as Resolved',
      icon: CheckCircle2,
      bgColor: 'bg-[#ecfdf5]',
      borderColor: 'border-emerald-100',
      iconColor: 'text-emerald-500',
    },
    {
      id: 'add_remarks',
      label: 'Add Remarks',
      icon: FileEdit,
      bgColor: 'bg-[#faf5ff]',
      borderColor: 'border-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4.5 w-4.5 text-amber-500 stroke-[2.2]" />
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">
          Quick Actions
        </h2>
      </div>

      {/* 2x2 Grid of Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => onActionClick && onActionClick(act.id)}
              className={`p-3 rounded-xl border ${act.bgColor} ${act.borderColor} hover:shadow-sm transition-all flex items-center justify-between text-left cursor-pointer group`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg bg-white ${act.iconColor} shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="h-4 w-4 stroke-[2]" />
                </div>
                <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                  {act.label}
                </span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
