import React from 'react';
import { PieChart, Hourglass, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function ComplaintStatusCard() {
  const statusItems = [
    {
      id: 'pending',
      label: 'Pending',
      icon: Hourglass,
      bgColor: 'bg-[#fffbeb]',
      borderColor: 'border-amber-100/80',
      iconColor: 'text-amber-500',
      textColor: 'text-amber-900',
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      icon: Loader2,
      bgColor: 'bg-[#eff6ff]',
      borderColor: 'border-blue-100/80',
      iconColor: 'text-blue-500',
      textColor: 'text-blue-900',
    },
    {
      id: 'resolved',
      label: 'Resolved',
      icon: CheckCircle2,
      bgColor: 'bg-[#ecfdf5]',
      borderColor: 'border-emerald-100/80',
      iconColor: 'text-emerald-500',
      textColor: 'text-emerald-900',
    },
    {
      id: 'rejected',
      label: 'Rejected',
      icon: XCircle,
      bgColor: 'bg-[#fff1f2]',
      borderColor: 'border-rose-100/80',
      iconColor: 'text-rose-500',
      textColor: 'text-rose-900',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">
          Complaint Status
        </h2>
      </div>

      {/* 2x2 Quadrant Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statusItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border ${item.bgColor} ${item.borderColor} flex items-center gap-3`}
            >
              <div className={`p-1.5 rounded-lg ${item.iconColor} flex-shrink-0`}>
                <Icon className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <span className={`text-[11px] font-semibold ${item.textColor} block leading-tight`}>
                  {item.label}
                </span>
                <span className="text-base font-bold text-slate-900 leading-none mt-1 block">
                  —
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
