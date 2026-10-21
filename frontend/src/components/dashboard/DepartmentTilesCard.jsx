import React from 'react';
import { 
  Building2, 
  ChevronRight, 
  Droplets, 
  Zap, 
  Milestone, 
  Lightbulb, 
  Plus, 
  GraduationCap, 
  Trash2,
  Landmark
} from 'lucide-react';

export default function DepartmentTilesCard({
  departmentCounts = [],
  onSelectDepartment
}) {
  const departmentMeta = [
    {
      id: 'water',
      name: 'Water Supply Department',
      shortName: 'Water Supply',
      icon: Droplets,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 'electricity',
      name: 'Power & Electricity Board',
      shortName: 'Electricity',
      icon: Zap,
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-500',
    },
    {
      id: 'roads',
      name: 'Public Works Department',
      shortName: 'Roads & Infra',
      icon: Milestone,
      bgColor: 'bg-rose-100',
      iconColor: 'text-rose-500',
    },
    {
      id: 'lighting',
      name: 'Municipal Lighting Division',
      shortName: 'Street Lighting',
      icon: Lightbulb,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      id: 'health',
      name: 'Health & Sanitation Department',
      shortName: 'Public Healthcare',
      icon: Plus,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-500',
    },
    {
      id: 'education',
      name: 'Department of Public Instruction',
      shortName: 'Public Education',
      icon: GraduationCap,
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      id: 'sanitation',
      name: 'Solid Waste Management',
      shortName: 'Sanitation & Garbage',
      icon: Trash2,
      bgColor: 'bg-teal-100',
      iconColor: 'text-teal-600',
    },
    {
      id: 'admin',
      name: 'General Civic Administration',
      shortName: 'Civic Administration',
      icon: Landmark,
      bgColor: 'bg-slate-100',
      iconColor: 'text-slate-600',
    }
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
        <span className="text-[11px] text-slate-400 font-medium">
          Live MongoDB Roster
        </span>
      </div>

      {/* Grid of Department Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {departmentMeta.map((dept) => {
          const Icon = dept.icon;
          const match = departmentCounts.find(
            (d) => d.name === dept.name || d.id === dept.id
          );
          const count = match ? match.count : 0;

          return (
            <div
              key={dept.id}
              onClick={() => onSelectDepartment && onSelectDepartment(dept.name)}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/80 transition-colors cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.02)] group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`h-8 w-8 rounded-lg ${dept.bgColor} ${dept.iconColor} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="h-4 w-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-800 block truncate leading-tight">
                    {dept.shortName}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {count} {count === 1 ? 'case' : 'cases'}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
