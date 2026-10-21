import React, { useState } from 'react';
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

export default function UserDashboard({ activeTab = 'dashboard', onNavigateTab }) {
  const [trackedId, setTrackedId] = useState(null);

  const handleTrack = (id) => {
    setTrackedId(id);
    if (onNavigateTab) onNavigateTab('track');
  };

  // If sub-view is selected from sidebar:
  if (activeTab === 'submit') {
    return <ComplaintSubmissionContainer onNavigateTab={onNavigateTab} />;
  }

  if (activeTab === 'my_complaints') {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">My Registered Grievances</h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete history of grievances submitted through your citizen account.
          </p>
        </div>
        <UserRecentComplaintsCard />
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

  // Default Dashboard Overview (Exact layout from the reference image)
  return (
    <div className="space-y-5">
      {/* Main Grid: Left Column (~65%) and Right Column (~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-5">
          {/* Hero Banner */}
          <ReportProblemHero onSubmitClick={() => onNavigateTab && onNavigateTab('submit')} />

          {/* Track Your Complaints */}
          <TrackComplaintCard onTrack={handleTrack} />

          {/* My Recent Complaints Table */}
          <UserRecentComplaintsCard onViewAll={() => onNavigateTab && onNavigateTab('my_complaints')} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-5">
          {/* My Complaints Summary Card */}
          <MyComplaintsStatCard onViewAll={() => onNavigateTab && onNavigateTab('my_complaints')} />

          {/* Complaint Status 2x2 Quadrant Card */}
          <ComplaintStatusCard />

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
