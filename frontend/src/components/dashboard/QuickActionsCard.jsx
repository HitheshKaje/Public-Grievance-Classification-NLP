import React from 'react';
import { Zap, FileText, Users, Settings } from 'lucide-react';

export default function QuickActionsCard({ onActionClick }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">
          Quick Actions
        </h2>
      </div>

      {/* Buttons Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 py-1">
        {/* New Complaint */}
        <button
          type="button"
          onClick={() => onActionClick && onActionClick('new_complaint')}
          className="bg-[#1e6bf3] hover:bg-blue-700 text-white rounded-xl py-3 px-2.5 flex items-center justify-center gap-2 text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
        >
          <FileText className="h-4 w-4 stroke-[2]" />
          <span>New Complaint</span>
        </button>

        {/* Manage Officers */}
        <button
          type="button"
          onClick={() => onActionClick && onActionClick('manage_officers')}
          className="bg-[#ede9fe] hover:bg-[#e0d7fe] text-[#7c3aed] rounded-xl py-3 px-2.5 flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer"
        >
          <Users className="h-4 w-4 stroke-[2]" />
          <span>Manage Officers</span>
        </button>

        {/* System Settings */}
        <button
          type="button"
          onClick={() => onActionClick && onActionClick('view_settings')}
          className="bg-slate-800 hover:bg-slate-900 text-white rounded-xl py-3 px-2.5 flex items-center justify-center gap-2 text-xs font-semibold shadow-sm shadow-slate-900/20 transition-all cursor-pointer"
        >
          <Settings className="h-4 w-4 stroke-[2]" />
          <span>System Settings</span>
        </button>
      </div>
    </div>
  );
}
