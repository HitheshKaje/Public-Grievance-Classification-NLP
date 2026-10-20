import React from 'react';
import { 
  FileText, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ComplaintFlowCard from '../components/dashboard/ComplaintFlowCard';
import IncomingComplaintsCard from '../components/dashboard/IncomingComplaintsCard';
import DepartmentTilesCard from '../components/dashboard/DepartmentTilesCard';
import RecentActivityCard from '../components/dashboard/RecentActivityCard';
import ClassificationOverviewCard from '../components/dashboard/ClassificationOverviewCard';
import QuickActionsCard from '../components/dashboard/QuickActionsCard';

export default function AdminDashboard({ activeTab = 'overview' }) {
  // If active tab is 'departments'
  if (activeTab === 'departments') {
    return (
      <div className="space-y-5">
        <DepartmentTilesCard />
      </div>
    );
  }

  // If active tab is 'incoming'
  if (activeTab === 'incoming') {
    return (
      <div className="space-y-5">
        <IncomingComplaintsCard />
      </div>
    );
  }

  // If active tab is other sub-views
  if (['classification', 'forwarding', 'officers', 'reports', 'settings'].includes(activeTab)) {
    const sectionInfo = {
      classification: { title: 'Classification Review', desc: 'NLP automated categorization confidence review queue.' },
      forwarding: { title: 'Department Forwarding', desc: 'Dispatched grievance routing and departmental acknowledgment.' },
      officers: { title: 'Officers Directory', desc: 'Departmental nodal officers and administrative roster.' },
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
          <RecentActivityCard />
          <ClassificationOverviewCard />
        </div>
      </div>
    );
  }

  // Primary Overview Layout (Matching the user screenshot exactly)
  return (
    <div className="space-y-5">
      {/* Row 1: 4 Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Complaints"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Awaiting Review"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Ready for Forwarding"
          icon={Loader2}
          color="purple"
        />
        <StatCard
          title="Forwarded Complaints"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Row 2: Complaint Processing Flow */}
      <ComplaintFlowCard />

      {/* Row 3: Incoming Complaints & Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <IncomingComplaintsCard />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <DepartmentTilesCard />
        </div>
      </div>

      {/* Row 4: Recent Activity, Classification Overview, Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <RecentActivityCard />
        <ClassificationOverviewCard />
        <QuickActionsCard />
      </div>
    </div>
  );
}
