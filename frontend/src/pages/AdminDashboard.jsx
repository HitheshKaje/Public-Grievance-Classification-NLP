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
  AlertCircle
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
import EmptyState from '../components/common/EmptyState';
import { 
  fetchAdminStats, 
  fetchComplaints, 
  fetchOfficers 
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
      if (onSelectPortal) {
        onSelectPortal('user');
      } else if (onNavigateTab) {
        onNavigateTab('incoming');
      }
    } else if (actionId === 'manage_officers') {
      if (onNavigateTab) {
        onNavigateTab('officers');
      } else {
        setIsAddOfficerModalOpen(true);
      }
    } else if (actionId === 'view_reports') {
      if (onNavigateTab) {
        onNavigateTab('reports');
      }
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
          onRefresh={loadComplaints}
        />

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
          onRefresh={loadComplaints}
        />

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
      </div>
    );
  }

  // 5. Other sub-views (classification, reports, settings)
  if (['classification', 'reports', 'settings'].includes(activeTab)) {
    const sectionInfo = {
      classification: { title: 'Classification Review', desc: 'NLP automated categorization confidence review queue.' },
      reports: { title: 'Reports & Analytics', desc: 'Comprehensive SLA resolution summaries and intake reports.' },
      settings: { title: 'System Settings', desc: 'Portal administration, taxonomy configuration, and API settings.' },
    };
    const current = sectionInfo[activeTab] || { title: activeTab, desc: '' };

    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">{current.title}</h2>
          <p className="text-xs text-slate-500 mt-1">{current.desc}</p>
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
          title="Ready for Forwarding"
          icon={Loader2}
          color="purple"
          value={stats.ready_forwarding}
          loading={loadingStats}
        />
        <StatCard
          title="Forwarded Complaints"
          icon={CheckCircle2}
          color="emerald"
          value={stats.forwarded}
          loading={loadingStats}
        />
      </div>

      {/* Row 2: Complaint Processing Flow (Dynamic MongoDB counts) */}
      <ComplaintFlowCard counts={stats.flow_counts} />

      {/* Row 3: Incoming Complaints & Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
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
            onRefresh={loadComplaints}
          />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <DepartmentTilesCard 
            departmentCounts={stats.department_distribution || []}
            onSelectDepartment={(deptName) => {
              setDepartmentFilter(deptName);
              if (onNavigateTab) onNavigateTab('incoming');
            }}
          />
        </div>
      </div>

      {/* Row 4: Recent Activity, Classification Overview, Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <RecentActivityCard 
          activities={stats.recent_activity || []} 
          onViewAll={() => onNavigateTab && onNavigateTab('incoming')}
        />
        <ClassificationOverviewCard stats={stats} />
        <QuickActionsCard onActionClick={handleQuickAction} />
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
