import React from 'react';
import { 
  Building2, 
  ChevronRight, 
  Droplets, 
  Zap, 
  Milestone, 
  Lightbulb, 
  Cross, 
  Plus,
  GraduationCap, 
  Trash2 
} from 'lucide-react';

export default function DepartmentTilesCard() {
  const departments = [
    {
      id: 'water',
      name: 'Water Supply',
      icon: Droplets,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 'electricity',
      name: 'Electricity',
      icon: Zap,
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-500',
    },
    {
      id: 'roads',
      name: 'Roads & Infra',
      icon: Milestone,
      bgColor: 'bg-rose-100',
      iconColor: 'text-rose-500',
    },
    {
      id: 'lighting',
      name: 'Street Lighting',
      icon: Lightbulb,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      id: 'health',
      name: 'Public Healthcare',
      icon: Plus,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-500',
    },
    {
      id: 'education',
      name: 'Public Education',
      icon: GraduationCap,
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      id: 'sanitation',
      name: 'Sanitation & Garbage',
      icon: Trash2,
      bgColor: 'bg-teal-100',
      iconColor: 'text-teal-600',
      colSpan: true
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            Departments
          </h2>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 cursor-pointer" />
      </div>

      {/* Grid of Department Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {departments.map((dept) => {
          const Icon = dept.icon;
          return (
            <div
              key={dept.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/80 transition-colors cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${
                dept.colSpan ? 'sm:col-span-1' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`h-8 w-8 rounded-lg ${dept.bgColor} ${dept.iconColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="h-4 w-4 stroke-[2.2]" />
                </div>
                <span className="text-xs font-semibold text-slate-800">
                  {dept.name}
                </span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
