// src/components/notifications/NotificationPanel.jsx
import React from 'react';
import { CheckCheck, Bell, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';

export default function NotificationPanel({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-30" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
              2 new
            </span>
          </div>
          <button 
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            onClick={onClose}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        </div>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {MOCK_NOTIFICATIONS.map((notif) => (
            <div
              key={notif.id}
              className={`p-3.5 hover:bg-slate-50 transition-colors flex gap-3 ${
                notif.unread ? 'bg-blue-50/20' : ''
              }`}
            >
              <div className="mt-0.5">
                {notif.type === 'classification' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                {notif.type === 'system' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                )}
                {notif.type === 'report' && (
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                  <span className="text-[10px] text-slate-400">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
          <button 
            onClick={onClose} 
            className="text-xs text-slate-600 hover:text-blue-600 font-medium"
          >
            Close notifications
          </button>
        </div>
      </div>
    </>
  );
}
