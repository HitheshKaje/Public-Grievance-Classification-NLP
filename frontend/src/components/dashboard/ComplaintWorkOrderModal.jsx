import React, { useState, useEffect } from 'react';
import { 
  X, Send, FileText, CheckCircle2, Building2, User, 
  MapPin, Clock, AlertTriangle, ShieldCheck, Printer, 
  ExternalLink, Calendar, ChevronRight, Sparkles
} from 'lucide-react';
import { forwardComplaintWithWorkOrder } from '../../services/complaintService';

export default function ComplaintWorkOrderModal({
  complaint,
  officers = [],
  onClose,
  onForwardSuccess,
  onOpenAddOfficer
}) {
  const [department, setDepartment] = useState(
    complaint.assigned_department || complaint.department || 'Water Supply Department'
  );
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [deadline, setDeadline] = useState('48 hours');
  const [directives, setDirectives] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [dispatchedOrder, setDispatchedOrder] = useState(complaint.work_order || null);

  const departmentsList = [
    'Water Supply Department',
    'Public Works Department',
    'Health & Sanitation Department',
    'Power & Electricity Board',
    'Municipal Lighting Division',
    'Department of Public Instruction',
    'Solid Waste Management',
    'General Civic Administration'
  ];

  // Filter officers matching selected department
  const departmentOfficers = officers.filter(
    (o) => !department || o.department.toLowerCase() === department.toLowerCase()
  );

  // Set default directives and default officer when department changes
  useEffect(() => {
    if (departmentOfficers.length > 0 && !selectedOfficerId) {
      setSelectedOfficerId(departmentOfficers[0].officer_id);
    }
  }, [department, departmentOfficers, selectedOfficerId]);

  useEffect(() => {
    if (!directives && complaint) {
      const loc = complaint.location || 'the reported area';
      setDirectives(
        `1. Depute an authorized nodal inspection team immediately to inspect ${loc}.\n` +
        `2. Assess technical scope of the grievance titled "${complaint.title}".\n` +
        `3. Execute required maintenance and civil/technical rectifications.\n` +
        `4. Upload geotagged compliance certificate upon completion.`
      );
    }
  }, [complaint, directives]);

  const handleDispatch = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const selectedOfficer = officers.find((o) => o.officer_id === selectedOfficerId);
    const officerName = selectedOfficer ? selectedOfficer.name : 'Departmental Nodal Officer';

    try {
      const result = await forwardComplaintWithWorkOrder(complaint.complaint_id || complaint.id, {
        department,
        officer_name: officerName,
        officer_id: selectedOfficerId,
        priority,
        directives,
        deadline
      });

      setDispatchedOrder(result.work_order);
      if (onForwardSuccess) {
        onForwardSuccess(result.complaint);
      }
    } catch (err) {
      setError(err.message || 'Failed to dispatch work order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Official Redressal Dispatch Center
              </span>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Structure & Dispatch Work Order</span>
                <span className="font-mono text-blue-400 text-xs px-2 py-0.5 rounded-full bg-blue-900/60 border border-blue-500/30">
                  {complaint.complaint_id}
                </span>
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {dispatchedOrder && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Work Order Generated & Dispatched to {dispatchedOrder.assigned_department}</span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                  {dispatchedOrder.work_order_id}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                The grievance has been converted to an official government work order and forwarded to {dispatchedOrder.assigned_officer}. 
                Status updated to <strong>In Progress</strong> in MongoDB.
              </p>
            </div>
          )}

          {/* Section 1: Ingested Citizen Complaint Data */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Citizen Grievance Ingestion Summary
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px]">Title</span>
                <p className="font-bold text-slate-800">{complaint.title}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Location</span>
                <p className="font-semibold text-slate-700 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                  <span>{complaint.location || 'Unspecified'}</span>
                </p>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Citizen Contact</span>
                <p className="font-medium text-slate-700">
                  {complaint.citizen_name || 'Anonymous Citizen'} {complaint.phone ? `(${complaint.phone})` : ''}
                </p>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Filing Channel & Timestamp</span>
                <p className="font-medium text-slate-700">
                  <span className="capitalize">{complaint.method || 'Portal'}</span> &bull; {complaint.created_at ? new Date(complaint.created_at).toLocaleString('en-IN') : 'Recent'}
                </p>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] mb-1">Citizen Statement</span>
              <p className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {complaint.description || complaint.text}
              </p>
            </div>
          </div>

          {/* Section 2: Work Order Formal Document Structure Form */}
          <form onSubmit={handleDispatch} className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Formal Work Order Structure & Routing Parameters</span>
              </span>
              {onOpenAddOfficer && (
                <button
                  type="button"
                  onClick={onOpenAddOfficer}
                  className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold underline cursor-pointer"
                >
                  + Add New Officer to Directory
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Department */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Assigned Department *
                </label>
                <select
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    setSelectedOfficerId('');
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                >
                  {departmentsList.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Assigned Officer */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Assigned Nodal Officer *
                </label>
                <select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                >
                  {departmentOfficers.length === 0 ? (
                    <option value="">No officers listed for this dept (will assign to Nodal Desk)</option>
                  ) : (
                    departmentOfficers.map((off) => (
                      <option key={off.officer_id} value={off.officer_id}>
                        {off.name} ({off.designation || 'Officer'}) - {off.officer_id}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Urgency / Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="Normal">Normal Priority (Standard SLA)</option>
                  <option value="High">High Priority (Expedited)</option>
                  <option value="Urgent">Urgent / Safety Critical</option>
                  <option value="Emergency">Disaster / Emergency</option>
                </select>
              </div>

              {/* Resolution Deadline */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Mandated SLA Deadline
                </label>
                <select
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="24 hours">24 Hours (Immediate Action)</option>
                  <option value="48 hours">48 Hours (Standard SLA)</option>
                  <option value="72 hours">72 Hours</option>
                  <option value="7 days">7 Days (Comprehensive Civil Works)</option>
                </select>
              </div>
            </div>

            {/* Action Directives / Engineering Instructions */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Executive Action Directives (Official Document Body) *
              </label>
              <textarea
                rows={4}
                value={directives}
                onChange={(e) => setDirectives(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed font-mono text-[11px]"
                placeholder="Enter specific actionable directives for the nodal officer..."
              />
            </div>

            {/* Legal Stamp Notice */}
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/80 text-[11px] text-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span>Authorized by Public Grievance Redressal Administration &bull; Tamper-evident MongoDB record</span>
              </div>
              <span className="font-mono text-[10px] text-blue-700 font-bold">DOC-STRUCT-v2.1</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              {dispatchedOrder && (
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Formal Order</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#1e6bf3] hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 flex items-center gap-2 font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>{dispatchedOrder ? 'Re-Dispatch Work Order' : 'Convert & Dispatch to Officer'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
