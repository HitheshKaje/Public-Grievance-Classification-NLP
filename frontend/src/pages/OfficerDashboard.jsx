import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Clock, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
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

  if (['reports', 'profile', 'support'].includes(activeTab)) {
    const titles = {
      reports: { name: 'Department Resolution Performance Reports', desc: 'SLA closure velocity and performance summaries for your jurisdiction.' },
      profile: { name: 'Officer Profile & Roster Credentials', desc: 'Officer ID, assigned zonal division, and nodal contact information.' },
      support: { name: 'Officer Portal Help Desk', desc: 'Standard operating procedures, departmental escalation matrices, and system help.' },
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
