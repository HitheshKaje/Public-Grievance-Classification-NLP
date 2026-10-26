import React from 'react';
import { PieChart, Hourglass, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ComplaintStatusCard({ stats = {}, loading = false }) {
  const { t } = useLanguage();
  const pendingCount = stats.pending ?? 0;
  const inProgressCount = stats.in_progress ?? stats.in_processing ?? 0;
  const resolvedCount = stats.resolved ?? 0;
  const rejectedCount = stats.rejected ?? 0;

  const statusItems = [
    {
      id: 'pending',
      label: t('status_pending', 'Pending'),
      count: pendingCount,
      icon: Hourglass,
      bgColor: 'bg-[#fffbeb]',
      borderColor: 'border-amber-100/80',
      iconColor: 'text-amber-500',
      textColor: 'text-amber-900',
    },
    {
      id: 'in_progress',
      label: t('status_in_progress', 'In Progress'),
      sublabel: '(Processing)',
      count: inProgressCount,
      icon: Loader2,
      bgColor: 'bg-[#eff6ff]',
      borderColor: 'border-blue-100/80',
      iconColor: 'text-blue-500',
      textColor: 'text-blue-900',
      spinOnActive: true,
    },
    {
      id: 'resolved',
      label: t('status_resolved', 'Resolved'),
      count: resolvedCount,
      icon: CheckCircle2,
      bgColor: 'bg-[#ecfdf5]',
      borderColor: 'border-emerald-100/80',
      iconColor: 'text-emerald-500',
      textColor: 'text-emerald-900',
    },
    {
      id: 'rejected',
      label: t('status_rejected', 'Rejected'),
      count: rejectedCount,
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PieChart className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            {t('complaint_status', 'Complaint Status')}
          </h2>
        </div>

        {inProgressCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            {inProgressCount} active
          </span>
        )}
      </div>

      {/* 2x2 Quadrant Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statusItems.map((item) => {
          const Icon = item.icon;
          const isSpinning = item.spinOnActive && item.count > 0;
          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border ${item.bgColor} ${item.borderColor} flex items-center gap-3 transition-shadow hover:shadow-xs`}
            >
              <div className={`p-1.5 rounded-lg ${item.iconColor} flex-shrink-0`}>
                <Icon className={`h-5 w-5 stroke-[2.2] ${isSpinning ? 'animate-spin' : ''}`} />
              </div>
              <div className="min-w-0">
                <span className={`text-[11px] font-semibold ${item.textColor} block leading-tight truncate`}>
                  {item.label}
                </span>
                <span className="text-lg font-bold text-slate-900 leading-none mt-1 block">
                  {loading ? '—' : item.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
