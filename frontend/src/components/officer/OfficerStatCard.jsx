import React from 'react';

export default function OfficerStatCard({
  title,
  icon: Icon,
  color = "blue"
}) {
  const colorMap = {
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
    },
    amber: {
      bg: "bg-amber-100",
      text: "text-amber-500",
    },
    emerald: {
      bg: "bg-emerald-100",
      text: "text-emerald-500",
    },
    rose: {
      bg: "bg-rose-100",
      text: "text-rose-500",
    }
  };

  const style = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex items-center gap-3.5">
      <div className={`h-11 w-11 rounded-xl ${style.bg} ${style.text} flex items-center justify-center flex-shrink-0`}>
        <Icon className="h-5 w-5 stroke-[2.2]" />
      </div>
      <div>
        <h3 className="text-xs font-semibold text-slate-800 leading-tight">
          {title}
        </h3>
        <div className="text-xl font-bold text-slate-900 mt-1 leading-none tracking-wider">
          —
        </div>
      </div>
    </div>
  );
}
