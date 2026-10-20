import React from 'react';
import { 
  Droplets, 
  Zap, 
  Milestone, 
  Lightbulb, 
  Stethoscope, 
  GraduationCap, 
  Trash2,
  CheckCircle2,
  Layers
} from 'lucide-react';

export const DEPARTMENTS_CONFIG = [
  {
    id: "WS",
    name: "Water Supply",
    icon: Droplets,
    category: "Utilities & Public Works",
    scope: "Pipelines, water quality, municipal supply distribution",
    color: "blue"
  },
  {
    id: "EL",
    name: "Electricity",
    icon: Zap,
    category: "Energy & Infrastructure",
    scope: "Power supply, transformers, billing, voltage stability",
    color: "amber"
  },
  {
    id: "RI",
    name: "Roads and Infrastructure",
    icon: Milestone,
    category: "Civil & Urban Works",
    scope: "Potholes, road surfacing, footpaths, civil obstruction",
    color: "slate"
  },
  {
    id: "SL",
    name: "Street Lighting",
    icon: Lightbulb,
    category: "Public Safety & Illumination",
    scope: "Poles, LED fixtures, dark road sectors, timers",
    color: "yellow"
  },
  {
    id: "PH",
    name: "Public Healthcare",
    icon: Stethoscope,
    category: "Health & Family Welfare",
    scope: "Clinics, essential medicines, hospital sanitation, staff",
    color: "rose"
  },
  {
    id: "PE",
    name: "Public Education",
    icon: GraduationCap,
    category: "Education & Literacy",
    scope: "School facilities, desks, basic utilities, learning aids",
    color: "indigo"
  },
  {
    id: "SG",
    name: "Sanitation and Garbage Collection",
    icon: Trash2,
    category: "Civic Health & Sanitation",
    scope: "Waste collection, dumper bins, street cleaning, drains",
    color: "emerald"
  }
];

export default function DepartmentList() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-800">Approved Department Taxonomy</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            System configuration for automated 7-class NLP routing
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          7 Departments Configured
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {DEPARTMENTS_CONFIG.map((dept) => {
          const Icon = dept.icon;
          return (
            <div key={dept.id} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                  <Icon className="h-4.5 w-4.5 stroke-[1.75]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">{dept.name}</span>
                    <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {dept.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{dept.scope}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  Active Taxonomy
                </span>
                <span className="text-xs text-slate-400 font-mono">-- records</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-slate-50/70 border-t border-slate-100 text-center">
        <p className="text-[11px] text-slate-400">
          Complaint intake counters will activate once database connection is initialized.
        </p>
      </div>
    </div>
  );
}
