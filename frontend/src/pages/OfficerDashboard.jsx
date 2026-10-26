import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, Clock, CheckCircle2, AlertTriangle, RefreshCw,
  Headphones, Phone, PhoneCall, Mail, Send, ShieldCheck, MapPin, HelpCircle
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
  departmentName = "Water Supply Department" 
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
  const [departmentFilter, setDepartmentFilter] = useState('All');

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
      const data = await fetchOfficerStats(departmentName);
      setStats(data);
    } catch (err) {
      console.error('Failed to load officer stats from MongoDB:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [departmentName]);

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
              Live grievances in {departmentName} connected to MongoDB.
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
          departmentName={departmentName}
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

              {/* Toll-Free Helpline */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <span className="text-[11px] text-emerald-600 font-semibold block uppercase tracking-wider flex items-center gap-1">
                  <PhoneCall className="h-3 w-3" />
                  <span>National Grievance Toll-Free</span>
                </span>
                <p className="text-base font-extrabold text-emerald-900 mt-1 font-mono">
                  1800-11-4000
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  National departmental escalation line (Mon-Sat, 9 AM - 6 PM)
                </p>
              </div>

              {/* Central Secretariat Desk */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>Secretariat Phone Desk</span>
                </span>
                <p className="text-sm font-bold text-slate-900 mt-1 font-mono">
                  +91 11 2436 0000 / 2436 1234
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Direct administrative telephone line
                </p>
              </div>
            </div>

            {/* Office Address */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-start gap-3">
              <MapPin className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Central Directorate Headquarters
                </span>
                <p className="text-xs text-slate-800 font-semibold mt-0.5">
                  Department of Administrative Reforms & Public Grievances (DARPG)
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  5th Floor, Sardar Patel Bhavan, Parliament Street, New Delhi - 110001, India
                </p>
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

  if (['reports', 'profile'].includes(activeTab)) {
    const titles = {
      reports: { name: 'Department Resolution Performance Reports', desc: 'SLA closure velocity and performance summaries for your jurisdiction.' },
      profile: { name: 'Officer Profile & Roster Credentials', desc: 'Officer ID, assigned zonal division, and nodal contact information.' },
    };
    const info = titles[activeTab] || { name: activeTab, desc: '' };
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">{info.name}</h2>
          <p className="text-xs text-slate-500 mt-1">{info.desc}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
          <EmptyState
            title="Departmental Operations Center"
            description="Live officer workflows will sync with the central database upon departmental dispatch."
            compact={false}
          />
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
            departmentName={departmentName} 
            departmentCount={stats.department_count}
            resolvedCount={stats.resolved}
          />
          <OfficerQuickActionsCard onActionClick={handleQuickAction} />
        </div>
      </div>

    </div>
  );
}
