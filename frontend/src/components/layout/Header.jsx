import React from 'react';
import { Home, Search, Bell, ChevronDown } from 'lucide-react';
import PortalSwitcher from '../common/PortalSwitcher';

export default function Header({ onOpenSidebar, activeTabTitle = "Overview", onSelectPortal, currentPortal = 'admin' }) {
  return (
    <header className="h-16 px-6 lg:px-8 bg-transparent flex items-center justify-between">
      {/* Left: Breadcrumbs & Page Title */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Home className="h-3.5 w-3.5 text-slate-400" />
          <span>&gt;</span>
          <span className="text-slate-600 font-medium capitalize">{activeTabTitle}</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
          Admin Dashboard
        </h1>
      </div>

      {/* Right: Switcher, Search, Notification Bell, User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Portal Role Switcher */}
        {onSelectPortal && (
          <PortalSwitcher
            currentPortal={currentPortal}
            onSelectPortal={onSelectPortal}
          />
        )}

        {/* Search Input */}
        <div className="relative hidden md:block w-60 lg:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search complaints..."
            readOnly
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200/90 rounded-full text-slate-700 placeholder-slate-400 shadow-sm focus:outline-none cursor-default"
          />
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="h-9 w-9 rounded-full bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-sm transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 stroke-[2]" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-blue-600 rounded-full" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-1 cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-[#0a1835] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            AD
          </div>
          <span className="text-xs font-semibold text-slate-800 hidden sm:inline-block">
            Admin
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
