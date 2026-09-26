// src/components/complaints/ComplaintTable.jsx
import React from 'react';
import { Eye, ChevronLeft, ChevronRight, FileX } from 'lucide-react';
import { CategoryBadge, StatusBadge, ConfidenceBadge } from '../common/Badge';

export default function ComplaintTable({
  complaints = [],
  total = 0,
  page = 1,
  limit = 8,
  totalPages = 1,
  onPageChange,
  onSelectComplaint,
  loading = false
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-sm">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading complaints register...</p>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-sm">
        <FileX className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No complaints matched</h3>
        <p className="text-xs text-slate-500 mt-1">
          Try adjusting your search query, category filter, or status criteria.
        </p>
      </div>
    );
  }

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Complaint ID</th>
              <th className="py-3.5 px-5">Complaint</th>
              <th className="py-3.5 px-5">Category</th>
              <th className="py-3.5 px-5">Confidence</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5">Date</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {complaints.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelectComplaint(item)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <td className="py-3.5 px-5 font-mono font-medium text-slate-700 whitespace-nowrap">
                  {item.id}
                </td>
                <td className="py-3.5 px-5 font-medium text-slate-900 max-w-xs md:max-w-md lg:max-w-lg truncate">
                  {item.text}
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap">
                  <CategoryBadge category={item.category} />
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap">
                  <ConfidenceBadge confidence={item.confidence} />
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap">
                  <StatusBadge status={item.status} />
                </td>
                <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">
                  {item.date}
                </td>
                <td className="py-3.5 px-5 text-right whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectComplaint(item);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors text-xs font-medium border border-slate-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-slate-50/60 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          Showing <span className="font-semibold text-slate-900">{startRecord}</span> to{' '}
          <span className="font-semibold text-slate-900">{endRecord}</span> of{' '}
          <span className="font-semibold text-slate-900">{total}</span> complaints
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="px-2 font-medium text-slate-700">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
