import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';

export default function TrackComplaintCard({ onTrack }) {
  const [complaintId, setComplaintId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onTrack && complaintId.trim()) {
      onTrack(complaintId.trim());
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)]">
      {/* Title */}
      <div className="flex items-center gap-2 mb-3.5">
        <Search className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">
          Track Your Complaints
        </h2>
      </div>

      {/* Input & Button Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={complaintId}
            onChange={(e) => setComplaintId(e.target.value)}
            placeholder="Enter Complaint ID"
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
          />
        </div>

        <button
          type="submit"
          className="bg-[#1e6bf3] hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm shadow-blue-600/20 transition-all flex-shrink-0 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Track</span>
        </button>
      </form>
    </div>
  );
}
