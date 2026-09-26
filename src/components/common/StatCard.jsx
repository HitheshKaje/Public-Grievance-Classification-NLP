// src/components/common/StatCard.jsx
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function StatCard({
  icon: Icon,
  number,
  label,
  trend,
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  iconBg = 'bg-blue-50 text-blue-600',
  description
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {typeof number === 'number' ? number.toLocaleString() : number}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${iconBg} ring-1 ring-black/5`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 font-medium">
          {trendType === 'positive' && (
            <span className="flex items-center text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              {trend}
            </span>
          )}
          {trendType === 'negative' && (
            <span className="flex items-center text-rose-600">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {trend}
            </span>
          )}
          {trendType === 'neutral' && (
            <span className="flex items-center text-slate-600">
              <Minus className="w-3 h-3 mr-1 text-slate-400" />
              {trend}
            </span>
          )}
        </div>
        {description && (
          <span className="text-slate-400 text-[11px] truncate max-w-[130px]">
            {description}
          </span>
        )}
      </div>
    </div>
  );
}
