import React, { useState } from 'react';
import { 
  FileText, Search, Filter, ChevronDown, CheckCircle2, 
  Clock, AlertCircle, RefreshCw, Eye, X, Send, MapPin, 
  ExternalLink, User, Calendar, Tag, Building2, Check,
  Phone, Mail, Image as ImageIcon, MessageSquare, AlertTriangle
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BACKEND_URL = API_BASE_URL.replace('/api', '');

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
  const [remarksText, setRemarksText] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const statusOptions = ['All', 'Pending', 'In Progress', 'Resolved'];
  const scopeOptions = [
    { id: 'All', label: 'All Grievances' },
    { id: departmentName, label: `My Dept (${departmentName})` },
    { id: 'Unassigned', label: 'Unassigned Queue' }
  ];

  const handleOpenReview = (complaint) => {
    setSelectedComplaint(complaint);
    setRemarksText(complaint.remarks || '');
    setActionSuccess('');
  };

  const handleCloseReview = () => {
    setSelectedComplaint(null);
    setRemarksText('');
    setActionSuccess('');
  };

  const handleSaveStatus = async (newStatus) => {
    if (!selectedComplaint || !onUpdateStatus) return;
    setUpdatingId(selectedComplaint.complaint_id);
    setActionSuccess('');
    try {
      await onUpdateStatus(selectedComplaint.complaint_id, newStatus, remarksText);
      setSelectedComplaint((prev) => prev ? { ...prev, status: newStatus, remarks: remarksText } : null);
      setActionSuccess(`Status updated to "${newStatus}" and direct message delivered to the citizen successfully!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Error updating complaint: ${err.message}`);
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
              placeholder="Search by ID, keyword..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200/90 text-slate-700 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all w-48 sm:w-56"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setStatusDropdownOpen(!statusDropdownOpen);
                setScopeDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
            >
              <Filter className="h-3 w-3 text-slate-500" />
              <span>Status: {statusFilter}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {statusDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200/90 rounded-xl shadow-lg py-1 z-30 animate-in fade-in zoom-in-95">
                {statusOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onStatusFilterChange && onStatusFilterChange(opt);
                      setStatusDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                      statusFilter === opt ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Department Scope Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setScopeDropdownOpen(!scopeDropdownOpen);
                setStatusDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
            >
              <span>Scope: {departmentFilter === 'All' ? 'All' : departmentFilter.split(' ')[0]}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {scopeDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200/90 rounded-xl shadow-lg py-1 z-30 animate-in fade-in zoom-in-95">
                {scopeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onDepartmentFilterChange && onDepartmentFilterChange(opt.id);
                      setScopeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                      departmentFilter === opt.id ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
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
                  <td className="py-3 px-3 max-w-[280px]">
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
                      <span className="truncate max-w-[150px]">{item.location || 'Not specified'}</span>
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
                      {item.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => handleOpenReview(item)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                          title="Review Complaint & Start Working"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Review &amp; Start</span>
                        </button>
                      )}

                      {item.status === 'In Progress' && (
                        <button
                          type="button"
                          onClick={() => handleOpenReview(item)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                          title="Review & Mark as Resolved"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Resolve</span>
                        </button>
                      )}

                      {item.status === 'Resolved' && (
                        <button
                          type="button"
                          onClick={() => handleOpenReview(item)}
                          className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                          title="View Resolved Complaint Details"
                        >
                          <Eye className="h-3 w-3 text-slate-500" />
                          <span>View</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Focused Officer Review & Message Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Officer Grievance Review
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(selectedComplaint.status)}`}>
                    {selectedComplaint.status || 'Pending'}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-blue-600 font-mono">
                  {selectedComplaint.complaint_id}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseReview}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Success Alert Banner */}
            {actionSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Grievance Details Review */}
            <div className="space-y-4 text-xs">
              
              {/* Subject Title */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Complaint Subject
                </span>
                <p className="font-bold text-slate-900 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedComplaint.title}
                </p>
              </div>

              {/* Citizen Statement */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Citizen Statement
                </span>
                <p className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedComplaint.description || selectedComplaint.text || 'No description provided.'}
                </p>
              </div>

              {/* Location & Metadata Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Incident Location</span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-slate-800 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                    <span>{selectedComplaint.location || 'Location Pending'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Citizen Contact</span>
                  <div className="mt-0.5 text-slate-800 font-medium">
                    <p className="font-bold">{selectedComplaint.citizen_name || 'Citizen'}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                      {selectedComplaint.phone && (
                        <a href={`tel:${selectedComplaint.phone}`} className="hover:text-blue-600 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-blue-500" />
                          <span>{selectedComplaint.phone}</span>
                        </a>
                      )}
                      {selectedComplaint.email && (
                        <a href={`mailto:${selectedComplaint.email}`} className="hover:text-blue-600 flex items-center gap-1">
                          <Mail className="h-3 w-3 text-rose-500" />
                          <span className="truncate max-w-[140px]">{selectedComplaint.email}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Department</span>
                  <span className="font-semibold text-slate-700 mt-0.5 block">
                    {selectedComplaint.assigned_department || selectedComplaint.department || 'General Administration'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date Filed</span>
                  <span className="font-semibold text-slate-700 mt-0.5 block">
                    {formatDate(selectedComplaint.created_at)}
                  </span>
                </div>
              </div>

              {/* Attached Evidence & Photos */}
              {selectedComplaint.file_references && selectedComplaint.file_references.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Attached Evidence &amp; Documents ({selectedComplaint.file_references.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedComplaint.file_references.map((f, i) => {
                      const filePath = f.path || f.file_path || '';
                      const fileName = f.filename || f.original_name || 'Attached File';
                      const isImg = Boolean(
                        filePath.match(/\.(jpeg|jpg|png|webp|gif)$/i) || 
                        f.content_type?.startsWith('image') ||
                        fileName.match(/\.(jpeg|jpg|png|webp|gif)$/i)
                      );
                      const fileUrl = filePath.startsWith('http') ? filePath : `${BACKEND_URL}${filePath}`;

                      return (
                        <div key={i} className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center gap-3 group hover:border-blue-300 transition-all">
                          {isImg ? (
                            <div className="h-14 w-14 rounded-lg bg-slate-900 overflow-hidden flex-shrink-0 border border-slate-300 shadow-xs relative">
                              <img 
                                src={fileUrl} 
                                alt={fileName} 
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform" 
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            </div>
                          ) : (
                            <div className="h-14 w-14 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
                              <FileText className="h-6 w-6 stroke-[1.8]" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-800 text-xs truncate" title={fileName}>
                              {fileName}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {isImg ? 'Photo evidence' : 'Attached document'}
                            </p>
                            <a 
                              href={fileUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline mt-1"
                            >
                              <span>View Full Size</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Officer Status Update & Messaging Section */}
              <div className="pt-4 border-t border-slate-200/80 space-y-4">
                
                {/* Pending State -> Officer can send message & mark In Progress */}
                {selectedComplaint.status === 'Pending' && (
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-3">
                    <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>Action Step 1: Send Direct Message to Citizen &amp; Mark In Progress</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Type an update message directly to the citizen (e.g. site inspection assigned, work started). This message goes <strong>directly to the citizen</strong> in real-time, bypassing admin review.
                    </p>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Officer Message / Notes (Optional):
                      </label>
                      <textarea
                        rows={3}
                        value={remarksText}
                        onChange={(e) => setRemarksText(e.target.value)}
                        placeholder="e.g., Complaint accepted. Deputing field technician to inspect site today..."
                        className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-slate-400 shadow-xs"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCloseReview}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-white rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={updatingId === selectedComplaint.complaint_id}
                        onClick={() => handleSaveStatus('In Progress')}
                        className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{updatingId === selectedComplaint.complaint_id ? 'Sending to Citizen...' : 'Send Direct to Citizen & Mark In Progress'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* In Progress State -> Officer can send message & mark Resolved */}
                {selectedComplaint.status === 'In Progress' && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Action Step 2: Send Direct Resolution Note to Citizen &amp; Mark Resolved</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Type your resolution note directly to the citizen and close the grievance as <strong>Resolved</strong>. This resolution notice will be dispatched <strong>straight to the citizen</strong>.
                    </p>

                    {selectedComplaint.remarks && (
                      <div className="p-2.5 bg-white/80 rounded-xl border border-emerald-100 text-[11px] text-slate-700">
                        <span className="font-bold text-emerald-700 block mb-0.5">Previous Officer Update:</span>
                        <span>{selectedComplaint.remarks}</span>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Resolution Message to Citizen:
                      </label>
                      <textarea
                        rows={3}
                        value={remarksText}
                        onChange={(e) => setRemarksText(e.target.value)}
                        placeholder="e.g., Issue has been inspected and rectified on site. Water pipeline repaired and pressure restored..."
                        className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 placeholder-slate-400 shadow-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleSaveStatus('In Progress')}
                        disabled={updatingId === selectedComplaint.complaint_id}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        title="Update message while keeping In Progress"
                      >
                        Update Note Only
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCloseReview}
                          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-white rounded-xl transition-colors cursor-pointer"
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === selectedComplaint.complaint_id}
                          onClick={() => handleSaveStatus('Resolved')}
                          className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{updatingId === selectedComplaint.complaint_id ? 'Resolving & Notifying...' : 'Send Direct to Citizen & Mark Resolved'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resolved State -> Case Closed */}
                {selectedComplaint.status === 'Resolved' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                        <span>Case Resolved &amp; Closed</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Official Closure
                      </span>
                    </div>

                    {selectedComplaint.remarks ? (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-800">
                        <span className="font-bold text-slate-500 text-[10px] uppercase block mb-1">
                          Officer Resolution Note:
                        </span>
                        <p className="leading-relaxed">{selectedComplaint.remarks}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No resolution remarks were added.</p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        disabled={updatingId === selectedComplaint.complaint_id}
                        onClick={() => handleSaveStatus('In Progress')}
                        className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 underline cursor-pointer"
                      >
                        Re-open case to In Progress
                      </button>

                      <button
                        type="button"
                        onClick={handleCloseReview}
                        className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                      >
                        Close Window
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
