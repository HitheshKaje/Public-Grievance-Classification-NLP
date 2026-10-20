import React from 'react';
import { Database, Inbox } from 'lucide-react';

export default function EmptyState({
  title = "No complaint data available yet",
  description = "Awaiting live data integration from FastAPI backend and MongoDB database.",
  icon: Icon = Inbox,
  compact = false
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center rounded-lg border border-dashed border-slate-200 bg-slate-50/60 ${compact ? 'py-8 px-4' : 'py-14 px-6'}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3 border border-slate-200">
        <Icon className="h-6 w-6 stroke-[1.5]" />
      </div>
      <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
      <p className="mt-1 text-xs text-slate-500 max-w-sm leading-relaxed">{description}</p>
    </div>
  );
}
