import React from 'react';
import { 
  FileText, 
  Brain, 
  FileEdit, 
  Send, 
  Landmark, 
  ChevronRight 
} from 'lucide-react';

export default function ComplaintFlowCard() {
  const steps = [
    {
      id: 'received',
      label: 'Received',
      icon: FileText,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderRing: 'ring-4 ring-blue-50',
    },
    {
      id: 'classification',
      label: 'Classification',
      icon: Brain,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      borderRing: 'ring-4 ring-purple-50',
    },
    {
      id: 'structure',
      label: 'Structure',
      icon: FileEdit,
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-500',
      borderRing: 'ring-4 ring-amber-50',
    },
    {
      id: 'forward',
      label: 'Forward',
      icon: Send,
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-500',
      borderRing: 'ring-4 ring-emerald-50',
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: Landmark,
      bgColor: 'bg-slate-100',
      iconColor: 'text-slate-600',
      borderRing: 'ring-4 ring-slate-50',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)]">
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">
          Complaint Processing Flow
        </h2>
      </div>

      {/* Stepper Flow */}
      <div className="flex items-center justify-between max-w-4xl mx-auto px-4 py-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.id}>
              {/* Step Icon & Label */}
              <div className="flex flex-col items-center">
                <div className={`h-11 w-11 rounded-full ${step.bgColor} ${step.iconColor} ${step.borderRing} flex items-center justify-center transition-transform hover:scale-105 shadow-sm`}>
                  <Icon className="h-5 w-5 stroke-[2]" />
                </div>
                <span className="text-xs font-semibold text-slate-800 mt-2.5">
                  {step.label}
                </span>
              </div>

              {/* Connecting Line with Arrow */}
              {idx < steps.length - 1 && (
                <div className="flex-1 flex items-center justify-center px-2 mb-5">
                  <div className="w-full border-t border-slate-200 relative flex items-center justify-end">
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 absolute -right-1 -top-[7px]" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
