import React from 'react';
import { Clock, ArrowRight, Bell } from 'lucide-react';

export default function OfficerRecentUpdatesCard({ onViewAll }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            Recent Updates
          </h2>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Table Structure */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#f4f7fb] text-slate-700 font-semibold border-b border-slate-100">
              <th className="py-2.5 px-4 font-semibold">Complaint ID</th>
              <th className="py-2.5 px-4 font-semibold">Update</th>
              <th className="py-2.5 px-4 font-semibold text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="3" className="py-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                    <Bell className="h-5 w-5 stroke-[1.5]" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    No recent updates
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Updates on your assigned complaints will appear here.
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
