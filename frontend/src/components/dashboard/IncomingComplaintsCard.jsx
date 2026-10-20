import React from 'react';
import { FileText, Search, ChevronDown } from 'lucide-react';

export default function IncomingComplaintsCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex flex-col justify-between">
      {/* Header with Title and Search/Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            Incoming Complaints
          </h2>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              readOnly
              placeholder="Search..."
              className="pl-8 pr-3 py-1 text-xs bg-[#f4f7fa] border border-slate-200/80 rounded-lg text-slate-600 placeholder-slate-400 focus:outline-none w-28 sm:w-32 cursor-default"
            />
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-[#f4f7fa] border border-slate-200/80 rounded-lg cursor-pointer">
            <span>All Departments</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-[#f4f7fa] border border-slate-200/80 rounded-lg cursor-pointer">
            <span>All Status</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Table Structure */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#f4f7fb] text-slate-700 font-semibold border-b border-slate-100">
              <th className="py-2.5 px-3 w-8">
                <input 
                  type="checkbox" 
                  disabled 
                  className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-default" 
                />
              </th>
              <th className="py-2.5 px-3 font-semibold">ID</th>
              <th className="py-2.5 px-3 font-semibold">Complaint</th>
              <th className="py-2.5 px-3 font-semibold">Category</th>
              <th className="py-2.5 px-3 font-semibold">Department</th>
              <th className="py-2.5 px-3 font-semibold">Date</th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="8" className="py-14 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                    <FileText className="h-5 w-5 stroke-[1.5]" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    No complaints yet
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
