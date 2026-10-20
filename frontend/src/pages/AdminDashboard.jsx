import React from 'react';
import { 
  Inbox, 
  Clock, 
  Hourglass, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  ShieldAlert,
  Server
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import DepartmentDistributionSection from '../components/dashboard/DepartmentDistributionSection';
import ComplaintTrendsSection from '../components/dashboard/ComplaintTrendsSection';
import RecentComplaintsSection from '../components/dashboard/RecentComplaintsSection';
import DepartmentPerformanceSection from '../components/dashboard/DepartmentPerformanceSection';
import DepartmentList from '../components/dashboard/DepartmentList';
import EmptyState from '../components/common/EmptyState';

export default function AdminDashboard({ activeTab = 'overview' }) {
  // If activeTab is a sub-section of the Admin Dashboard, show focused view
  if (activeTab === 'departments') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Configured Municipal Departments</h2>
          <p className="text-xs text-slate-500 mt-1">
            Official 7-class taxonomy definitions configured for the NLP routing engine.
          </p>
        </div>
        <DepartmentList />
      </div>
    );
  }

  if (activeTab === 'complaints') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Grievance Central Repository</h2>
          <p className="text-xs text-slate-500 mt-1">
            Master registry of public complaints submitted across all municipal channels.
          </p>
        </div>
        <RecentComplaintsSection />
      </div>
    );
  }

  if (activeTab === 'reports') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Administrative Analytics & Reports</h2>
          <p className="text-xs text-slate-500 mt-1">
            Department performance summaries, SLA resolution reports, and citizen satisfaction trends.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DepartmentDistributionSection />
          <ComplaintTrendsSection />
        </div>
        <DepartmentPerformanceSection />
      </div>
    );
  }

  if (['officers', 'citizens', 'settings'].includes(activeTab)) {
    const titles = {
      officers: { name: 'Department Officer Directory', desc: 'Officer assignment roster and nodal contact management.' },
      citizens: { name: 'Citizen Directory', desc: 'Registered citizen profiles and communication logs.' },
      settings: { name: 'Portal & Classification Settings', desc: 'System configuration, SLA definitions, and NLP service endpoints.' }
    };
    const info = titles[activeTab];
    return (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">{info.name}</h2>
          <p className="text-xs text-slate-500 mt-1">{info.desc}</p>
        </div>
        <div className="bg-white p-12 rounded-xl border border-slate-200/80 shadow-sm">
          <EmptyState
            title={`No ${activeTab} records configured yet`}
            description="This administrative section will populate as users and system configurations are provisioned."
            compact={false}
          />
        </div>
      </div>
    );
  }

  // Default Overview Layout
  return (
    <div className="space-y-6">
      {/* Informational Status Banner */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 flex items-start gap-3.5">
        <div className="p-1.5 rounded-lg bg-blue-100/80 text-blue-700 shrink-0 mt-0.5">
          <Info className="h-4 w-4 stroke-[2]" />
        </div>
        <div className="flex-1 text-xs">
          <h3 className="font-semibold text-blue-900">Pre-Intake Administration State</h3>
          <p className="text-blue-700/90 mt-0.5 leading-relaxed">
            The Admin Dashboard visual framework is deployed and ready. Real-time metric counters, 
            intake trends, and recent grievances will activate automatically once citizen complaint workflows 
            are initiated through the FastAPI backend and MongoDB database.
          </p>
        </div>
      </div>

      {/* Row 1: Key Metric Reserved Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Complaints"
          icon={Inbox}
          accentColor="blue"
          badgeText="Awaiting Intake"
          description="Total citizen submissions"
        />
        <StatCard
          title="Pending Complaints"
          icon={Clock}
          accentColor="amber"
          badgeText="Queue Empty"
          description="Unassigned to departments"
        />
        <StatCard
          title="In-Progress Complaints"
          icon={Hourglass}
          accentColor="indigo"
          badgeText="No Active Cases"
          description="Under officer review"
        />
        <StatCard
          title="Resolved Complaints"
          icon={CheckCircle2}
          accentColor="emerald"
          badgeText="No Closed Cases"
          description="Successfully closed"
        />
      </div>

      {/* Row 2: Department-wise Distribution & Complaint Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DepartmentDistributionSection />
        <ComplaintTrendsSection />
      </div>

      {/* Row 3: Recent Complaints Table */}
      <RecentComplaintsSection />

      {/* Row 4: Department Performance & Supported Taxonomy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DepartmentPerformanceSection />
        <DepartmentList />
      </div>
    </div>
  );
}
