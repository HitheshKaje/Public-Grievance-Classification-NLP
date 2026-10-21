import React, { useState, useRef, useEffect } from 'react';
import { Shield, User, Building2, ChevronDown, ArrowLeftRight } from 'lucide-react';

export default function PortalSwitcher({ currentPortal, onSelectPortal }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const portals = [
    { id: 'officer', name: 'Officer Portal', icon: Building2, desc: 'Department Nodal View', color: 'text-blue-600 bg-blue-50' },
    { id: 'user', name: 'Citizen Portal', icon: User, desc: 'Public Grievance View', color: 'text-emerald-600 bg-emerald-50' },
    { id: 'admin', name: 'Admin Portal', icon: Shield, desc: 'System Administration View', color: 'text-purple-600 bg-purple-50' },
  ];

  const current = portals.find(p => p.id === currentPortal) || portals[0];
  const CurrentIcon = current.icon;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-full transition-all shadow-xs cursor-pointer"
      >
        <span className="flex items-center gap-1 text-blue-600">
          <CurrentIcon className="h-3.5 w-3.5" />
        </span>
        <span className="hidden sm:inline-block">{current.name}</span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-1.5 z-50">
          <div className="px-3.5 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Switch Dashboard Role
          </div>
          {portals.map((p) => {
            const Icon = p.icon;
            const isSelected = p.id === currentPortal;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onSelectPortal(p.id);
                  setOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors ${
                  isSelected ? 'bg-blue-50/60 font-semibold' : ''
                }`}
              >
                <div className={`p-1.5 rounded-lg ${p.color} flex-shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-800 block leading-tight">
                    {p.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {p.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
