import React from 'react';
import { Home, Search, Bell, LogOut } from 'lucide-react';
import UserProfileDropdown from '../common/UserProfileDropdown';

export default function Header({ onOpenSidebar, activeTabTitle = "Overview", currentUser, onLogout }) {
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

      {/* Right: Search, Notification Bell, User Profile, Logout */}
      <div className="flex items-center gap-3 sm:gap-3.5">
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

        {/* User Profile Dropdown */}
        <UserProfileDropdown
          user={currentUser || { name: 'System Admin', email: 'admin@gov.in', role: 'admin' }}
          onLogout={onLogout}
        />

        {/* Visible Logout Button */}
        <button
          type="button"
          id="header-logout-btn"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-full transition-all shadow-xs cursor-pointer active:scale-95"
          title="Logout from account"
          aria-label="Logout"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
