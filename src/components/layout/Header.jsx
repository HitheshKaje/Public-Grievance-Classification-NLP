// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, Shield } from 'lucide-react';
import NotificationPanel from '../notifications/NotificationPanel';

export default function Header({ onOpenSidebar }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/complaints?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/complaints');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu Button & Title/Subtitle */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenSidebar}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="truncate">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
              Public Grievance Classification
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block truncate mt-0.5">
              AI-powered classification and analysis of citizen complaints
            </p>
          </div>
        </div>

        {/* Right Section: Search Bar, Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden md:block w-56 lg:w-72"
          >
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </form>

          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
            </button>
            <NotificationPanel
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
            />
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* User Profile / Avatar */}
          <div className="flex items-center gap-3 pl-1">
            <div className="w-9 h-9 rounded-full bg-blue-700 text-white font-semibold text-xs flex items-center justify-center shadow-sm ring-2 ring-blue-100">
              HK
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Hithesh K.
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 leading-tight">
                <Shield className="w-3 h-3 text-blue-600 inline" />
                <span>Nodal Officer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
