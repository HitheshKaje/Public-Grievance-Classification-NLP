import React from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import EmptyState from '../common/EmptyState';

export default function DepartmentDistributionSection() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-800">Department-wise Distribution</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown of public grievances categorized across the 7 departments
          </p>
        </div>
        <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          Distribution
        </span>
      </div>

      <div className="py-8">
        <EmptyState
          title="No complaint distribution data available yet"
          description="Departmental distribution charts will render live intake volumes once grievance registration starts."
          icon={PieChartIcon}
        />
      </div>

      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Target: 7 Municipal Domains</span>
        <span>Awaiting FastAPI Data</span>
      </div>
    </div>
  );
}
