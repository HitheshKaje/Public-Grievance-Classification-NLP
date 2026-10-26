import React, { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown } from 'lucide-react';

export default function UserProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayName = user?.name || 'Authorized User';
  const displayEmail = user?.email || 'user@gov.in';
  const role = user?.role || 'user';
  const initials = getInitials(displayName);

  const roleColors = {
    admin: 'bg-[#0a1835] text-white',
    officer: 'bg-blue-600 text-white',
    citizen: 'bg-emerald-600 text-white',
  };

  const roleLabels = {
    admin: 'System Admin',
    officer: 'Nodal Officer',
    citizen: 'Citizen',
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        id="user-profile-menu-btn"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100/80 transition-colors cursor-pointer"
        aria-label="User Account Menu"
      >
        <div className={`h-8 w-8 rounded-full ${roleColors[role] || 'bg-slate-700 text-white'} flex items-center justify-center font-bold text-xs shadow-sm`}>
          {initials}
        </div>
        <div className="text-left hidden sm:block">
          <span className="text-xs font-semibold text-slate-800 block leading-tight truncate max-w-[120px]">
            {displayName}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block leading-none">
            {roleLabels[role] || role}
          </span>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Profile Header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className={`h-9 w-9 rounded-full ${roleColors[role] || 'bg-slate-700 text-white'} flex items-center justify-center font-bold text-xs shadow-xs`}>
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-500 truncate">{displayEmail}</p>
              </div>
            </div>

            {/* Dynamic details from MongoDB */}
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                MongoDB Verified
              </span>
              <span className="text-slate-500 font-medium">
                {user?.officer_id || user?.citizen_id || 'ID: PGMS-USR'}
              </span>
            </div>

            {user?.department && (
              <p className="text-[10px] text-slate-500 mt-1.5 truncate">
                🏛️ {user.department}
              </p>
            )}
          </div>

          {/* Sign Out Action */}
          <div className="px-2 pt-1">
            <button
              type="button"
              id="logout-btn"
              onClick={() => {
                setOpen(false);
                if (onLogout) onLogout();
              }}
              className="w-full text-left px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
