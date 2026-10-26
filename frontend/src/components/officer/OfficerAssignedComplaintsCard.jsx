import React, { useState } from 'react';
import { 
  FileText, Search, Filter, ChevronDown, CheckCircle2, 
  Clock, AlertCircle, RefreshCw, Eye, X, Send, MapPin, 
  ExternalLink, User, Calendar, Tag, Building2, Check,
  Printer
} from 'lucide-react';
import ComplaintWorkOrderModal from '../dashboard/ComplaintWorkOrderModal';

export default function OfficerAssignedComplaintsCard({
  complaints = [],
  total = 0,
  loading = false,
  search = '',
  onSearchChange,
  statusFilter = 'All',
  onStatusFilterChange,
  departmentFilter = 'All',
  onDepartmentFilterChange,
  onUpdateStatus,
  onRefresh,
  departmentName = "General Administration"
}) {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [pdfModalComplaint, setPdfModalComplaint] = useState(null);
  const [remarksText, setRemarksText] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false);

  const statusOptions = ['All', 'Pending', 'In Progress', 'Resolved'];
  const scopeOptions = [
    { id: 'All', label: 'All Grievances' },
    { id: departmentName, label: `My Dept (${departmentName})` },
    { id: 'Unassigned', label: 'Unassigned Queue' }
  ];

  const handleQuickStatus = async (complaintId, newStatus) => {
    if (!onUpdateStatus) return;
    setUpdatingId(complaintId);
    try {
      await onUpdateStatus(complaintId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveModalStatus = async (newStatus) => {
    if (!selectedComplaint || !onUpdateStatus) return;
    setUpdatingId(selectedComplaint.complaint_id);
    try {
      await onUpdateStatus(selectedComplaint.complaint_id, newStatus, remarksText);
      setSelectedComplaint((prev) => prev ? { ...prev, status: newStatus } : null);
      setRemarksText('');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span>My Assigned Complaints</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
              {total}
            </span>
          </h2>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search by ID, title, location..."
              className="pl-8 pr-7 py-1 text-xs bg-[#f4f7fa] border border-slate-200/80 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-44 sm:w-52 transition-all"
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

          {/* Department Scope Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setScopeDropdownOpen(!scopeDropdownOpen);
                setStatusDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-[#f4f7fa] hover:bg-slate-100 border border-slate-200/80 rounded-lg cursor-pointer transition-colors"
            >
              <span>{scopeOptions.find((o) => o.id === departmentFilter)?.label || departmentFilter}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {scopeDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs">
                {scopeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onDepartmentFilterChange && onDepartmentFilterChange(opt.id);
                      setScopeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      departmentFilter === opt.id ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {departmentFilter === opt.id && <Check className="h-3.5 w-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setStatusDropdownOpen(!statusDropdownOpen);
                setScopeDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-[#f4f7fa] hover:bg-slate-100 border border-slate-200/80 rounded-lg cursor-pointer transition-colors"
            >
              <Filter className="h-3 w-3 text-slate-400" />
              <span>{statusFilter === 'All' ? 'All Status' : statusFilter}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {statusDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs">
                {statusOptions.map((st) => (
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

          {/* Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              title="Refresh Complaints from Database"
              className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          )}
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
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Location</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Date</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Status</th>
              <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
                    <span className="text-xs text-slate-500 font-medium">
                      Loading grievances from MongoDB...
                    </span>
                  </div>
                </td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <FileText className="h-5 w-5 stroke-[1.5]" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      No complaints found
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {search || statusFilter !== 'All' 
                        ? 'Try clearing the search or filter criteria.' 
                        : 'New complaints from your department will appear here in real-time.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              complaints.map((item) => (
                <tr key={item.id || item.complaint_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer" 
                    />
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-600 whitespace-nowrap">
                    {item.complaint_id}
                  </td>
                  <td className="py-3 px-3 max-w-[260px]">
                    <p className="font-semibold text-slate-800 truncate" title={item.title}>
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5" title={item.description || item.text}>
                      {item.description || item.text || 'No description provided'}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-rose-500 flex-shrink-0" />
                      <span className="truncate max-w-[140px]">{item.location || 'Not specified'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(item.status)}`}>
                      {item.status || 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {item.status !== 'In Progress' && item.status !== 'Resolved' && (
                        <button
                          type="button"
                          disabled={updatingId === item.complaint_id}
                          onClick={() => handleQuickStatus(item.complaint_id, 'In Progress')}
                          className="px-2 py-1 text-[10px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                          title="Start Review"
                        >
                          Review
                        </button>
                      )}

                      {item.status === 'In Progress' && (
                        <button
                          type="button"
                          disabled={updatingId === item.complaint_id}
                          onClick={() => handleQuickStatus(item.complaint_id, 'Resolved')}
                          className="px-2 py-1 text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                          title="Mark as Resolved"
                        >
                          Resolve
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setPdfModalComplaint({ ...item, initialTab: 'pdf_preview' })}
                        className="px-2 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200/80 transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="View & Print Official Government PDF Work Order"
                      >
                        <Printer className="h-3 w-3 text-blue-600" />
                        <span>PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedComplaint(item)}
                        className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="View Full Grievance Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail & Status Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Official Complaint Reference
                </span>
                <h3 className="text-base font-extrabold text-blue-600 font-mono">
                  {selectedComplaint.complaint_id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content Grid */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Title</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedComplaint.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Location</span>
                  <span className="font-semibold text-slate-700">{selectedComplaint.location || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Filing Date</span>
                  <span className="font-semibold text-slate-700">{formatDate(selectedComplaint.created_at)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Department</span>
                  <span className="font-semibold text-slate-700">{selectedComplaint.assigned_department || selectedComplaint.department || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Current Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-0.5 ${getStatusBadge(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Grievance Description</span>
                <p className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-slate-700 mt-1 leading-relaxed whitespace-pre-wrap">
                  {selectedComplaint.description || selectedComplaint.text || 'No description recorded'}
                </p>
              </div>

              {/* Attachments if any */}
              {selectedComplaint.file_references && selectedComplaint.file_references.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1.5">
                    Attached Files ({selectedComplaint.file_references.length})
                  </span>
                  <div className="space-y-1.5">
                    {selectedComplaint.file_references.map((f, i) => (
                      <a
                        key={i}
                        href={f.file_path ? `http://localhost:8000${f.file_path}` : '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors group"
                      >
                        <span className="font-medium text-slate-700 group-hover:text-blue-600 truncate">{f.original_name}</span>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update Actions */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <span className="text-[11px] font-semibold text-slate-700 block">
                  Update Official Status in MongoDB
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={updatingId === selectedComplaint.complaint_id}
                    onClick={() => handleSaveModalStatus('Pending')}
                    className={`px-3 py-1.5 rounded-lg font-semibold border cursor-pointer transition-all ${
                      selectedComplaint.status === 'Pending'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Pending
                  </button>

                  <button
                    type="button"
                    disabled={updatingId === selectedComplaint.complaint_id}
                    onClick={() => handleSaveModalStatus('In Progress')}
                    className={`px-3 py-1.5 rounded-lg font-semibold border cursor-pointer transition-all ${
                      selectedComplaint.status === 'In Progress'
                        ? 'bg-blue-600 text-white border-blue-700'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    In Progress
                  </button>

                  <button
                    type="button"
                    disabled={updatingId === selectedComplaint.complaint_id}
                    onClick={() => handleSaveModalStatus('Resolved')}
                    className={`px-3 py-1.5 rounded-lg font-semibold border cursor-pointer transition-all ${
                      selectedComplaint.status === 'Resolved'
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Structured Government PDF Work Order Modal */}
      {pdfModalComplaint && (
        <ComplaintWorkOrderModal
          complaint={pdfModalComplaint}
          onClose={() => setPdfModalComplaint(null)}
          onForwardSuccess={onRefresh}
        />
      )}
    </div>
  );
}
