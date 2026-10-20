import React from 'react';
import { FileText, Filter, ArrowUpDown } from 'lucide-react';
import EmptyState from '../common/EmptyState';

export default function RecentComplaintsSection() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-800">Recent Public Grievances</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Incoming citizen complaints with automated department and priority classification
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-50 rounded-lg border border-slate-200">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>All Departments</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-50 rounded-lg border border-slate-200">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <span>Newest First</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Grievance ID</th>
              <th className="py-3 px-4">Description Snippet</th>
              <th className="py-3 px-4">Assigned Department</th>
              <th className="py-3 px-4">Problem Type</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Filed On</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="6" className="p-8">
                <EmptyState
                  title="No complaint data available yet"
                  description="Citizen grievances submitted via the public portal or API will appear here in real-time."
                  icon={FileText}
                  compact={true}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>Showing 0 of 0 grievances</span>
        <span>Connected to live database schema</span>
      </div>
    </div>
  );
}
