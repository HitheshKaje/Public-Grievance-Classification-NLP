import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, Clock, CheckCircle2, AlertTriangle, RefreshCw,
  Headphones, Phone, PhoneCall, Mail, Send, ShieldCheck, MapPin, HelpCircle,
  User, Building2, Calendar, Copy, Check, ExternalLink, BarChart3, Award, Info
} from 'lucide-react';
import OfficerStatCard from '../components/officer/OfficerStatCard';
import OfficerAssignedComplaintsCard from '../components/officer/OfficerAssignedComplaintsCard';
import DepartmentInfoCard from '../components/officer/DepartmentInfoCard';
import OfficerQuickActionsCard from '../components/officer/OfficerQuickActionsCard';
import OfficerRecentUpdatesCard from '../components/officer/OfficerRecentUpdatesCard';
import OfficerWorkloadCard from '../components/officer/OfficerWorkloadCard';
import EmptyState from '../components/common/EmptyState';
import { 
  fetchOfficerStats, 
  fetchComplaints, 
  updateComplaintStatus 
} from '../services/complaintService';

export default function OfficerDashboard({ 
  activeTab = 'dashboard', 
  onNavigateTab, 
  departmentName = "General Administration",
  currentUser
}) {
  const [stats, setStats] = useState({
    total_assigned: 0,
    department_count: 0,
    in_progress: 0,
    resolved: 0,
    overdue: 0,
    pending: 0,
    recent_updates: []
  });

  const [complaints, setComplaints] = useState([]);
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [search, setSearch] = useState('');
  
  // Status filter (respecting activeTab if navigated from sidebar)
  const initialStatusFilter = activeTab === 'in_progress' 
    ? 'In Progress' 
    : activeTab === 'resolved' 
    ? 'Resolved' 
    : 'All';
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const effectiveDept = currentUser?.department || departmentName || 'All';
  const [departmentFilter, setDepartmentFilter] = useState(effectiveDept);
  const [copiedField, setCopiedField] = useState(null);

  // Sync statusFilter when activeTab changes
  useEffect(() => {
    if (activeTab === 'in_progress') {
      setStatusFilter('In Progress');
    } else if (activeTab === 'resolved') {
      setStatusFilter('Resolved');
    } else if (activeTab === 'assigned') {
      setStatusFilter('All');
    }
  }, [activeTab]);

  // Fetch stats from MongoDB
  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await fetchOfficerStats(effectiveDept);
      setStats(data);
    } catch (err) {
      console.error('Failed to load officer stats from MongoDB:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [effectiveDept]);

  // Fetch complaints list from MongoDB
  const loadComplaints = useCallback(async () => {
    setLoadingComplaints(true);
    try {
      const data = await fetchComplaints({
        search,
        status: statusFilter,
        department: departmentFilter,
        page: 1,
        limit: 15
      });
      setComplaints(data.complaints || []);
      setTotalComplaints(data.total || 0);
    } catch (err) {
      console.error('Failed to load complaints from MongoDB:', err);
    } finally {
      setLoadingComplaints(false);
    }
  }, [search, statusFilter, departmentFilter]);

  // Load on mount and dependencies change
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadComplaints();
    }, 250); // debounce search
    return () => clearTimeout(timer);
  }, [loadComplaints]);

  // Handle status update
  const handleUpdateStatus = async (complaintId, newStatus, remarks = '') => {
    try {
      await updateComplaintStatus(complaintId, newStatus, remarks);
      // Immediately refresh list & stats
      await Promise.all([loadComplaints(), loadStats()]);
    } catch (err) {
      console.error('Failed to update complaint status in MongoDB:', err);
      alert(`Error updating complaint: ${err.message}`);
    }
  };

  // Handle Quick Actions
  const handleQuickAction = (actionId) => {
    if (actionId === 'view_assigned') {
      setStatusFilter('All');
      if (onNavigateTab && activeTab !== 'assigned') onNavigateTab('assigned');
    } else if (actionId === 'update_status') {
      setStatusFilter('Pending');
      if (onNavigateTab && activeTab !== 'assigned') onNavigateTab('assigned');
    } else if (actionId === 'mark_resolved') {
      setStatusFilter('In Progress');
      if (onNavigateTab && activeTab !== 'assigned') onNavigateTab('assigned');
    } else if (actionId === 'add_remarks') {
      if (onNavigateTab && activeTab !== 'assigned') onNavigateTab('assigned');
    }
  };

  // If sub-view is selected from sidebar:
  if (['assigned', 'in_progress', 'resolved'].includes(activeTab)) {
    const titles = {
      assigned: 'Assigned Departmental Grievances',
      in_progress: 'In Progress Review Queue',
      resolved: 'Resolved Grievances Registry'
    };
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">{titles[activeTab]}</h2>
            <p className="text-xs text-slate-500 mt-1">
              Live grievances in {effectiveDept} connected to MongoDB.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { loadComplaints(); loadStats(); }}
            className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingComplaints ? 'animate-spin' : ''}`} />
            <span>Sync MongoDB</span>
          </button>
        </div>

        <OfficerAssignedComplaintsCard 
          complaints={complaints}
          total={totalComplaints}
          loading={loadingComplaints}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={setDepartmentFilter}
          onUpdateStatus={handleUpdateStatus}
          onRefresh={() => { loadComplaints(); loadStats(); }}
          departmentName={effectiveDept}
        />
      </div>
    );
  }

  if (activeTab === 'support') {
    return (
      <div className="space-y-6">
        {/* Support Header Banner */}
        <div className="bg-gradient-to-r from-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 border border-white/25">
              Officer Help Desk & Escalation Matrix
            </span>
            <h1 className="text-2xl font-bold mt-2">Departmental Administrator Support</h1>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed">
              Direct access to designated system administrators for complaint re-routing, SLA extension requests, and technical escalation.
            </p>
          </div>
        </div>

        {/* Two Admins Section: Ranjith Gowda & Hithesh Gowda */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Headphones className="h-4.5 w-4.5 text-blue-600" />
                  <span>Central System Administrators</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Designated authorities for nodal officer assistance and system configuration.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
                2 Designated Admins
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Admin 1: Ranjith Gowda */}
              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-[#0a1835] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      RG
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        System Administrator
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">Ranjith Gowda</h3>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Central Grievance Administration & Nodal Triage
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200/70 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                      <Phone className="h-3 w-3 text-blue-600" />
                      <span>Phone:</span>
                    </span>
                    <a 
                      href="tel:8861731029" 
                      className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      title="Call Ranjith Gowda"
                    >
                      <span>8861731029</span>
                      <PhoneCall className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                      <Mail className="h-3 w-3 text-rose-500" />
                      <span>Gmail:</span>
                    </span>
                    <a 
                      href="mailto:ranjithgowda@gmail.com?subject=Officer%20Support%20Request%20-%20PGMS" 
                      className="font-mono text-[11px] font-semibold text-slate-800 hover:text-blue-600 hover:underline flex items-center gap-1 truncate max-w-[170px]"
                      title="Email Ranjith Gowda"
                    >
                      <span className="truncate">ranjithgowda@gmail.com</span>
                      <Send className="h-2.5 w-2.5 text-blue-600 flex-shrink-0" />
                    </a>
                  </div>

                  <div className="pt-2 flex gap-1.5">
                    <a 
                      href="tel:8861731029"
                      className="flex-1 py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    >
                      <PhoneCall className="h-3 w-3" />
                      <span>Call Admin</span>
                    </a>
                    <a 
                      href="mailto:ranjithgowda@gmail.com?subject=Officer%20Support%20Request%20-%20PGMS"
                      className="flex-1 py-1 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    >
                      <Mail className="h-3 w-3 text-rose-500" />
                      <span>Send Gmail</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Admin 2: Hithesh Gowda */}
              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-[#0a1835] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      HG
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        System Administrator
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">Hithesh Gowda</h3>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Technical Architecture & Grievance Operations
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200/70 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                      <Phone className="h-3 w-3 text-emerald-600" />
                      <span>Phone:</span>
                    </span>
                    <a 
                      href="tel:8877665544" 
                      className="font-mono font-bold text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-1"
                      title="Call Hithesh Gowda"
                    >
                      <span>8877665544</span>
                      <PhoneCall className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                      <Mail className="h-3 w-3 text-rose-500" />
                      <span>Gmail:</span>
                    </span>
                    <a 
                      href="mailto:hitheshgowda@gmail.com?subject=Officer%20Support%20Request%20-%20PGMS" 
                      className="font-mono text-[11px] font-semibold text-slate-800 hover:text-emerald-600 hover:underline flex items-center gap-1 truncate max-w-[170px]"
                      title="Email Hithesh Gowda"
                    >
                      <span className="truncate">hitheshgowda@gmail.com</span>
                      <Send className="h-2.5 w-2.5 text-emerald-600 flex-shrink-0" />
                    </a>
                  </div>

                  <div className="pt-2 flex gap-1.5">
                    <a 
                      href="tel:8877665544"
                      className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    >
                      <PhoneCall className="h-3 w-3" />
                      <span>Call Admin</span>
                    </a>
                    <a 
                      href="mailto:hitheshgowda@gmail.com?subject=Officer%20Support%20Request%20-%20PGMS"
                      className="flex-1 py-1 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    >
                      <Mail className="h-3 w-3 text-rose-500" />
                      <span>Send Gmail</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Officer Operating Protocols FAQs */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <span>Officer Standard Operating Procedures</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-800">How to reassign a misclassified complaint?</p>
                <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                  Contact Admin <strong>Ranjith Gowda (8861731029)</strong> or <strong>Hithesh Gowda (8877665544)</strong> with the Complaint Reference ID for immediate department rerouting.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-800">What is the standard SLA for resolution?</p>
                <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                  Emergency / high-priority grievances must receive initial action within 24 hours. Standard civic petitions have a 72-hour closure SLA.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-800">How to mark a grievance as resolved?</p>
                <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                  Click on the complaint card in your Assigned Complaints tab, update the status to <strong>Resolved</strong>, and append resolution action notes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile Tab View
  if (activeTab === 'profile') {
    const handleCopy = (text, field) => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    };

    const getInitials = (name) => {
      if (!name) return 'OF';
      const parts = name.trim().split(' ');
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const officerName = currentUser?.name || "Department Officer";
    const officerId = currentUser?.officer_id || "OFF-DEPT-001";
    const officerEmail = currentUser?.email || "officer@gov.in";
    const officerPhone = currentUser?.phone || "Registered with Admin Command";
    const officerDept = currentUser?.department || effectiveDept;
    const officerDesignation = currentUser?.designation || "Nodal Department Officer";
    const officerZone = currentUser?.zone || "Central Administrative Zone";
    const createdDate = currentUser?.created_at 
      ? new Date(currentUser.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : "Active In MongoDB";

    const resolutionRate = stats.total_assigned > 0 
      ? Math.round((stats.resolved / stats.total_assigned) * 100) 
      : 100;

    return (
      <div className="space-y-6">
        {/* Officer Profile Hero Banner */}
        <div className="bg-gradient-to-r from-[#0a1835] via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-900/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-32 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Avatar */}
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg ring-4 ring-white/10">
                  {getInitials(officerName)}
                </div>
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-[#0a1835] flex items-center justify-center" title="Verified Active Officer">
                  <Check className="h-3 w-3 text-white stroke-[3]" />
                </span>
              </div>

              {/* Title & Badges */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Official Department Officer
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    MongoDB Verified
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {officerName}
                </h1>

                <p className="text-sm font-medium text-blue-200/90 flex flex-wrap items-center gap-2">
                  <span>{officerDesignation}</span>
                  <span className="text-blue-400">•</span>
                  <span>{officerDept}</span>
                </p>
              </div>
            </div>

            {/* Officer ID Copy Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex flex-col items-start sm:items-end gap-1.5 self-start md:self-auto">
              <span className="text-[11px] text-blue-200 font-medium">Official Officer ID</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-white tracking-wider">
                  {officerId}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(officerId, 'officer_id')}
                  className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                  title="Copy Officer ID"
                >
                  {copiedField === 'officer_id' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-blue-200" />
                  )}
                </button>
              </div>
              {copiedField === 'officer_id' && (
                <span className="text-[10px] text-emerald-300 font-semibold animate-in fade-in">
                  Copied to clipboard!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Official Contact & Credentials (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Official Credentials Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <User className="h-4.5 w-4.5 text-blue-600" />
                    <span>Official Roster Credentials</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorized account details provisioned by the Central System Administrator.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Role: Officer
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Email Address */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-blue-600" />
                    <span>Official Login Email</span>
                  </span>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <a 
                      href={`mailto:${officerEmail}`} 
                      className="font-mono font-bold text-slate-900 hover:text-blue-600 truncate max-w-[200px]"
                      title={officerEmail}
                    >
                      {officerEmail}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(officerEmail, 'email')}
                      className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors"
                      title="Copy Email"
                    >
                      {copiedField === 'email' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Official Phone Number</span>
                  </span>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    {officerPhone && officerPhone !== "Registered with Admin Command" ? (
                      <a 
                        href={`tel:${officerPhone}`}
                        className="font-mono font-bold text-slate-900 hover:text-emerald-600"
                      >
                        {officerPhone}
                      </a>
                    ) : (
                      <span className="font-semibold text-slate-600">
                        {officerPhone}
                      </span>
                    )}
                    {officerPhone && officerPhone !== "Registered with Admin Command" && (
                      <button
                        type="button"
                        onClick={() => handleCopy(officerPhone, 'phone')}
                        className="p-1 rounded text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Copy Phone"
                      >
                        {copiedField === 'phone' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Department */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Assigned Department</span>
                  </span>
                  <span className="font-bold text-slate-900 mt-1">
                    {officerDept}
                  </span>
                </div>

                {/* Designation */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-amber-600" />
                    <span>Official Designation</span>
                  </span>
                  <span className="font-bold text-slate-900 mt-1">
                    {officerDesignation}
                  </span>
                </div>

                {/* Zonal Division */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-rose-600" />
                    <span>Jurisdiction / Zone</span>
                  </span>
                  <span className="font-bold text-slate-900 mt-1">
                    {officerZone}
                  </span>
                </div>

                {/* Account Provision Date */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-teal-600" />
                    <span>Onboarding Record</span>
                  </span>
                  <span className="font-bold text-slate-900 mt-1">
                    {createdDate}
                  </span>
                </div>
              </div>

              {/* Administrative Security Note */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 flex items-start gap-3 text-xs">
                <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-slate-700 leading-relaxed text-[11px]">
                  <strong className="text-blue-900 block font-semibold mb-0.5">Central Provisioning Protocol</strong>
                  This nodal officer profile was created directly by the Central Administration. Officers cannot self-register or change departmental jurisdictions. For profile alterations or password resets, contact system administrators <strong>Ranjith Gowda</strong> or <strong>Hithesh Gowda</strong>.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Workload Metrics & Quick Jump (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Operational Metrics Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="h-4.5 w-4.5 text-emerald-600" />
                    <span>Real-Time Case Metrics</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live performance indicators for {officerDept}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { loadStats(); loadComplaints(); }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                  title="Refresh Metrics"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingStats ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100">
                  <span className="text-[11px] font-semibold text-blue-700 block">Total Assigned</span>
                  <span className="text-2xl font-black text-blue-900 font-mono mt-1 block">
                    {stats.total_assigned}
                  </span>
                  <span className="text-[10px] text-blue-500 mt-0.5 block">Department cases</span>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100">
                  <span className="text-[11px] font-semibold text-amber-700 block">In Progress</span>
                  <span className="text-2xl font-black text-amber-900 font-mono mt-1 block">
                    {stats.in_progress}
                  </span>
                  <span className="text-[10px] text-amber-600 mt-0.5 block">Under review</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <span className="text-[11px] font-semibold text-emerald-700 block">Resolved</span>
                  <span className="text-2xl font-black text-emerald-900 font-mono mt-1 block">
                    {stats.resolved}
                  </span>
                  <span className="text-[10px] text-emerald-600 mt-0.5 block">Successfully closed</span>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-100">
                  <span className="text-[11px] font-semibold text-rose-700 block">Overdue Cases</span>
                  <span className="text-2xl font-black text-rose-900 font-mono mt-1 block">
                    {stats.overdue}
                  </span>
                  <span className="text-[10px] text-rose-500 mt-0.5 block">SLA &gt; 72 hours</span>
                </div>
              </div>

              {/* Resolution Rate Bar */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">Resolution Velocity</span>
                  <span className="text-emerald-700 font-bold font-mono">{resolutionRate}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${resolutionRate}%` }}
                  />
                </div>
              </div>

              {/* Quick Jump Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('assigned')}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-between transition-colors shadow-sm cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>View Assigned Grievances</span>
                  </span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('support')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Headphones className="h-4 w-4 text-blue-600" />
                    <span>Contact System Administrators</span>
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reports Tab View
  if (activeTab === 'reports') {
    const resolutionRate = stats.total_assigned > 0 
      ? Math.round((stats.resolved / stats.total_assigned) * 100) 
      : 100;
    const slaCompliance = stats.total_assigned > 0 
      ? Math.max(0, Math.round(((stats.total_assigned - stats.overdue) / stats.total_assigned) * 100)) 
      : 100;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Department Resolution Performance Reports</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Live SLA closure metrics and resolution performance for {effectiveDept}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { loadStats(); loadComplaints(); }}
            className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
            <span>Sync Live MongoDB Stats</span>
          </button>
        </div>

        {/* 4 Performance KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Total Grievances Received</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
              {stats.total_assigned}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Assigned to {effectiveDept}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Resolution Rate</span>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-2">
              {resolutionRate}%
            </div>
            <p className="text-[11px] text-emerald-600/80 mt-1">{stats.resolved} of {stats.total_assigned} cases resolved</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">SLA Compliance</span>
            <div className="text-2xl font-extrabold text-blue-600 font-mono mt-2">
              {slaCompliance}%
            </div>
            <p className="text-[11px] text-blue-600/80 mt-1">{stats.overdue} cases exceeded 72h SLA</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Under Active Triage</span>
            <div className="text-2xl font-extrabold text-amber-600 font-mono mt-2">
              {stats.in_progress + stats.pending}
            </div>
            <p className="text-[11px] text-amber-600/80 mt-1">{stats.in_progress} in progress, {stats.pending} pending</p>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Department Status Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Resolved Cases ({stats.resolved})</span>
                <span>{resolutionRate}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${resolutionRate}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>In Progress Review ({stats.in_progress})</span>
                <span>{stats.total_assigned > 0 ? Math.round((stats.in_progress / stats.total_assigned) * 100) : 0}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${stats.total_assigned > 0 ? (stats.in_progress / stats.total_assigned) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Pending Initial Triage ({stats.pending})</span>
                <span>{stats.total_assigned > 0 ? Math.round((stats.pending / stats.total_assigned) * 100) : 0}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.total_assigned > 0 ? (stats.pending / stats.total_assigned) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Officer Dashboard
  return (
    <div className="space-y-5">
      {/* Row 1: 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <OfficerStatCard
          title="Assigned to Me"
          icon={FileText}
          color="blue"
          value={stats.total_assigned}
          loading={loadingStats}
          subtext={`${stats.department_count || 0} in department`}
        />
        <OfficerStatCard
          title="In Progress"
          icon={Clock}
          color="amber"
          value={stats.in_progress}
          loading={loadingStats}
          subtext="Under active review"
        />
        <OfficerStatCard
          title="Resolved"
          icon={CheckCircle2}
          color="emerald"
          value={stats.resolved}
          loading={loadingStats}
          subtext="Closed cases"
        />
        <OfficerStatCard
          title="Overdue"
          icon={AlertTriangle}
          color="rose"
          value={stats.overdue}
          loading={loadingStats}
          subtext="Exceeded 3-day SLA"
        />
      </div>

      {/* Row 2: Two-Column Section (Recent Updates & Workload on Left, Department Info & Quick Actions on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (~65%) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          <OfficerRecentUpdatesCard 
            updates={stats.recent_updates || []} 
            onViewAll={() => onNavigateTab && onNavigateTab('assigned')} 
          />
          <OfficerWorkloadCard stats={stats} complaints={complaints} />
        </div>

        {/* Right Column (~35%) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <DepartmentInfoCard 
            departmentName={effectiveDept} 
            departmentCount={stats.department_count}
            resolvedCount={stats.resolved}
          />
          <OfficerQuickActionsCard onActionClick={handleQuickAction} />
        </div>
      </div>

    </div>
  );
}
