import React from 'react';
import { Menu, Search, Bell, Droplets, LogOut } from 'lucide-react';
import UserProfileDropdown from '../common/UserProfileDropdown';

export default function OfficerHeader({ onOpenSidebar, departmentName = "Water Supply Department", currentUser, onLogout }) {
  const activeDept = currentUser?.department || departmentName;

  return (
    <header className="h-16 px-6 lg:px-8 bg-transparent flex items-center justify-between">
      {/* Left: Mobile menu & Department Badge + Title */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            <Droplets className="h-4.5 w-4.5 fill-current" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block leading-none">
              Department Officer
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1 leading-none">
              {activeDept}
            </h1>
          </div>
        </div>
      </div>

      {/* Right: Search, Notification Bell, Officer Profile, Logout */}
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

        {/* Notification Bell with red badge */}
        <button
          type="button"
          className="h-9 w-9 rounded-full bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-sm transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 stroke-[2]" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-red-500 rounded-full" />
        </button>

        {/* Officer Profile Dropdown */}
        <UserProfileDropdown
          user={currentUser || { name: 'Er. Rajesh Kumar', email: 'officer.water@gov.in', role: 'officer', department: activeDept, officer_id: 'OFF-WTR-001' }}
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
