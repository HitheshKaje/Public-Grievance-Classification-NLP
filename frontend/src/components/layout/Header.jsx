import React from 'react';
import { Search, Bell, Menu, ShieldCheck, ChevronRight } from 'lucide-react';

export default function Header({ onOpenSidebar, activeTabTitle = "Overview" }) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <span>Portal</span>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span>Administration</span>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="text-slate-600 font-semibold">{activeTabTitle}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            Admin Dashboard
          </h1>
        </div>
      </div>

      {/* Middle & Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search input design */}
        <div className="relative hidden md:block w-64 lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            readOnly
            placeholder="Search grievances by ID, keyword..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-600 placeholder-slate-400 focus:outline-none cursor-default"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600" />
          </button>
        </div>

        {/* Administrator Profile area */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="h-9 w-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100">
            AD
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-semibold text-slate-800 block leading-tight">
              System Admin
            </span>
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              Super Administrator
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
