// src/components/complaints/ComplaintDetailModal.jsx
import React, { useState } from 'react';
import {
  X,
  Building,
  Calendar,
  User,
  MapPin,
  Sparkles,
  ShieldAlert,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { CategoryBadge, StatusBadge, ConfidenceBadge } from '../common/Badge';

export default function ComplaintDetailModal({ complaint, isOpen, onClose, onStatusChange }) {
  const [currentStatus, setCurrentStatus] = useState(complaint?.status || 'Pending');

  if (!isOpen || !complaint) return null;

  const handleUpdateStatus = (newStatus) => {
    setCurrentStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(complaint.id, newStatus);
    }
  };

  const confidencePct = Math.round(complaint.confidence * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
          
          {/* Modal Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-xs">
                {complaint.id}
              </span>
              <StatusBadge status={currentStatus} />
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Complaint Text Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Citizen Grievance Description
              </h3>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-sm leading-relaxed">
                <p className="font-semibold text-slate-900 mb-1">{complaint.text}</p>
                {complaint.details && complaint.details !== complaint.text && (
                  <p className="text-slate-600 mt-2 pt-2 border-t border-slate-200/70 text-xs">
                    {complaint.details}
                  </p>
                )}
              </div>
            </div>

            {/* AI Classification Details */}
            <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                    NLP AI Classification Audit
                  </span>
                </div>
                <span className="text-[11px] font-medium text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                  Automated Triage
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-white p-3 rounded-lg border border-blue-100/80">
                  <span className="text-[11px] text-slate-500 font-medium">Predicted Category</span>
                  <div className="mt-1 flex items-center gap-2">
                    <CategoryBadge category={complaint.category} />
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-blue-100/80">
                  <span className="text-[11px] text-slate-500 font-medium">Model Confidence</span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {confidencePct}%
                    </span>
                    <ConfidenceBadge confidence={complaint.confidence} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-blue-100/80 flex items-center gap-2 text-xs text-slate-700">
                <Building className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  Designated Department: <strong>{complaint.department || 'Public Works'}</strong>
                </span>
              </div>
            </div>

            {/* Citizen & Location Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Citizen ID</span>
                </div>
                <span className="font-mono font-medium text-slate-800">
                  {complaint.citizenId || 'CIT-Anonymous'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Submission Date</span>
                </div>
                <span className="font-medium text-slate-800">{complaint.date}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Ward / Zone</span>
                </div>
                <span className="font-medium text-slate-800 truncate block">
                  {complaint.ward || 'Central Municipal Zone'}
                </span>
              </div>
            </div>

            {/* Status Workflow Action */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Update Grievance Status
              </span>
              <div className="flex flex-wrap gap-2">
                {['Pending', 'Under Review', 'In Progress', 'Resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      currentStatus === st
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Audit log recorded automatically
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
