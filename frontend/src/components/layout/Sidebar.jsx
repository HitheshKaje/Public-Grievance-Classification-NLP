import React from 'react';
import { 
  Home, 
  FileText, 
  Brain, 
  Send, 
  Landmark, 
  Users, 
  Settings,
  X,
  LogOut
} from 'lucide-react';

export const SIDEBAR_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'incoming', label: 'Incoming Complaints', icon: FileText },
  { id: 'classification', label: 'Classification Review', icon: Brain },
  { id: 'forwarding', label: 'Department Forwarding', icon: Send },
  { id: 'departments', label: 'Departments', icon: Landmark },
  { id: 'officers', label: 'Officers', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, onSelectTab, isOpen, onClose, onLogout }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200/90 text-slate-800 z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } select-none overflow-hidden shadow-xs`}
      >
        {/* Top Header & Navigation */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo & Header */}
          <div className="pt-6 pb-5 px-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              {/* Ashoka Emblem representation */}
              <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-purple-50 text-indigo-700 border border-purple-100/80 shadow-xs">
                <svg viewBox="0 0 100 100" className="h-7 w-7 text-indigo-700 fill-current opacity-90" aria-label="Emblem">
                  <path d="M50 8 C40 8 36 15 36 22 C36 27 40 31 43 33 C37 36 32 42 32 50 C32 57 37 62 44 65 L44 76 L32 80 L32 86 L68 86 L68 80 L56 76 L56 65 C63 62 68 57 68 50 C68 42 63 36 57 33 C60 31 64 27 64 22 C64 15 60 8 50 8 Z M50 14 C54 14 57 17 57 21 C57 25 54 28 50 28 C46 28 43 25 43 21 C43 17 46 14 50 14 Z M48 37 C49 37 50 37 51 37 C56 37 60 41 60 47 C60 52 56 56 50 56 C44 56 40 52 40 47 C40 41 44 37 48 37 Z" />
                  <circle cx="50" cy="91" r="3" />
                  <rect x="25" y="94" width="50" height="3" rx="1.5" />
                </svg>
              </div>

              <div>
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">
                  CiviQ
                </h1>
                <p className="text-[11px] text-slate-500 font-medium leading-tight">
                  Civic Intelligence &amp;
                </p>
                <p className="text-[11px] text-slate-500 font-medium leading-tight">
                  Admin Portal
                </p>
              </div>
            </div>

            <button 
              type="button" 
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="px-3.5 py-4 space-y-1.5 flex-1 overflow-y-auto">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs transition-all text-left group cursor-pointer ${
                    isActive
                      ? 'bg-indigo-700 text-white shadow-md shadow-indigo-600/25 font-bold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 stroke-[2] transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                  <span className="text-[13px]">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Action in Sidebar */}
          {onLogout && (
            <div className="px-3.5 pt-2 pb-3 border-t border-slate-100">
              <button
                type="button"
                id="sidebar-logout-btn"
                onClick={onLogout}
                className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 border border-transparent hover:border-rose-100 transition-all text-left group cursor-pointer active:scale-95"
              >
                <LogOut className="h-4 w-4 text-rose-500 group-hover:text-rose-600 transition-colors" />
                <span className="text-[13px]">Log Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Capitol Illustration Watermark */}
        <div className="relative pointer-events-none mt-auto pt-6 px-4 pb-4 bg-slate-50/50 border-t border-slate-100/60">
          <svg viewBox="0 0 300 180" className="w-full text-indigo-700/15 stroke-current fill-none stroke-[1.2]">
            {/* Capitol Dome & Pillars Outline */}
            <path d="M150 15 L150 30 M146 30 L154 30 M150 30 C130 30 115 50 115 75 L185 75 C185 50 170 30 150 30 Z" />
            <rect x="110" y="75" width="80" height="8" rx="1" />
            {/* Columns under dome */}
            <line x1="120" y1="83" x2="120" y2="105" />
            <line x1="130" y1="83" x2="130" y2="105" />
            <line x1="140" y1="83" x2="140" y2="105" />
            <line x1="150" y1="83" x2="150" y2="105" />
            <line x1="160" y1="83" x2="160" y2="105" />
            <line x1="170" y1="83" x2="170" y2="105" />
            <line x1="180" y1="83" x2="180" y2="105" />
            <rect x="105" y="105" width="90" height="7" rx="1" />
            {/* Main building body */}
            <rect x="50" y="112" width="200" height="55" rx="2" />
            {/* Building portico */}
            <polygon points="150,112 100,126 200,126" />
            {/* Building windows */}
            <rect x="65" y="130" width="8" height="12" rx="1" />
            <rect x="80" y="130" width="8" height="12" rx="1" />
            <rect x="95" y="130" width="8" height="12" rx="1" />
            <rect x="195" y="130" width="8" height="12" rx="1" />
            <rect x="210" y="130" width="8" height="12" rx="1" />
            <rect x="225" y="130" width="8" height="12" rx="1" />
            {/* Steps base */}
            <line x1="30" y1="167" x2="270" y2="167" />
            <line x1="15" y1="173" x2="285" y2="173" />
          </svg>
        </div>
      </aside>
    </>
  );
}
