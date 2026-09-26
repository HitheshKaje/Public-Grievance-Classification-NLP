// src/components/dashboard/RecentComplaints.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, ShieldCheck } from 'lucide-react';
import { CategoryBadge, StatusBadge, ConfidenceBadge } from '../common/Badge';

export default function RecentComplaints({ complaints = [], onSelectComplaint }) {
  // Take first 5 or 6 recent complaints
  const displayComplaints = complaints.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Complaints
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest citizen submissions processed by the NLP classification pipeline
          </p>
        </div>

        <Link
          to="/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          View All Complaints
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-5">Complaint ID</th>
              <th className="py-3 px-5">Complaint Text</th>
              <th className="py-3 px-5">Predicted Category</th>
              <th className="py-3 px-5">Confidence</th>
              <th className="py-3 px-5">Date</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {displayComplaints.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                onClick={() => onSelectComplaint && onSelectComplaint(item)}
              >
                <td className="py-3.5 px-5 font-mono font-medium text-slate-700 whitespace-nowrap">
                  {item.id}
                </td>
                <td className="py-3.5 px-5 font-medium text-slate-900 max-w-xs md:max-w-md truncate">
                  {item.text}
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap">
                  <CategoryBadge category={item.category} />
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap">
                  <ConfidenceBadge confidence={item.confidence} />
                </td>
                <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">
                  {item.date}
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap">
                  <StatusBadge status={item.status} />
                </td>
                <td className="py-3.5 px-5 text-right whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectComplaint && onSelectComplaint(item);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors inline-flex items-center"
                    title="View Full Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Showing 5 most recent grievances</span>
        <Link
          to="/complaints"
          className="font-medium text-blue-600 hover:text-blue-700"
        >
          View all 1,245 complaints &rarr;
        </Link>
      </div>
    </div>
  );
}
