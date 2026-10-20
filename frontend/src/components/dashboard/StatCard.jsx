import React from 'react';
import { Clock } from 'lucide-react';

export default function StatCard({
  title,
  icon: Icon,
  badgeText = "Awaiting Live Data",
  accentColor = "blue",
  description = "No records logged yet"
}) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-100",
      badge: "bg-blue-50 text-blue-700 border-blue-200"
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-100",
      badge: "bg-amber-50 text-amber-700 border-amber-200"
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-100",
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200"
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-100",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200"
    }
  };

  const style = colorMap[accentColor] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-400 font-mono">--</span>
            <span className="text-xs text-slate-400 font-normal">records</span>
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${style.bg} ${style.text} border ${style.border}`}>
          <Icon className="h-5 w-5 stroke-[1.75]" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {description}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${style.badge}`}>
          {badgeText}
        </span>
      </div>
    </div>
  );
}
