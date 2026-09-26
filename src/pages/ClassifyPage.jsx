// src/pages/ClassifyPage.jsx
import React, { useState } from 'react';
import {
  Sparkles,
  Info,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Cpu
} from 'lucide-react';
import ComplaintClassifier from '../components/classifier/ComplaintClassifier';
import { CategoryBadge, StatusBadge } from '../components/common/Badge';

export default function ClassifyPage() {
  const [sessionHistory, setSessionHistory] = useState([]);

  const handleComplaintSubmitted = (newRecord) => {
    setSessionHistory((prev) => [newRecord, ...prev]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Classify Grievance
            </h2>
            <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-blue-600" />
              NLP Pipeline Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Submit citizen grievance statements to classify into designated civic categories and determine departmental routing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Classifier Area */}
        <div className="lg:col-span-8">
          <ComplaintClassifier onComplaintSubmitted={handleComplaintSubmitted} />
        </div>

        {/* Sidebar Info & Classification Session History */}
        <div className="lg:col-span-4 space-y-5">
          {/* Classification Guidelines Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
              <Info className="w-4 h-4 text-blue-600" />
              <span>NLP Classification Guidelines</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <span>Input full natural language statements as submitted by citizens.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <span>The model automatically strips stop words and extracts multi-word n-gram features.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <span>Predictions with confidence &gt; 80% are recommended for automatic nodal assignment.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <span>Ambiguous grievances will be routed with an "Under Review" flag for manual validation.</span>
              </li>
            </ul>
          </div>

          {/* Recently Classified in Current Session */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Session Activity</span>
              </div>
              <span className="text-[10px] bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded-full">
                {sessionHistory.length} logged
              </span>
            </div>

            {sessionHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center italic">
                No complaints classified in this session yet. Test one on the left!
              </p>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {sessionHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-700 text-[11px]">
                        {item.id}
                      </span>
                      <CategoryBadge category={item.category} />
                    </div>
                    <p className="text-slate-800 line-clamp-1 font-medium">{item.text}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>Conf: {Math.round(item.confidence * 100)}%</span>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
