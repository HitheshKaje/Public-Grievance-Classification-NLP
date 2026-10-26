import React, { useState, useEffect } from 'react';
import { 
  X, Send, FileText, CheckCircle2, Building2, User, 
  MapPin, Clock, AlertTriangle, ShieldCheck, Printer, 
  ExternalLink, Calendar, ChevronRight, Sparkles, Image,
  Mic, Paperclip, Download, Eye, FileDown
} from 'lucide-react';
import { forwardComplaintWithWorkOrder, extractComplaintAI } from '../../services/complaintService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BACKEND_URL = API_BASE_URL.replace('/api', '');

export default function ComplaintWorkOrderModal({
  complaint,
  officers = [],
  onClose,
  onForwardSuccess,
  onOpenAddOfficer
}) {
  const [activeTab, setActiveTab] = useState(complaint?.initialTab || 'parameters'); // 'parameters' | 'pdf_preview'
  const [department, setDepartment] = useState(
    complaint.assigned_department || complaint.department || 'Water Supply Department'
  );
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [priority, setPriority] = useState(complaint.work_order?.priority || 'Normal');
  const [deadline, setDeadline] = useState(complaint.work_order?.resolution_deadline || '72 hours');
  const [directives, setDirectives] = useState(complaint.work_order?.action_directives || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtractingAi, setIsExtractingAi] = useState(false);
  const [aiNotice, setAiNotice] = useState(null);
  const [error, setError] = useState(null);
  const [dispatchedOrder, setDispatchedOrder] = useState(complaint.work_order || null);

  const handleAiExtraction = async () => {
    setIsExtractingAi(true);
    setAiNotice(null);
    setError(null);
    try {
      const res = await extractComplaintAI(complaint.complaint_id);
      if (res.success && res.extracted) {
        const ext = res.extracted;
        if (ext.detected_department) {
          setDepartment(ext.detected_department);
        }
        if (ext.priority) {
          setPriority(ext.priority);
        }
        if (ext.directives) {
          setDirectives(ext.directives);
        }
        setAiNotice("Successfully analyzed media & extracted directives via Gemini AI!");
        setTimeout(() => setAiNotice(null), 5000);
      } else {
        setError(res.error || res.message || "Failed to extract with Gemini AI.");
      }
    } catch (err) {
      setError(err.message || "Gemini extraction request failed.");
    } finally {
      setIsExtractingAi(false);
    }
  };

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
      const match = dispatchedOrder?.officer_id 
        ? departmentOfficers.find(o => o.officer_id === dispatchedOrder.officer_id)
        : null;
      setSelectedOfficerId(match ? match.officer_id : departmentOfficers[0].officer_id);
    }
  }, [department, departmentOfficers, selectedOfficerId, dispatchedOrder]);

  useEffect(() => {
    if (!directives && complaint) {
      const loc = complaint.location || 'the reported incident area';
      setDirectives(
        `1. Depute an authorized nodal inspection team immediately to inspect ${loc}.\n` +
        `2. Assess technical scope of the grievance titled "${complaint.title}".\n` +
        `3. Execute required maintenance and civil/technical rectifications.\n` +
        `4. Upload geotagged compliance certificate upon completion.`
      );
    }
  }, [complaint, directives]);

  // Extract attached files
  const fileReferences = complaint.file_references || [];
  const imageFiles = fileReferences.filter(f => 
    (f.content_type && f.content_type.startsWith('image')) ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(f.filename || f.path || '')
  );
  const audioFiles = fileReferences.filter(f => 
    (f.content_type && f.content_type.startsWith('audio')) ||
    /\.(mp3|webm|wav|ogg|m4a)$/i.test(f.filename || f.path || '')
  );
  const pdfFiles = fileReferences.filter(f => 
    (f.content_type && f.content_type.includes('pdf')) ||
    /\.pdf$/i.test(f.filename || f.path || '')
  );

  const getMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${BACKEND_URL}${path}`;
  };

  const handleDispatch = async (e) => {
    if (e) e.preventDefault();
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
      // Automatically switch to the official structured PDF document preview after dispatch
      setActiveTab('pdf_preview');
    } catch (err) {
      setError(err.message || 'Failed to dispatch work order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedOfficer = officers.find((o) => o.officer_id === selectedOfficerId);
  const officerName = selectedOfficer ? selectedOfficer.name : (dispatchedOrder?.assigned_officer || 'Departmental Nodal Officer');
  const officerDesignation = selectedOfficer?.designation || 'Nodal Executive Officer';
  const workOrderId = dispatchedOrder?.work_order_id || `PGMS-WO-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-PENDING`;

  const getMethodBadge = (method) => {
    switch (method) {
      case 'voice':
        return { label: 'Voice Recording', icon: Mic, color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'image':
        return { label: 'Photo Evidence', icon: Image, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'pdf':
        return { label: 'PDF Document Upload', icon: FileText, color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'Citizen Web Portal', icon: FileText, color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  };

  const methodInfo = getMethodBadge(complaint.method);
  const MethodIcon = methodInfo.icon;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header with Navigation Tabs */}
        <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 flex-shrink-0 no-print">
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
                <span className="font-mono text-blue-400 text-xs px-2.5 py-0.5 rounded-full bg-blue-900/60 border border-blue-500/30">
                  {complaint.complaint_id}
                </span>
              </h2>
            </div>
          </div>

          {/* Tab Switcher & Close */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-800/80 p-1 rounded-xl flex items-center gap-1 border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('parameters')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'parameters'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Routing & Directives
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pdf_preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'pdf_preview'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Printer className="h-3.5 w-3.5" />
                <span>2. Official PDF Document</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 no-print">
              <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner if already dispatched (parameters tab only) */}
          {dispatchedOrder && activeTab === 'parameters' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 no-print">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Official Work Order Sealed & Dispatched</span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                  {dispatchedOrder.work_order_id}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                The grievance has been converted to an official government work order and forwarded to <strong>{dispatchedOrder.assigned_officer}</strong> ({dispatchedOrder.assigned_department}).
              </p>
            </div>
          )}

          {/* TAB 1: PARAMETERS & DIRECTIVES */}
          {activeTab === 'parameters' && (
            <div className="space-y-6">
              {/* Multimodal Citizen Ingestion Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Citizen Grievance Ingestion Summary
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${methodInfo.color}`}>
                    <MethodIcon className="h-3 w-3" />
                    <span>Inflow Channel: {methodInfo.label}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Title</span>
                    <p className="font-bold text-slate-800 text-sm">{complaint.title}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Incident Location</span>
                    <p className="font-semibold text-slate-700 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                      <span>{complaint.location || 'Unspecified Location'}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Complainant Details</span>
                    <p className="font-medium text-slate-700">
                      {complaint.citizen_name || 'Citizen Petitioner'} {complaint.phone ? `• ${complaint.phone}` : ''}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Filing Timestamp</span>
                    <p className="font-medium text-slate-700">
                      {complaint.created_at ? new Date(complaint.created_at).toLocaleString('en-IN') : 'Recent'}
                    </p>
                  </div>
                </div>

                {/* Citizen Statement / Transcript & Language Translation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 block text-[10px]">
                      {complaint.method === 'voice' ? 'Transcribed Voice Statement' : 'Citizen Grievance Statement'}
                    </span>
                    {complaint.detected_language && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-800 border border-violet-200">
                        Language: {complaint.detected_language}
                      </span>
                    )}
                  </div>

                  {/* If original statement was non-English (Hindi or Kannada) */}
                  {(complaint.original_language_text || complaint.original_description) && 
                   complaint.detected_language && complaint.detected_language !== 'English' && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 italic space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 not-italic block">
                        Original Citizen Words ({complaint.detected_language})
                      </span>
                      <p>"{complaint.original_language_text || complaint.original_description}"</p>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap text-xs space-y-1">
                    {complaint.detected_language && complaint.detected_language !== 'English' && (
                      <span className="text-[10px] uppercase font-bold text-violet-600 block">
                        Official English Sentence Translation
                      </span>
                    )}
                    <p>{complaint.english_translation || complaint.description || complaint.text || 'No description entered.'}</p>
                  </div>
                </div>

                {/* MULTIMODAL ATTACHMENTS & EVIDENCE VIEWER */}
                {fileReferences.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/80 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-blue-600" />
                      <span>Attached Evidence Files ({fileReferences.length})</span>
                    </span>

                    {/* Audio Player for Voice Grievance */}
                    {audioFiles.map((file, idx) => (
                      <div key={idx} className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-purple-900 font-semibold text-xs">
                          <span className="flex items-center gap-1.5">
                            <Mic className="h-4 w-4 text-purple-600" />
                            <span>Voice Grievance Recording ({file.filename})</span>
                          </span>
                          <a
                            href={getMediaUrl(file.path)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-purple-600 hover:text-purple-800 text-[11px] flex items-center gap-1 underline"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download Audio</span>
                          </a>
                        </div>
                        <audio controls className="w-full h-8 pt-1" src={getMediaUrl(file.path)}>
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                    ))}

                    {/* Image Previews for Photo Evidence */}
                    {imageFiles.map((file, idx) => (
                      <div key={idx} className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-emerald-950 font-semibold text-xs">
                          <span className="flex items-center gap-1.5">
                            <Image className="h-4 w-4 text-emerald-600" />
                            <span>Photographic Field Evidence ({file.filename})</span>
                          </span>
                          <a
                            href={getMediaUrl(file.path)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 hover:text-emerald-900 text-[11px] flex items-center gap-1 underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Open Full Image</span>
                          </a>
                        </div>
                        <div className="h-44 rounded-lg overflow-hidden border border-emerald-200 bg-slate-900/5 flex items-center justify-center">
                          <img
                            src={getMediaUrl(file.path)}
                            alt="Grievance Evidence"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      </div>
                    ))}

                    {/* PDF Document Previews */}
                    {pdfFiles.map((file, idx) => (
                      <div key={idx} className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-950 font-semibold text-xs">
                          <FileText className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <div>
                            <span className="block truncate max-w-sm">{file.filename}</span>
                            <span className="text-[10px] text-amber-700 font-normal">
                              Citizen Petition PDF Attachment &bull; {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                        <a
                          href={getMediaUrl(file.path)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View PDF</span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Work Order Structuring Form */}
              <form onSubmit={handleDispatch} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    <span>Formal Work Order Structure & Routing Parameters</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAiExtraction}
                      disabled={isExtractingAi}
                      className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      title="Analyze voice recording, images, or petition with Gemini to auto-fill department and directives"
                    >
                      <Sparkles className={`h-3.5 w-3.5 ${isExtractingAi ? 'animate-spin' : ''}`} />
                      <span>{isExtractingAi ? 'AI Extracting...' : '✨ AI Auto-Extract & Fill'}</span>
                    </button>
                    {onOpenAddOfficer && (
                      <button
                        type="button"
                        onClick={onOpenAddOfficer}
                        className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold underline cursor-pointer"
                      >
                        + Add Officer
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Extraction Success Notification Banner */}
                {aiNotice && (
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">{aiNotice}</span>
                  </div>
                )}

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
                        <option value="">No officers listed (will assign to Nodal Desk)</option>
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
                      <option value="48 hours">48 Hours</option>
                      <option value="72 hours">72 Hours (Standard SLA)</option>
                      <option value="7 days">7 Days (Civil Infrastructure Works)</option>
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

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('pdf_preview')}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5 text-blue-600" />
                    <span>Preview Formal PDF Document</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
                    >
                      Close
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#1e6bf3] hover:bg-blue-700 text-white rounded-xl px-6 py-2 flex items-center gap-2 font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>{dispatchedOrder ? 'Re-Dispatch to Officer' : 'Convert & Dispatch to Officer'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: CLEAN STRUCTURED WORK ORDER DOCUMENT PREVIEW */}
          {activeTab === 'pdf_preview' && (
            <div className="space-y-4">
              {/* Action Toolbar above Document */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl no-print">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-xs">Work Order Preview</span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                    {workOrderId}
                  </span>
                  {dispatchedOrder && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      Dispatched
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print / Save as PDF</span>
                  </button>

                  {!dispatchedOrder && (
                    <button
                      type="button"
                      onClick={handleDispatch}
                      disabled={isSubmitting}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Dispatch to Officer</span>
                    </button>
                  )}
                </div>
              </div>

              {/* CLEAN STRUCTURED WORK ORDER DOCUMENT */}
              <div 
                id="printable-work-order" 
                className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-slate-800 max-w-3xl mx-auto space-y-6"
              >
                {/* Clean Header */}
                <div className="border-b border-slate-200 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Public Grievance Management System
                      </p>
                      <h1 className="text-lg font-bold text-slate-900 mt-0.5">
                        Grievance Work Order
                      </h1>
                    </div>
                    <div className="text-right text-[11px] text-slate-500">
                      <p className="font-mono font-semibold text-slate-900">{workOrderId}</p>
                      <p className="mt-0.5">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>

                  {/* Clean 4-Column Summary Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Complaint ID</span>
                      <span className="font-mono font-semibold text-slate-800">{complaint.complaint_id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Submission Channel</span>
                      <span className="font-medium text-slate-800">{methodInfo.label}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Priority</span>
                      <span className="font-semibold text-slate-800">{priority}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Resolution Deadline</span>
                      <span className="font-medium text-slate-800">{deadline}</span>
                    </div>
                  </div>
                </div>

                {/* Section 1: Grievance Details */}
                <div className="space-y-3">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-1">
                    Grievance Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Complainant</span>
                      <p className="font-medium text-slate-800">{complaint.citizen_name || 'Anonymous'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Contact</span>
                      <p className="font-medium text-slate-800">{complaint.phone || complaint.email || 'N/A'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block text-[10px]">Incident Location</span>
                      <p className="font-medium text-slate-800">{complaint.location || 'Reported Jurisdiction'}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-slate-400 block text-[10px]">Subject</span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{complaint.title}</p>
                    <span className="text-slate-400 block text-[10px] mt-2">Citizen Statement</span>
                    <p className="text-xs text-slate-700 leading-relaxed mt-0.5 whitespace-pre-wrap">
                      {complaint.description || complaint.text}
                    </p>
                  </div>
                </div>

                {/* Attached Photographic Evidence if present */}
                {imageFiles.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-1">
                      Attached Photographic Evidence
                    </h2>
                    <div className="flex items-center gap-3 border border-slate-200 rounded-lg p-2.5">
                      <div className="h-20 w-28 rounded overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                        <img 
                          src={getMediaUrl(imageFiles[0].path)} 
                          alt="Field Evidence" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-slate-800">{imageFiles[0].filename}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Photographic evidence attached with citizen petition.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 2: Department Assignment */}
                <div className="space-y-3 pt-1">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-1">
                    Department Assignment
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Assigned Department</span>
                      <p className="font-semibold text-slate-900">{department}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Designated Officer</span>
                      <p className="font-semibold text-slate-900">{officerName} <span className="font-normal text-slate-500">({officerDesignation})</span></p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Action Directives */}
                <div className="space-y-2 pt-1">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-1">
                    Action Directives
                  </h2>
                  <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed space-y-1">
                    {directives}
                  </div>
                </div>

                {/* Clean Footer Sign-off */}
                <div className="pt-8 mt-6 border-t border-slate-200 flex items-end justify-between text-[11px] text-slate-500">
                  <div>
                    <p className="font-medium text-slate-700">Public Grievance Management System</p>
                    <p className="text-[10px] text-slate-400">Automated Dispatch & Redressal Tracking</p>
                  </div>
                  <div className="text-right">
                    <div className="border-b border-slate-300 w-36 mb-1 ml-auto"></div>
                    <p className="font-semibold text-slate-800">Authorized Nodal Officer</p>
                    <p className="text-[10px] text-slate-400">{department}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
