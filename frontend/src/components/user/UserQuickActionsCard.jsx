import React from 'react';
import { Zap, FileText, Search, ClipboardList, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function UserQuickActionsCard({ onActionClick }) {
  const { t } = useLanguage();

  const actions = [
    {
      id: 'submit',
      label: t('submit', 'Submit Complaint'),
      icon: FileText,
      bgColor: 'bg-[#eff6ff]',
      borderColor: 'border-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 'track',
      label: t('track', 'Track Complaint'),
      icon: Search,
      bgColor: 'bg-[#faf5ff]',
      borderColor: 'border-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      id: 'my_complaints',
      label: t('my_complaints', 'My Complaints'),
      icon: ClipboardList,
      bgColor: 'bg-[#ecfdf5]',
      borderColor: 'border-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      id: 'support',
      label: t('support', 'Help & Support'),
      icon: HelpCircle,
      bgColor: 'bg-[#fffbeb]',
      borderColor: 'border-amber-100',
      iconColor: 'text-amber-500',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4.5 w-4.5 text-amber-500 stroke-[2.2]" />
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">
          {t('quick_actions', 'Quick Actions')}
        </h2>
      </div>

      {/* 2x2 Grid of Actions */}
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => onActionClick && onActionClick(act.id)}
              className={`p-3 rounded-xl border ${act.bgColor} ${act.borderColor} hover:shadow-sm transition-all flex items-center gap-3 text-left cursor-pointer group`}
            >
              <div className={`p-1.5 rounded-lg bg-white ${act.iconColor} shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className="h-4.5 w-4.5 stroke-[2]" />
              </div>
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
