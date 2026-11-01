import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Bell, LogOut, Globe, Check, MessageSquare, 
  ExternalLink, CheckCircle2, Clock, X, ChevronRight 
} from 'lucide-react';
import UserProfileDropdown from '../common/UserProfileDropdown';
import { useLanguage } from '../../context/LanguageContext';
import { 
  fetchUserNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  getLocalUserComplaintIds 
} from '../../services/complaintService';

export default function UserHeader({ onOpenSidebar, currentUser, onLogout, onTrackComplaint }) {
  const citizenName = currentUser?.name || 'Citizen';
  const { language, setLanguage, languages, t } = useLanguage();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const storedIds = getLocalUserComplaintIds ? getLocalUserComplaintIds() : [];
      const data = await fetchUserNotifications({
        citizenId: currentUser?.id || currentUser?.citizen_id,
        email: currentUser?.email,
        phone: currentUser?.phone,
        complaintIds: storedIds.join(',')
      });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000); // 10s live sync
    return () => clearInterval(interval);
  }, [currentUser]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await markNotificationRead(notif.id || notif._id);
      setNotifications((prev) =>
        prev.map((n) => ((n.id === notif.id || n._id === notif._id) ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setNotificationsOpen(false);

    if (notif.complaint_id) {
      window.dispatchEvent(
        new CustomEvent('civiq_track_complaint', {
          detail: { complaintId: notif.complaint_id }
        })
      );
      if (onTrackComplaint) {
        onTrackComplaint(notif.complaint_id);
      }
    }
  };

  const handleMarkAllRead = async () => {
    const storedIds = getLocalUserComplaintIds ? getLocalUserComplaintIds() : [];
    await markAllNotificationsRead({
      citizen_id: currentUser?.id || currentUser?.citizen_id,
      email: currentUser?.email,
      complaint_ids: storedIds
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <header className="h-16 px-6 lg:px-8 bg-transparent flex items-center justify-between relative z-40">
      {/* Left: Mobile menu & Welcome Title */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <span className="text-xs text-slate-500 font-medium block leading-none">
            {t('welcome_back', 'Welcome Back,')}
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1 leading-none">
            {citizenName}
          </h1>
        </div>
      </div>

      {/* Right: 3-Language Selector, Notifications, User Profile, Logout Button */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* 3-Language Selector (English, Kannada, Hindi) */}
        <div className="flex items-center p-0.5 sm:p-1 bg-white border border-slate-200/90 rounded-full shadow-xs">
          <Globe className="h-3.5 w-3.5 text-blue-600 ml-1.5 mr-0.5 hidden md:block" />
          {languages.map((l) => (
            <button
              key={l.id}
              type="button"
              id={`lang-btn-${l.id}`}
              onClick={() => setLanguage(l.id)}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold rounded-full transition-all cursor-pointer ${
                language === l.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={`Switch dashboard language to ${l.label}`}
            >
              {l.native}
            </button>
          ))}
        </div>

        {/* Live Notification Bell with Direct Officer Updates Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="h-9 w-9 rounded-full bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-sm transition-all cursor-pointer relative"
            aria-label={t('notifications', 'Notifications')}
            title="Direct Officer Updates & Messages"
          >
            <Bell className="h-4 w-4 stroke-[2]" />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 h-4.5 min-w-[18px] px-1 bg-red-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : (
              <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-slate-300 rounded-full" />
            )}
          </button>

          {/* Floating Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Direct Officer Updates
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                      <Bell className="h-4.5 w-4.5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">No officer updates yet</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] mx-auto">
                      When a departmental officer updates your grievance, their direct message will arrive here instantly.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isResolved = notif.status === 'Resolved';
                    return (
                      <div
                        key={notif.id || notif._id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                          !notif.read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div
                          className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${
                            isResolved ? 'bg-emerald-600' : 'bg-blue-600'
                          }`}
                        >
                          {isResolved ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 text-xs">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono font-bold text-blue-600 text-[11px] truncate">
                              {notif.complaint_id}
                            </span>
                            <span className="text-[10px] text-slate-400 flex-shrink-0">
                              {formatRelativeTime(notif.created_at)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                                isResolved
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {notif.status || 'Updated'}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-700 truncate">
                              {notif.officer_name ? `${notif.officer_name}` : 'Field Officer'}
                              {notif.officer_department ? ` • ${notif.officer_department}` : ''}
                            </span>
                          </div>

                          {/* The Direct Message Text */}
                          <p className="text-[11px] text-slate-600 font-medium italic mt-1 line-clamp-2 bg-white/70 p-1.5 rounded-lg border border-slate-100">
                            "{notif.message}"
                          </p>

                          <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-slate-400">
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <span>Delivered directly from officer</span>
                            </span>
                            <span className="text-blue-600 font-bold flex items-center gap-0.5 hover:underline">
                              <span>Track</span>
                              <ChevronRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {notifications.length > 0 && (
                <div className="pt-2 px-4 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(false);
                      window.dispatchEvent(
                        new CustomEvent('civiq_track_complaint', { detail: {} })
                      );
                      if (onTrackComplaint) onTrackComplaint();
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    View All in Track Complaint &rarr;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

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
          title={t('logout', 'Logout')}
          aria-label={t('logout', 'Logout')}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('logout', 'Logout')}</span>
        </button>
      </div>
    </header>
  );
}
