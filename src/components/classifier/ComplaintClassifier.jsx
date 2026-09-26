// src/components/classifier/ComplaintClassifier.jsx
import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { classifyComplaint, submitNewComplaint } from '../../services/api';
import ClassificationResult from './ClassificationResult';
import { SAMPLE_COMPLAINTS } from '../../data/mockData';

export default function ComplaintClassifier({ onComplaintSubmitted }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const maxLength = 1000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter a complaint description.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setIsRegistered(false);

    try {
      const data = await classifyComplaint(text.trim());
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to classify complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setError(null);
    setResult(null);
    setIsRegistered(false);
  };

  const handleSelectSample = (sample) => {
    setText(sample);
    setError(null);
  };

  const handleRegisterComplaint = async () => {
    if (!result) return;
    try {
      const saved = await submitNewComplaint({
        text,
        category: result.category,
        confidence: result.confidence,
        department: result.department
      });
      setIsRegistered(true);
      if (onComplaintSubmitted) {
        onComplaintSubmitted(saved);
      }
    } catch (err) {
      console.error('Failed to register complaint:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Classifier Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Classify a New Complaint
              </h2>
              <p className="text-xs text-slate-500">
                Submit raw grievance text for real-time NLP classification & department routing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Endpoint: POST /api/classify</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
              <label htmlFor="complaint-input" className="text-slate-700">
                Complaint Description
              </label>
              <span className={`font-mono text-[11px] ${text.length > 900 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                {text.length}/{maxLength}
              </span>
            </div>

            <textarea
              id="complaint-input"
              rows={4}
              maxLength={maxLength}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter the complaint text here..."
              className="w-full p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-y"
            />
          </div>

          {/* Quick Sample Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick test samples:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_COMPLAINTS.slice(0, 5).map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200 transition-colors text-left truncate max-w-xs"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Button Toolbar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClear}
              disabled={loading || (!text && !result)}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>

            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Classifying with NLP...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Classify Complaint
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Result Card when response is received */}
      {result && (
        <ClassificationResult
          result={result}
          complaintText={text}
          onRegisterComplaint={handleRegisterComplaint}
          isRegistered={isRegistered}
        />
      )}
    </div>
  );
}
