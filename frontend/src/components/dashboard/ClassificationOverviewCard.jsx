import React from 'react';
import { PieChart, ChevronRight, BarChart2, Tag, ShieldCheck } from 'lucide-react';

export default function ClassificationOverviewCard({
  stats = {
    total_complaints: 0,
    awaiting_review: 0,
    forwarded: 0,
    resolved: 0
  }
}) {
  const total = stats.total_complaints || 0;
  const forwarded = stats.forwarded || 0;
  const awaiting = stats.awaiting_review || 0;
  const resolved = stats.resolved || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PieChart className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            Classification & Dispatch
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {total} Total
        </span>
      </div>

      {/* Metrics Bars */}
      <div className="space-y-3 py-1">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600">Dispatched to Officers</span>
            <span className="text-blue-600 font-mono">{forwarded} / {total}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-500" 
              style={{ width: `${total > 0 ? (forwarded / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600">Awaiting Structuring & Routing</span>
            <span className="text-amber-600 font-mono">{awaiting} / {total}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-500" 
              style={{ width: `${total > 0 ? (awaiting / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600">Resolved Cases</span>
            <span className="text-emerald-600 font-mono">{resolved} / {total}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: `${total > 0 ? (resolved / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
