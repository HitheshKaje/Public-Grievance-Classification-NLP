import React from 'react';
import { Menu, Bell, User as UserIcon, ChevronDown } from 'lucide-react';
import PortalSwitcher from '../common/PortalSwitcher';

export default function UserHeader({ onOpenSidebar, onSelectPortal, currentPortal = 'user' }) {
  return (
    <header className="h-16 px-6 lg:px-8 bg-transparent flex items-center justify-between">
      {/* Left: Mobile menu & Welcome Title */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <span className="text-xs text-slate-500 font-medium block leading-none">
            Welcome Back,
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1 leading-none">
            Citizen
          </h1>
        </div>
      </div>

      {/* Right: Switcher, Notifications, User Profile */}
      <div className="flex items-center gap-4">
        {/* Portal Role Switcher */}
        {onSelectPortal && (
          <PortalSwitcher
            currentPortal={currentPortal}
            onSelectPortal={onSelectPortal}
          />
        )}

        {/* Notification Bell with red badge */}
        <button
          type="button"
          className="h-9 w-9 rounded-full bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-sm transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 stroke-[2]" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-red-500 rounded-full" />
        </button>

        {/* User Profile Area */}
        <div className="flex items-center gap-2 pl-1 cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-medium text-xs shadow-sm">
            <UserIcon className="h-4.5 w-4.5 text-slate-600" />
          </div>
          <span className="text-xs font-semibold text-slate-800 hidden sm:inline-block">
            User
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
