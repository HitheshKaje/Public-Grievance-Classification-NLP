import React, { useState } from 'react';
import { 
  FileText, Search, ChevronDown, Send, CheckCircle2, 
  MapPin, Clock, Eye, X, Filter, Check, ShieldCheck,
  Printer, Image, Mic, Paperclip
} from 'lucide-react';

export default function IncomingComplaintsCard({
  complaints = [],
  total = 0,
  loading = false,
  search = '',
  onSearchChange,
  departmentFilter = 'All',
  onDepartmentFilterChange,
  statusFilter = 'All',
  onStatusFilterChange,
  onOpenWorkOrderModal,
  onRefresh
}) {
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const departmentsList = [
    'All',
    'Unassigned',
    'Water Supply Department',
    'Public Works Department',
    'Health & Sanitation Department',
    'Power & Electricity Board',
    'Municipal Lighting Division',
    'Department of Public Instruction',
    'Solid Waste Management',
    'General Civic Administration'
  ];

  const statusList = ['All', 'Pending', 'In Progress', 'Resolved'];

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending':
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex flex-col justify-between">
      {/* Header with Title and Search/Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span>Incoming Complaints</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              {total}
            </span>
          </h2>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search by ID, title..."
              className="pl-8 pr-7 py-1 text-xs bg-[#f4f7fa] border border-slate-200/80 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-36 sm:w-44 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange && onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Department Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setDeptDropdownOpen(!deptDropdownOpen);
                setStatusDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-[#f4f7fa] hover:bg-slate-100 border border-slate-200/80 rounded-lg cursor-pointer transition-colors max-w-[140px]"
            >
              <span className="truncate">{departmentFilter === 'All' ? 'All Departments' : departmentFilter}</span>
              <ChevronDown className="h-3 w-3 text-slate-400 flex-shrink-0" />
            </button>

            {deptDropdownOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs max-h-56 overflow-y-auto">
                {departmentsList.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      onDepartmentFilterChange && onDepartmentFilterChange(d);
                      setDeptDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      departmentFilter === d ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate">{d === 'All' ? 'All Departments' : d}</span>
                    {departmentFilter === d && <Check className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setStatusDropdownOpen(!statusDropdownOpen);
                setDeptDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-[#f4f7fa] hover:bg-slate-100 border border-slate-200/80 rounded-lg cursor-pointer transition-colors"
            >
              <span>{statusFilter === 'All' ? 'All Status' : statusFilter}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {statusDropdownOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs">
                {statusList.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      onStatusFilterChange && onStatusFilterChange(st);
                      setStatusDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      statusFilter === st ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{st === 'All' ? 'All Status' : st}</span>
                    {statusFilter === st && <Check className="h-3.5 w-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
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
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">ID</th>
              <th className="py-2.5 px-3 font-semibold">Complaint Overview</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Department</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Date</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Status</th>
              <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">Work Order Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium text-slate-500">
                      Loading complaints from MongoDB...
                    </span>
                  </div>
                </td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <FileText className="h-5 w-5 stroke-[1.5]" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      No complaints found
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {search || departmentFilter !== 'All' || statusFilter !== 'All' 
                        ? 'Try clearing the search or filter settings.' 
                        : 'Citizen grievances will appear here in real-time upon submission.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              complaints.map((c) => {
                const isForwarded = c.forwarding_status === 'Forwarded';
                return (
                  <tr key={c.id || c.complaint_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer" 
                      />
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-600 whitespace-nowrap">
                      {c.complaint_id}
                    </td>
                    <td className="py-3 px-3 max-w-[240px]">
                      <div className="flex items-center gap-1.5">
                        {c.method === 'voice' && (
                          <span className="p-1 rounded bg-purple-100 text-purple-700 flex-shrink-0" title="Voice Recording">
                            <Mic className="h-3 w-3" />
                          </span>
                        )}
                        {c.method === 'image' && (
                          <span className="p-1 rounded bg-emerald-100 text-emerald-700 flex-shrink-0" title="Photo Evidence">
                            <Image className="h-3 w-3" />
                          </span>
                        )}
                        {c.method === 'pdf' && (
                          <span className="p-1 rounded bg-amber-100 text-amber-700 flex-shrink-0" title="PDF Document Attached">
                            <Paperclip className="h-3 w-3" />
                          </span>
                        )}
                        <p className="font-semibold text-slate-800 truncate" title={c.title}>
                          {c.title}
                        </p>
                        {c.detected_language && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-100 text-violet-700 border border-violet-200 flex-shrink-0" title={`Filed in ${c.detected_language}`}>
                            {c.detected_language}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5" title={c.description || c.text}>
                        {c.description || c.text || 'No text provided'}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      <span className="truncate max-w-[130px] block" title={c.assigned_department || c.department || 'Unassigned'}>
                        {c.assigned_department || c.department || <span className="italic text-slate-400">Unassigned</span>}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(c.status)}`}>
                        {c.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenWorkOrderModal && onOpenWorkOrderModal({ ...c, initialTab: 'pdf_preview' })}
                          className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200/80 transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Generate & Export Structured Government PDF"
                        >
                          <Printer className="h-3 w-3 text-blue-600" />
                          <span>PDF</span>
                        </button>

                        {isForwarded ? (
                          <button
                            type="button"
                            onClick={() => onOpenWorkOrderModal && onOpenWorkOrderModal(c)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                            title="View Dispatched Work Order"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>View Order</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenWorkOrderModal && onOpenWorkOrderModal(c)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-[#1e6bf3] hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                            title="Convert to Structured Work Order and Dispatch to Officer"
                          >
                            <Send className="h-3 w-3" />
                            <span>Convert & Forward</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
