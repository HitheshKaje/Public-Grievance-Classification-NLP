import React from 'react';
import { 
  FileText, 
  Brain, 
  FileEdit, 
  Send, 
  Landmark, 
  ChevronRight 
} from 'lucide-react';

export default function ComplaintFlowCard({
  counts = {
    received: 0,
    classification: 0,
    structure: 0,
    forward: 0,
    completed: 0
  }
}) {
  const steps = [
    {
      id: 'received',
      label: 'Received',
      count: counts.received ?? 0,
      icon: FileText,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderRing: 'ring-4 ring-blue-50',
    },
    {
      id: 'classification',
      label: 'Classification',
      count: counts.classification ?? 0,
      icon: Brain,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      borderRing: 'ring-4 ring-purple-50',
    },
    {
      id: 'structure',
      label: 'Structure & Review',
      count: counts.structure ?? 0,
      icon: FileEdit,
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-500',
      borderRing: 'ring-4 ring-amber-50',
    },
    {
      id: 'forward',
      label: 'Dispatched / Forwarded',
      count: counts.forward ?? 0,
      icon: Send,
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-500',
      borderRing: 'ring-4 ring-emerald-50',
    },
    {
      id: 'completed',
      label: 'Resolved & Closed',
      count: counts.completed ?? 0,
      icon: Landmark,
      bgColor: 'bg-slate-100',
      iconColor: 'text-slate-600',
      borderRing: 'ring-4 ring-slate-50',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)]">
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            Complaint Processing Flow
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          Live Redressal Lifecycle
        </span>
      </div>

      {/* Stepper Flow */}
      <div className="flex items-center justify-between max-w-4xl mx-auto px-4 py-2 overflow-x-auto">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.id}>
              {/* Step Icon & Label */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`relative h-11 w-11 rounded-full ${step.bgColor} ${step.iconColor} ${step.borderRing} flex items-center justify-center transition-transform hover:scale-105 shadow-sm`}>
                  <Icon className="h-5 w-5 stroke-[2]" />
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-900 text-white font-mono shadow-xs">
                    {step.count}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-800 mt-2.5">
                  {step.label}
                </span>
                <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                  {step.count} active
                </span>
              </div>

              {/* Connecting Chevron Arrow */}
              {idx < steps.length - 1 && (
                <div className="flex items-center justify-center flex-1 px-2 text-slate-300">
                  <div className="h-[2px] bg-slate-100 flex-1 hidden sm:block" />
                  <ChevronRight className="h-4 w-4 stroke-[2.5] text-slate-300 flex-shrink-0" />
                  <div className="h-[2px] bg-slate-100 flex-1 hidden sm:block" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
