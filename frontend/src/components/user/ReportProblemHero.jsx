import React from 'react';
import { Plus } from 'lucide-react';

export default function ReportProblemHero({ onSubmitClick }) {
  return (
    <div className="bg-gradient-to-r from-[#eef4ff] via-[#e8f1ff] to-[#e0edff] rounded-2xl border border-blue-100 p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(30,107,243,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
      {/* Left Text & CTA */}
      <div className="z-10 max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
          Report a Problem
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
          Help us build a better and cleaner community
        </p>

        <button
          type="button"
          onClick={onSubmitClick}
          className="mt-5 bg-[#1e6bf3] hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 flex items-center gap-2 text-xs font-semibold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Submit Complaint</span>
        </button>
      </div>

      {/* Right Civic Cityscape Illustration */}
      <div className="sm:w-80 h-32 relative flex-shrink-0 flex items-end justify-center sm:justify-end opacity-90">
        <svg viewBox="0 0 320 130" className="w-full h-full max-w-[280px]">
          {/* Background hills / sky tint */}
          <ellipse cx="200" cy="140" rx="140" ry="60" fill="#cfe2ff" opacity="0.6" />
          
          {/* Distant building blocks */}
          <rect x="180" y="30" width="35" height="100" rx="3" fill="#93c5fd" opacity="0.65" />
          <rect x="220" y="45" width="30" height="85" rx="3" fill="#60a5fa" opacity="0.7" />
          
          {/* Main Civic Architecture (Central municipal building with archways) */}
          <rect x="120" y="45" width="55" height="85" rx="3" fill="#3b82f6" opacity="0.85" />
          {/* Building pediment / dome */}
          <path d="M120 45 L147 28 L175 45 Z" fill="#2563eb" />
          {/* Windows / Arches on Central Building */}
          <rect x="130" y="55" width="10" height="14" rx="4" fill="#eff6ff" />
          <rect x="155" y="55" width="10" height="14" rx="4" fill="#eff6ff" />
          <rect x="130" y="77" width="10" height="14" rx="4" fill="#eff6ff" />
          <rect x="155" y="77" width="10" height="14" rx="4" fill="#eff6ff" />
          <rect x="141" y="99" width="13" height="31" rx="5" fill="#1e3a8a" opacity="0.8" />

          {/* Tall City Skyscraper on right */}
          <rect x="255" y="15" width="40" height="115" rx="4" fill="#1d4ed8" opacity="0.8" />
          <line x1="265" y1="25" x2="285" y2="25" stroke="#eff6ff" strokeWidth="2" strokeLinecap="round" />
          <line x1="265" y1="35" x2="285" y2="35" stroke="#eff6ff" strokeWidth="2" strokeLinecap="round" />
          <line x1="265" y1="45" x2="285" y2="45" stroke="#eff6ff" strokeWidth="2" strokeLinecap="round" />
          <line x1="265" y1="55" x2="285" y2="55" stroke="#eff6ff" strokeWidth="2" strokeLinecap="round" />
          <line x1="265" y1="65" x2="285" y2="65" stroke="#eff6ff" strokeWidth="2" strokeLinecap="round" />
          <line x1="265" y1="75" x2="285" y2="75" stroke="#eff6ff" strokeWidth="2" strokeLinecap="round" />

          {/* Left Civic Wing */}
          <rect x="80" y="65" width="40" height="65" rx="3" fill="#60a5fa" opacity="0.75" />
          <rect x="90" y="75" width="8" height="12" rx="2" fill="#eff6ff" />
          <rect x="104" y="75" width="8" height="12" rx="2" fill="#eff6ff" />
          
          {/* Foreground Stylized Green Trees */}
          {/* Tree 1 */}
          <ellipse cx="60" cy="105" rx="14" ry="22" fill="#22c55e" />
          <ellipse cx="60" cy="102" rx="10" ry="17" fill="#16a34a" />
          <rect x="58" y="118" width="4" height="12" fill="#78350f" />

          {/* Tree 2 */}
          <ellipse cx="80" cy="112" rx="12" ry="18" fill="#15803d" />
          <rect x="78" y="122" width="4" height="8" fill="#78350f" />

          {/* Tree 3 (Right foreground) */}
          <ellipse cx="295" cy="98" rx="16" ry="24" fill="#22c55e" />
          <ellipse cx="295" cy="95" rx="12" ry="19" fill="#16a34a" />
          <rect x="293" y="114" width="4" height="16" fill="#78350f" />
        </svg>
      </div>
    </div>
  );
}
