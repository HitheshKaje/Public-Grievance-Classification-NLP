import React from 'react';
import { Menu, Bell, LogOut } from 'lucide-react';
import UserProfileDropdown from '../common/UserProfileDropdown';

export default function UserHeader({ onOpenSidebar, currentUser, onLogout }) {
  const citizenName = currentUser?.name || 'Citizen';

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
            {citizenName}
          </h1>
        </div>
      </div>

      {/* Right: Notifications, User Profile, Logout Button */}
      <div className="flex items-center gap-3">
        {/* Notification Bell with red badge */}
        <button
          type="button"
          className="h-9 w-9 rounded-full bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-sm transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 stroke-[2]" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-red-500 rounded-full" />
        </button>

        {/* User Profile Dropdown */}
        <UserProfileDropdown
          user={currentUser || { name: 'Aarav Sharma', email: 'citizen@gmail.com', role: 'citizen', citizen_id: 'CIT-2026-001' }}
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
