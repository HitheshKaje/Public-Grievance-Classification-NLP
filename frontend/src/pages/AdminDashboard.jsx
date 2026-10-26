import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  Loader2,
  Users,
  Send,
  Building2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Settings,
  Landmark
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ComplaintFlowCard from '../components/dashboard/ComplaintFlowCard';
import IncomingComplaintsCard from '../components/dashboard/IncomingComplaintsCard';
import DepartmentTilesCard from '../components/dashboard/DepartmentTilesCard';
import RecentActivityCard from '../components/dashboard/RecentActivityCard';
import ClassificationOverviewCard from '../components/dashboard/ClassificationOverviewCard';
import QuickActionsCard from '../components/dashboard/QuickActionsCard';
import ComplaintWorkOrderModal from '../components/dashboard/ComplaintWorkOrderModal';
import AddOfficerModal from '../components/dashboard/AddOfficerModal';
import OfficersDirectoryView from '../components/dashboard/OfficersDirectoryView';
import AdminSettingsView from '../components/dashboard/AdminSettingsView';
import EmptyState from '../components/common/EmptyState';
import { 
  fetchAdminStats, 
  fetchComplaints, 
  fetchOfficers,
  updateComplaintStatus
} from '../services/complaintService';

export default function AdminDashboard({ 
  activeTab = 'overview', 
  onNavigateTab,
  onSelectPortal 
}) {
  const [stats, setStats] = useState({
    total_complaints: 0,
    awaiting_review: 0,
    ready_forwarding: 0,
    forwarded: 0,
    resolved: 0,
    in_progress: 0,
    total_officers: 0,
    flow_counts: { received: 0, classification: 0, structure: 0, forward: 0, completed: 0 },
    department_distribution: [],
    recent_activity: []
  });

  const [complaints, setComplaints] = useState([]);
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [officers, setOfficers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [loadingOfficers, setLoadingOfficers] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState(
    activeTab === 'forwarding' ? 'Pending' : 'All'
  );

  // Modals state
  const [activeWorkOrderComplaint, setActiveWorkOrderComplaint] = useState(null);
  const [isAddOfficerModalOpen, setIsAddOfficerModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load stats from MongoDB
  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats from MongoDB:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Load complaints from MongoDB
  const loadComplaints = useCallback(async () => {
    setLoadingComplaints(true);
    try {
      const data = await fetchComplaints({
        search,
        department: departmentFilter,
        status: statusFilter,
        page: 1,
        limit: 10
      });
      setComplaints(data.complaints || []);
      setTotalComplaints(data.total || 0);
    } catch (err) {
      console.error('Failed to load complaints from MongoDB:', err);
    } finally {
      setLoadingComplaints(false);
    }
  }, [search, departmentFilter, statusFilter]);

  // Load registered officers from MongoDB
  const loadOfficers = useCallback(async () => {
    setLoadingOfficers(true);
    try {
      const data = await fetchOfficers();
      setOfficers(data.officers || []);
    } catch (err) {
      console.error('Failed to load officers from MongoDB:', err);
    } finally {
      setLoadingOfficers(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadOfficers();
  }, [loadStats, loadOfficers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadComplaints();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadComplaints]);

  // Handle Quick Actions from bottom card
  const handleQuickAction = (actionId) => {
    if (actionId === 'new_complaint') {
      if (onNavigateTab) {
        onNavigateTab('incoming');
      }
    } else if (actionId === 'manage_officers') {
      if (onNavigateTab) {
        onNavigateTab('officers');
      } else {
        setIsAddOfficerModalOpen(true);
      }
    } else if (actionId === 'view_settings') {
      if (onNavigateTab) {
        onNavigateTab('settings');
      }
    }
  };

  const handleUpdateStatus = async (complaintId, newStatus, remarks = '') => {
    try {
      await updateComplaintStatus(complaintId, newStatus, remarks);
      setNotification(`Complaint ${complaintId} status updated to "${newStatus}"!`);
      setTimeout(() => setNotification(null), 4000);
      await Promise.all([loadComplaints(), loadStats()]);
    } catch (err) {
      console.error('Failed to update status in MongoDB:', err);
      alert(`Error updating complaint: ${err.message}`);
    }
  };

  const handleForwardSuccess = (updatedComplaint) => {
    setNotification(`Work order dispatched to ${updatedComplaint.assigned_department || 'department'} successfully!`);
    setTimeout(() => setNotification(null), 4000);
    loadComplaints();
    loadStats();
  };

  const handleOfficerCreated = (newOfficer) => {
    setNotification(`Officer ${newOfficer.name} (${newOfficer.officer_id}) registered in MongoDB!`);
    setTimeout(() => setNotification(null), 4000);
    loadOfficers();
    loadStats();
  };

  // Sub-views based on activeTab:

  // 1. Officers Directory & Management Tab
  if (activeTab === 'officers') {
    return (
      <div className="space-y-5">
        <OfficersDirectoryView
          officers={officers}
          loading={loadingOfficers}
          onRefresh={loadOfficers}
          onOpenAddModal={() => setIsAddOfficerModalOpen(true)}
        />

        <AddOfficerModal
          isOpen={isAddOfficerModalOpen}
          onClose={() => setIsAddOfficerModalOpen(false)}
          onOfficerCreated={handleOfficerCreated}
        />
      </div>
    );
  }

  // 2. Departments Tab
  if (activeTab === 'departments') {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Departmental Jurisdictions & Case Loads
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active civic departments receiving complaints from the citizen portal.
            </p>
          </div>
          <button
            type="button"
            onClick={loadStats}
            className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
            <span>Sync MongoDB</span>
          </button>
        </div>

        <DepartmentTilesCard 
          departmentCounts={stats.department_distribution || []}
          onSelectDepartment={(deptName) => {
            setDepartmentFilter(deptName);
            if (onNavigateTab) onNavigateTab('incoming');
          }}
        />
      </div>
    );
  }

  // 3. Incoming Complaints Tab
  if (activeTab === 'incoming') {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Citizen Grievance Ingestion Queue
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              All incoming complaints submitted via web portal, PDF petition, photo, and voice audio.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { loadComplaints(); loadStats(); }}
            className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingComplaints ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        <IncomingComplaintsCard 
          complaints={complaints}
          total={totalComplaints}
          loading={loadingComplaints}
          search={search}
          onSearchChange={setSearch}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={setDepartmentFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onOpenWorkOrderModal={(comp) => setActiveWorkOrderComplaint(comp)}
          onUpdateStatus={handleUpdateStatus}
          onRefresh={loadComplaints}
        />

        {activeWorkOrderComplaint && (
          <ComplaintWorkOrderModal
            complaint={activeWorkOrderComplaint}
            officers={officers}
            onClose={() => setActiveWorkOrderComplaint(null)}
            onForwardSuccess={handleForwardSuccess}
            onStatusUpdated={handleUpdateStatus}
            onOpenAddOfficer={() => {
              setActiveWorkOrderComplaint(null);
              setIsAddOfficerModalOpen(true);
            }}
          />
        )}
      </div>
    );
  }

  // 4. Department Forwarding & Structuring Tab
  if (activeTab === 'forwarding') {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">
              Departmental Work Order & Dispatch Center
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Convert incoming citizen complaints into formal official Work Orders with assigned officers and technical directives.
          </p>
        </div>

        <IncomingComplaintsCard 
          complaints={complaints}
          total={totalComplaints}
          loading={loadingComplaints}
          search={search}
          onSearchChange={setSearch}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={setDepartmentFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onOpenWorkOrderModal={(comp) => setActiveWorkOrderComplaint(comp)}
          onUpdateStatus={handleUpdateStatus}
          onRefresh={loadComplaints}
        />

        {activeWorkOrderComplaint && (
          <ComplaintWorkOrderModal
            complaint={activeWorkOrderComplaint}
            officers={officers}
            onClose={() => setActiveWorkOrderComplaint(null)}
            onForwardSuccess={handleForwardSuccess}
            onStatusUpdated={handleUpdateStatus}
            onOpenAddOfficer={() => {
              setActiveWorkOrderComplaint(null);
              setIsAddOfficerModalOpen(true);
            }}
          />
        )}
      </div>
    );
  }

  // 5. Settings Tab (Interactive Production Admin System Settings)
  if (activeTab === 'settings') {
    return (
      <AdminSettingsView 
        onNotify={(msg) => {
          setNotification(msg);
          setTimeout(() => setNotification(null), 4000);
        }} 
      />
    );
  }

  // 6. Classification Review Queue
  if (activeTab === 'classification') {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">Classification Review Queue</h2>
          <p className="text-xs text-slate-500 mt-1">
            NLP automated categorization confidence review queue and triage routing recommendations.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <RecentActivityCard 
            activities={stats.recent_activity || []} 
            onViewAll={() => onNavigateTab && onNavigateTab('incoming')}
          />
          <ClassificationOverviewCard stats={stats} />
        </div>
      </div>
    );
  }

  // Primary Overview Layout (Matching exactly the UI specifications)
  return (
    <div className="space-y-5">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{notification}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setNotification(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Row 1: 4 Top Stat Cards (All Connected to MongoDB) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Complaints"
          icon={FileText}
          color="blue"
          value={stats.total_complaints}
          loading={loadingStats}
        />
        <StatCard
          title="Awaiting Review"
          icon={Clock}
          color="amber"
          value={stats.awaiting_review}
          loading={loadingStats}
        />
        <StatCard
          title="In Progress"
          icon={Clock}
          color="purple"
          value={stats.in_progress}
          loading={loadingStats}
        />
        <StatCard
          title="Resolved Cases"
          icon={CheckCircle2}
          color="emerald"
          value={stats.resolved}
          loading={loadingStats}
        />
      </div>

      {/* Row 2: Complaint Processing Flow (Dynamic MongoDB counts) */}
      <ComplaintFlowCard counts={stats.flow_counts} />

      {/* Row 3: Dedicated Modules Quick Access Hub & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Module Quick Access Hub (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              Administrative Command Hub
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct access to dedicated portals and queues available in the sidebar navigation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Incoming Ingestion Queue */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('incoming')}
              className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/60 hover:bg-blue-50/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-800 font-mono">
                  {stats.total_complaints} Cases
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                  Incoming Complaints Queue
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Review raw intake petitions, voice recordings, and field photos.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                <span>Open Queue</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Department Jurisdictions */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('departments')}
              className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/60 hover:bg-indigo-50/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="h-9 w-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Landmark className="h-4.5 w-4.5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100/70 text-indigo-800 font-mono">
                  {stats.department_distribution?.length || 0} Active
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                  Departments & Jurisdictions
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Departmental case loads, civic domains, and allocations.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
                <span>View Departments</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Officers Management */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('officers')}
              className="p-4 rounded-xl border border-slate-100 hover:border-purple-200 bg-slate-50/60 hover:bg-purple-50/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="h-9 w-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100/70 text-purple-800 font-mono">
                  {officers.length || stats.total_officers || 0} Officers
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                  Nodal Officers Directory
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Assigned field officers, designations, and contact routing.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-purple-600">
                <span>Manage Officers</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* System & AI Settings */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('settings')}
              className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/60 hover:bg-blue-50/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Settings className="h-4.5 w-4.5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-800 font-mono">
                  Config
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                  System & AI Settings
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Multilingual AI pipeline, SLA targets, audio/photo/PDF rules & access control.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                <span>Configure Settings</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Operational Status & Direct Actions (1 col on lg) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Operational Status
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Standard SLA Window</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  72 Hours
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Database Store</span>
                <span className="font-medium text-emerald-700 flex items-center gap-1">
                  MongoDB Connected
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Dispatched Work Orders</span>
                <span className="font-mono font-bold text-blue-600">
                  {stats.forwarded} Active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Quick Admin Actions
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickAction('new_complaint')}
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>+ New Grievance</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddOfficerModalOpen(true)}
                className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Users className="h-3.5 w-3.5" />
                <span>+ Add Officer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Work Order Dispatch Modal */}
      {activeWorkOrderComplaint && (
        <ComplaintWorkOrderModal
          complaint={activeWorkOrderComplaint}
          officers={officers}
          onClose={() => setActiveWorkOrderComplaint(null)}
          onForwardSuccess={handleForwardSuccess}
          onOpenAddOfficer={() => {
            setActiveWorkOrderComplaint(null);
            setIsAddOfficerModalOpen(true);
          }}
        />
      )}

      {/* Add Officer Modal */}
      <AddOfficerModal
        isOpen={isAddOfficerModalOpen}
        onClose={() => setIsAddOfficerModalOpen(false)}
        onOfficerCreated={handleOfficerCreated}
      />
    </div>
  );
}
