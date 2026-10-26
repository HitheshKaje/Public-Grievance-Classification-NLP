import React, { useState } from 'react';
import { 
  FileText, ArrowRight, Search, Copy, Check, Plus, 
  Loader2, Trash2, AlertTriangle, X 
} from 'lucide-react';
import { deleteComplaint } from '../../services/complaintService';
import { useLanguage } from '../../context/LanguageContext';

export default function UserRecentComplaintsCard({
  complaints = [],
  loading = false,
  onViewAll,
  onTrack,
  onSubmitNew,
  onComplaintDeleted
}) {
  const { t } = useLanguage();
  const [copiedId, setCopiedId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: '' });
  const [deleting, setDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleCopyId = async (id, e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
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

  const openDeleteDialog = (complaint, e) => {
    e.stopPropagation();
    const id = complaint.complaint_id || complaint.id;
    setDeleteModal({
      open: true,
      id: id,
      title: complaint.title || complaint.text || 'Grievance Petition'
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try {
      await deleteComplaint(deleteModal.id);
      setToastMsg(`Complaint #${deleteModal.id} was successfully deleted.`);
      setDeleteModal({ open: false, id: null, title: '' });
      if (onComplaintDeleted) {
        onComplaintDeleted(deleteModal.id);
      }
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to delete complaint.');
    } finally {
      setDeleting(false);
    }
  };

  const renderStatusBadge = (status) => {
    const s = (status || 'Pending').toLowerCase();
    if (s.includes('progress') || s.includes('process')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span>In Processing</span>
        </span>
      );
    }
    if (s.includes('resolve')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Resolved</span>
        </span>
      );
    }
    if (s.includes('reject')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>Rejected</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        <span>Pending Review</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] flex flex-col justify-between relative">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between animate-in fade-in duration-200">
          <span>{toastMsg}</span>
          <button type="button" onClick={() => setToastMsg('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            {t('recent_grievances', 'Recent Grievances')}
          </h2>
          {complaints.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
              {complaints.length}
            </span>
          )}
        </div>

        {onViewAll && complaints.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{t('view_all', 'View All')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Table Structure */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#f4f7fb] text-slate-700 font-semibold border-b border-slate-100">
              <th className="py-2.5 px-4 font-semibold">ID</th>
              <th className="py-2.5 px-4 font-semibold">{t('submit', 'Complaint')}</th>
              <th className="py-2.5 px-4 font-semibold">{t('civic_departments', 'Department')}</th>
              <th className="py-2.5 px-4 font-semibold">Date</th>
              <th className="py-2.5 px-4 font-semibold">Status</th>
              <th className="py-2.5 px-4 font-semibold text-center">{t('delete', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                    <span className="text-xs font-medium">Loading complaints...</span>
                  </div>
                </td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <FileText className="h-5 w-5 stroke-[1.5]" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {t('no_complaints_found', 'No complaints yet')}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs mx-auto">
                      {t('no_complaints_desc', 'Whenever you submit a grievance, it will appear here with live tracking.')}
                    </p>
                    {onSubmitNew && (
                      <button
                        type="button"
                        onClick={onSubmitNew}
                        className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Submit a Grievance</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              complaints.map((c) => {
                const id = c.complaint_id || c.id;
                const dept = c.assigned_department || c.department;
                const isCopied = copiedId === id;

                return (
                  <tr
                    key={id}
                    className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors"
                  >
                    {/* ID */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900">{id}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(id, e)}
                          title="Copy ID"
                          className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Complaint Title & Details */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate" title={c.title || c.text}>
                        {c.title || c.text || 'Grievance Petition'}
                      </div>
                      {c.location && (
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          📍 {c.location}
                        </div>
                      )}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {dept ? (
                        <span className="font-medium text-slate-700">{dept}</span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Triage Pending
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(c.created_at)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderStatusBadge(c.status)}
                    </td>

                    {/* Action Column: Track and Delete Options */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {onTrack && (
                          <button
                            type="button"
                            onClick={() => onTrack(id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100 border border-blue-200/50 transition-colors cursor-pointer"
                            title="Track live status"
                          >
                            <Search className="h-3 w-3" />
                            <span>Track</span>
                          </button>
                        )}

                        {/* Delete Complaint Option */}
                        <button
                          type="button"
                          onClick={(e) => openDeleteDialog(c, e)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50/70 hover:bg-red-100 border border-red-200/50 transition-colors cursor-pointer"
                          title="Delete this complaint"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal for Deleting Complaint */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 flex-shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  {t('delete_confirm_title', 'Delete Grievance Petition?')}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {t('delete_confirm_desc', 'This complaint will be permanently removed from MongoDB and your dashboard.')} <strong className="text-slate-800 font-mono">#{deleteModal.id}</strong>
                </p>
                <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 truncate font-medium">
                  "{deleteModal.title}"
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModal({ open: false, id: null, title: '' })}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{t('deleting', 'Deleting...')}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{t('confirm_delete', 'Yes, Delete')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
