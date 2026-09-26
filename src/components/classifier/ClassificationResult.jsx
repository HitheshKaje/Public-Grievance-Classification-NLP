// src/components/classifier/ClassificationResult.jsx
import React, { useState } from 'react';
import {
  CheckCircle2,
  Building,
  Sparkles,
  Send,
  Copy,
  Check,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { CategoryBadge } from '../common/Badge';

export default function ClassificationResult({
  result,
  complaintText,
  onRegisterComplaint,
  isRegistered = false
}) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const confidencePercentage = Math.round(result.confidence * 100);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `Grievance: ${complaintText}\nPredicted Category: ${result.category}\nConfidence: ${confidencePercentage}%\nDepartment: ${result.department}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-blue-200/90 shadow-md p-6 relative overflow-hidden transition-all animate-in fade-in duration-200">
      {/* Subtle top indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Classification Result
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated via multi-class public grievance NLP model
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                Copy Output
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Prediction & Confidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-5">
        {/* Left Column: Predicted Category */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Predicted Category
            </span>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-2xl font-extrabold text-slate-900">
                {result.category}
              </span>
              <CategoryBadge category={result.category} className="text-xs" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2 text-xs text-slate-600">
            <Building className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="truncate">
              Routing To: <strong className="text-slate-800">{result.department || 'Nodal Public Department'}</strong>
            </span>
          </div>
        </div>

        {/* Right Column: Confidence and Probability Visualization */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Confidence
              </span>
              <span className="text-2xl font-extrabold text-blue-600 font-mono">
                {confidencePercentage}%
              </span>
            </div>

            {/* Primary Confidence Bar */}
            <div className="mt-2 w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${confidencePercentage}%` }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              High certainty tier (&gt;80%)
            </span>
            <span>NLP Score: {result.confidence}</span>
          </div>
        </div>
      </div>

      {/* Probability Distribution Visualization (if available from model response) */}
      {result.probabilities && result.probabilities.length > 1 && (
        <div className="mb-5 bg-white p-4 rounded-xl border border-slate-100">
          <p className="text-xs font-semibold text-slate-700 mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Probability Distribution Across Taxonomies
          </p>
          <div className="space-y-2">
            {result.probabilities.slice(0, 4).map((item, idx) => {
              const probPct = Math.round(item.probability * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.category}</span>
                    <span className="text-slate-500 font-mono">{probPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-blue-600' : 'bg-slate-400'
                      }`}
                      style={{ width: `${probPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Complaint can be registered directly into the official portal backlog.
        </p>

        {onRegisterComplaint && (
          <button
            onClick={onRegisterComplaint}
            disabled={isRegistered}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              isRegistered
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
            }`}
          >
            {isRegistered ? (
              <>
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Registered in System
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Register Complaint in Database
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
