import React from 'react';
import { FileText, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import OfficerStatCard from '../components/officer/OfficerStatCard';
import OfficerAssignedComplaintsCard from '../components/officer/OfficerAssignedComplaintsCard';
import DepartmentInfoCard from '../components/officer/DepartmentInfoCard';
import OfficerQuickActionsCard from '../components/officer/OfficerQuickActionsCard';
import OfficerRecentUpdatesCard from '../components/officer/OfficerRecentUpdatesCard';
import OfficerWorkloadCard from '../components/officer/OfficerWorkloadCard';
import EmptyState from '../components/common/EmptyState';

export default function OfficerDashboard({ activeTab = 'dashboard', onNavigateTab, departmentName = "Water Supply Department" }) {
  // If sub-view is selected from sidebar:
  if (['assigned', 'in_progress', 'resolved'].includes(activeTab)) {
    const titles = {
      assigned: 'Assigned Departmental Grievances',
      in_progress: 'In Progress Review Queue',
      resolved: 'Resolved Grievances Registry'
    };
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">{titles[activeTab]}</h2>
          <p className="text-xs text-slate-500 mt-1">
            Grievances routed to {departmentName} awaiting officer action.
          </p>
        </div>
        <OfficerAssignedComplaintsCard />
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

  // Default Officer Dashboard (Exact layout from the reference image)
  return (
    <div className="space-y-5">
      {/* Row 1: 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <OfficerStatCard
          title="Assigned to Me"
          icon={FileText}
          color="blue"
        />
        <OfficerStatCard
          title="In Progress"
          icon={Clock}
          color="amber"
        />
        <OfficerStatCard
          title="Resolved"
          icon={CheckCircle2}
          color="emerald"
        />
        <OfficerStatCard
          title="Overdue"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Row 2: Two-Column Section (Assigned Complaints & Department Info / Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column (~65%) */}
        <div className="lg:col-span-8 flex flex-col">
          <OfficerAssignedComplaintsCard />
        </div>

        {/* Right Column (~35%) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <DepartmentInfoCard departmentName={departmentName} />
          <OfficerQuickActionsCard onActionClick={(id) => onNavigateTab && onNavigateTab(id)} />
        </div>
      </div>

      {/* Row 3: Two-Column Bottom Section (Recent Updates & My Workload) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column (~65%) */}
        <div className="lg:col-span-8 flex flex-col">
          <OfficerRecentUpdatesCard onViewAll={() => onNavigateTab && onNavigateTab('assigned')} />
        </div>

        {/* Right Column (~35%) */}
        <div className="lg:col-span-4 flex flex-col">
          <OfficerWorkloadCard />
        </div>
      </div>
    </div>
  );
}
