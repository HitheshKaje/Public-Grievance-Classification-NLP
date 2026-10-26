import React from 'react';
import { 
  Home, 
  FilePlus2, 
  ClipboardList, 
  Search, 
  User, 
  Headphones,
  Landmark,
  X,
  LogOut 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const USER_SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'submit', label: 'Submit Complaint', icon: FilePlus2 },
  { id: 'my_complaints', label: 'My Complaints', icon: ClipboardList },
  { id: 'track', label: 'Track Complaint', icon: Search },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'support', label: 'Help & Support', icon: Headphones },
];

export default function UserSidebar({ activeTab, onSelectTab, isOpen, onClose, onLogout }) {
  const { t } = useLanguage();
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#0a1835] text-white z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } select-none overflow-hidden`}
      >
        {/* Top Header & Navigation */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo & Header */}
          <div className="pt-6 pb-5 px-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              {/* Government Portal Pillar Icon */}
              <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center text-slate-100">
                <Landmark className="h-8 w-8 stroke-[1.5]" />
              </div>

              <div>
                <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                  {t('portal_name', 'PGMS')}
                </h1>
                <p className="text-[11px] text-slate-300 font-normal leading-tight">
                  {t('portal_sub_line1', 'Public Grievance')}
                </p>
                <p className="text-[11px] text-slate-300 font-normal leading-tight">
                  {t('portal_sub_line2', 'Management System')}
                </p>
              </div>
            </div>

            <button 
              type="button" 
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="px-3.5 py-4 space-y-1.5 flex-1 overflow-y-auto">
            {USER_SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-medium transition-all text-left ${
                    isActive
                      ? 'bg-[#1e6bf3] text-white shadow-lg shadow-blue-600/30 font-semibold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 stroke-[2] ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="text-[13px]">{t(item.id, item.label)}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Action in Sidebar */}
          {onLogout && (
            <div className="px-3.5 pt-2 pb-3 border-t border-white/10">
              <button
                type="button"
                id="sidebar-logout-btn"
                onClick={onLogout}
                className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-500/20 transition-all text-left group cursor-pointer active:scale-95"
              >
                <LogOut className="h-4 w-4 text-rose-400 group-hover:text-rose-200 transition-colors" />
                <span className="text-[13px]">{t('logout', 'Log Out')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Capitol Illustration & Motto Watermark */}
        <div className="relative pointer-events-none mt-auto pt-4 px-4 pb-4">
          <svg viewBox="0 0 300 160" className="w-full text-blue-300 stroke-current fill-none stroke-[1.2] opacity-20">
            <path d="M150 15 L150 30 M146 30 L154 30 M150 30 C130 30 115 50 115 75 L185 75 C185 50 170 30 150 30 Z" />
            <rect x="110" y="75" width="80" height="8" rx="1" />
            <line x1="120" y1="83" x2="120" y2="105" />
            <line x1="130" y1="83" x2="130" y2="105" />
            <line x1="140" y1="83" x2="140" y2="105" />
            <line x1="150" y1="83" x2="150" y2="105" />
            <line x1="160" y1="83" x2="160" y2="105" />
            <line x1="170" y1="83" x2="170" y2="105" />
            <line x1="180" y1="83" x2="180" y2="105" />
            <rect x="105" y="105" width="90" height="7" rx="1" />
            <rect x="50" y="112" width="200" height="40" rx="2" />
            <polygon points="150,112 100,126 200,126" />
          </svg>
          <div className="text-center mt-2">
            <p className="text-xs font-semibold text-slate-200">{t('motto', 'Your Voice for a Better Community')}</p>
            <div className="w-8 h-0.5 bg-blue-500/60 mx-auto mt-2 rounded-full" />
          </div>
        </div>
      </aside>
    </>
  );
}
