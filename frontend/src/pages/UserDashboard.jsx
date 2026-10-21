import React, { useState, useEffect, useCallback } from 'react';
import ReportProblemHero from '../components/user/ReportProblemHero';
import TrackComplaintCard from '../components/user/TrackComplaintCard';
import UserRecentComplaintsCard from '../components/user/UserRecentComplaintsCard';
import MyComplaintsStatCard from '../components/user/MyComplaintsStatCard';
import ComplaintStatusCard from '../components/user/ComplaintStatusCard';
import UserQuickActionsCard from '../components/user/UserQuickActionsCard';
import CommonCategoriesCard from '../components/user/CommonCategoriesCard';
import EmptyState from '../components/common/EmptyState';
import ComplaintSubmissionContainer from '../components/user/submission/ComplaintSubmissionContainer';
import UserTrackingView from '../components/user/UserTrackingView';
import { 
  fetchUserStats, 
  getLocalUserComplaintIds,
  saveLocalUserComplaintId 
} from '../services/complaintService';
import { RefreshCw, Globe, User } from 'lucide-react';

export default function UserDashboard({ activeTab = 'dashboard', onNavigateTab }) {
  const [trackedId, setTrackedId] = useState(null);
  const [scope, setScope] = useState('my'); // 'my' | 'all'
  const [loadingStats, setLoadingStats] = useState(false);
  const [userStats, setUserStats] = useState({
    total: 0,
    in_progress: 0,
    in_processing: 0,
    pending: 0,
    resolved: 0,
    rejected: 0,
  });
  const [systemStats, setSystemStats] = useState({
    total: 0,
    in_processing: 0,
  });
  const [complaints, setComplaints] = useState([]);

  // Fetch live stats & recent complaints from MongoDB
  const loadCitizenStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const storedIds = getLocalUserComplaintIds();

      if (scope === 'my') {
        if (storedIds.length > 0) {
          const data = await fetchUserStats({ complaintIds: storedIds.join(',') });
          setUserStats({
            total: data.total ?? 0,
            in_progress: data.in_progress ?? 0,
            in_processing: data.in_processing ?? data.in_progress ?? 0,
            pending: data.pending ?? 0,
            resolved: data.resolved ?? 0,
            rejected: data.rejected ?? 0,
          });
          setComplaints(data.recent_complaints || []);
          setSystemStats({
            total: data.system_total ?? 0,
            in_processing: data.system_in_progress ?? 0,
          });
        } else {
          // No complaints submitted by user on this device yet
          // Fetch global totals for background awareness
          const systemData = await fetchUserStats();
          setUserStats({
            total: 0,
            in_progress: 0,
            in_processing: 0,
            pending: 0,
            resolved: 0,
            rejected: 0,
          });
          setComplaints([]);
          setSystemStats({
            total: systemData.system_total ?? systemData.total ?? 0,
            in_processing: systemData.system_in_progress ?? systemData.in_progress ?? 0,
          });
        }
      } else {
        // Scope is 'all' - global portal grievances
        const data = await fetchUserStats();
        setUserStats({
          total: data.total ?? 0,
          in_progress: data.in_progress ?? 0,
          in_processing: data.in_processing ?? data.in_progress ?? 0,
          pending: data.pending ?? 0,
          resolved: data.resolved ?? 0,
          rejected: data.rejected ?? 0,
        });
        setComplaints(data.recent_complaints || []);
        setSystemStats({
          total: data.system_total ?? data.total ?? 0,
          in_processing: data.system_in_progress ?? data.in_progress ?? 0,
        });
      }
    } catch (err) {
      console.error('Error fetching citizen dashboard stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [scope]);

  // Load stats initially and whenever tab or scope changes
  useEffect(() => {
    loadCitizenStats();
  }, [loadCitizenStats, activeTab]);

  // Listen for grievance submission events to update instantly
  useEffect(() => {
    const handleSubmission = () => {
      // Whenever a user submits, ensure scope is set to 'my' so their complaint is immediately visible
      setScope('my');
      loadCitizenStats();
    };

    window.addEventListener('pgms_complaint_submitted', handleSubmission);
    return () => {
      window.removeEventListener('pgms_complaint_submitted', handleSubmission);
    };
  }, [loadCitizenStats]);

  const handleTrack = (id) => {
    if (id && typeof id === 'string') {
      saveLocalUserComplaintId(id);
    }
    setTrackedId(id);
    if (onNavigateTab) onNavigateTab('track');
  };

  // If sub-view is selected from sidebar:
  if (activeTab === 'submit') {
    return (
      <ComplaintSubmissionContainer
        onNavigateTab={onNavigateTab}
        onTrackGrievance={handleTrack}
        onGrievanceSubmitted={() => {
          setScope('my');
          loadCitizenStats();
        }}
      />
    );
  }

  if (activeTab === 'my_complaints') {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">My Registered Grievances</h2>
            <p className="text-xs text-slate-500 mt-1">
              Complete history of grievances submitted through your citizen account.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
              {userStats.in_processing} In Processing
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              {userStats.total} Total
            </span>
            <button
              type="button"
              onClick={loadCitizenStats}
              title="Refresh complaints"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loadingStats ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        <UserRecentComplaintsCard
          complaints={complaints}
          loading={loadingStats}
          onTrack={handleTrack}
          onSubmitNew={() => onNavigateTab && onNavigateTab('submit')}
        />
      </div>
    );
  }

  if (activeTab === 'track') {
    return <UserTrackingView initialTrackedId={trackedId} />;
  }

  if (['profile', 'support'].includes(activeTab)) {
    const titles = {
      profile: { name: 'Citizen Profile & Preferences', desc: 'Your registered contact information and notification preferences.' },
      support: { name: 'Help & Citizen Support Desk', desc: 'Frequently asked questions, grievance filing guidelines, and contact directory.' }
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
            title="Information Center"
            description="Citizen profile and support services will sync with the backend account database."
            compact={false}
          />
        </div>
      </div>
    );
  }

  const storedUserIds = getLocalUserComplaintIds();

  // Default Dashboard Overview
  return (
    <div className="space-y-5">
      {/* Scope Selector & Quick Refresh Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-xs p-3.5 px-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Dashboard View:</span>
          <div className="inline-flex p-1 bg-slate-100/90 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setScope('my')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                scope === 'my'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>My Submissions ({storedUserIds.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                scope === 'all'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>All Portal Cases ({systemStats.total || 'Live'})</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="hidden sm:inline">
            Live MongoDB sync &bull; {userStats.in_processing} in processing
          </span>
          <button
            type="button"
            onClick={loadCitizenStats}
            className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Refresh statistics"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingStats ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (~65%) and Right Column (~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-5">
          {/* Hero Banner */}
          <ReportProblemHero onSubmitClick={() => onNavigateTab && onNavigateTab('submit')} />

          {/* Track Your Complaints */}
          <TrackComplaintCard onTrack={handleTrack} />

          {/* My Recent Complaints Table */}
          <UserRecentComplaintsCard
            complaints={complaints}
            loading={loadingStats}
            onTrack={handleTrack}
            onViewAll={() => onNavigateTab && onNavigateTab('my_complaints')}
            onSubmitNew={() => onNavigateTab && onNavigateTab('submit')}
          />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-5">
          {/* My Complaints Summary Card with Total Count & In Processing Highlight */}
          <MyComplaintsStatCard
            totalCount={userStats.total}
            inProcessingCount={userStats.in_processing}
            pendingCount={userStats.pending}
            loading={loadingStats}
            onViewAll={() => onNavigateTab && onNavigateTab('my_complaints')}
          />

          {/* Complaint Status 2x2 Quadrant Card */}
          <ComplaintStatusCard
            stats={userStats}
            loading={loadingStats}
          />

          {/* Quick Actions 2x2 Card */}
          <UserQuickActionsCard onActionClick={(id) => onNavigateTab && onNavigateTab(id)} />
        </div>
      </div>

      {/* Bottom Full-Width Row: Common Complaint Categories */}
      <CommonCategoriesCard 
        onViewAll={() => onNavigateTab && onNavigateTab('submit')}
        onSelectCategory={() => onNavigateTab && onNavigateTab('submit')}
      />
    </div>
  );
}
