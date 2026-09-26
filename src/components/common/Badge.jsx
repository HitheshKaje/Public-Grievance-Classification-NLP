// src/components/common/Badge.jsx
import React from 'react';

const CATEGORY_STYLES = {
  'Civic Services': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Infrastructure': 'bg-amber-50 text-amber-700 border-amber-200',
  'Electricity': 'bg-yellow-50 text-yellow-800 border-yellow-200',
  'Water Supply': 'bg-sky-50 text-sky-700 border-sky-200',
  'Sanitation': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Public Safety': 'bg-rose-50 text-rose-700 border-rose-200',
  'Transport': 'bg-purple-50 text-purple-700 border-purple-200',
  'Others': 'bg-slate-100 text-slate-700 border-slate-200',
};

const STATUS_STYLES = {
  'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200 dot-emerald',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200 dot-blue',
  'Under Review': 'bg-amber-50 text-amber-700 border-amber-200 dot-amber',
  'Pending': 'bg-rose-50 text-rose-700 border-rose-200 dot-rose',
};

export function CategoryBadge({ category, className = '' }) {
  const style = CATEGORY_STYLES[category] || 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      {category}
    </span>
  );
}

export function StatusBadge({ status, className = '' }) {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  
  const dotColor = 
    status === 'Resolved' ? 'bg-emerald-500' :
    status === 'In Progress' ? 'bg-blue-500' :
    status === 'Under Review' ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
}

export function ConfidenceBadge({ confidence }) {
  const percentage = Math.round(confidence * 100);
  let color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (percentage < 85) color = 'text-blue-700 bg-blue-50 border-blue-200';
  if (percentage < 70) color = 'text-amber-700 bg-amber-50 border-amber-200';

  return (
    <div className="flex items-center gap-2">
      <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${color}`}>
        {percentage}%
      </span>
      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
        <div
          className="bg-blue-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
