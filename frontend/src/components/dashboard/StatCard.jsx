import React from 'react';

export default function StatCard({
  title,
  icon: Icon,
  color = "blue",
  value = 0,
  loading = false
}) {
  const colorMap = {
    blue: {
      bg: "bg-[#2563eb]",
      iconColor: "text-white",
      barColor: "bg-blue-200/80",
    },
    amber: {
      bg: "bg-[#f59e0b]",
      iconColor: "text-white",
      barColor: "bg-amber-200/80",
    },
    purple: {
      bg: "bg-[#8b5cf6]",
      iconColor: "text-white",
      barColor: "bg-purple-200/80",
    },
    emerald: {
      bg: "bg-[#10b981]",
      iconColor: "text-white",
      barColor: "bg-emerald-200/80",
    }
  };

  const style = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex items-center justify-between transition-all">
      <div className="flex items-center gap-3.5">
        <div className={`h-11 w-11 rounded-xl ${style.bg} ${style.iconColor} flex items-center justify-center shadow-sm flex-shrink-0`}>
          <Icon className="h-5 w-5 stroke-[2]" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-slate-800 leading-tight">
            {title}
          </h3>
          <div className="text-xl font-bold text-slate-900 mt-1 leading-none tracking-tight">
            {loading ? (
              <span className="inline-block w-8 h-5 bg-slate-100 animate-pulse rounded" />
            ) : (
              typeof value === 'number' ? value.toLocaleString() : (value || '0')
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
