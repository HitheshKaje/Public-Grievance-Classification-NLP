// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/common/StatCard';
import CategoryChart from '../components/charts/CategoryChart';
import ComplaintTrendChart from '../components/charts/ComplaintTrendChart';
import RecentComplaints from '../components/dashboard/RecentComplaints';
import ComplaintDetailModal from '../components/complaints/ComplaintDetailModal';
import { getAnalytics, getComplaints, updateComplaintStatus } from '../services/api';

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      const [analyticsData, complaintsData] = await Promise.all([
        getAnalytics(30),
        getComplaints({ page: 1, limit: 6 })
      ]);
      setAnalytics(analyticsData);
      setComplaints(complaintsData.complaints || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Unable to connect to the grievance service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData();
    }, 10000); // 10 seconds polling

    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    // In a real app we'd call an API here.
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint((prev) => ({ ...prev, status: newStatus }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-[380px] bg-slate-200 rounded-xl"></div>
          <div className="lg:col-span-7 h-[380px] bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-200 mt-6">
        <p className="font-semibold">{error}</p>
        <button onClick={() => { setLoading(true); loadDashboardData(); }} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  const summary = {
    totalComplaints: analytics?.total_complaints || 0,
    classifiedComplaints: analytics?.classified_complaints || 0,
    pendingReview: analytics?.pending_review || 0,
    categoriesCount: analytics?.category_count || 0
  };

  const CATEGORY_COLORS = {
    'Water Supply': '#3b82f6',
    'Infrastructure': '#8b5cf6',
    'Electricity': '#eab308',
    'Sanitation': '#10b981',
    'Public Safety': '#ef4444',
    'Civic Services': '#f97316',
    'Transport': '#0ea5e9',
    'Others': '#94a3b8'
  };

  const chartData = (analytics?.category_distribution || []).map(item => ({
    name: item.category || 'Unclassified',
    value: item.count,
    color: CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Others']
  }));

  return (
    <div className="space-y-6">
      {/* Banner / Notice */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
              Department Portal
            </span>
            <span className="text-xs text-blue-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
              National Grievance Redressal Standard
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Automated Grievance Classification Engine
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
            Real-time citizen grievance intake, NLP categorization, and automated department routing with high confidence assurance.
          </p>
        </div>

        <Link
          to="/classify"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-sm transition-all flex-shrink-0"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          Classify New Complaint
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          icon={FileText}
          number={summary.totalComplaints}
          label="Total Complaints"
          iconBg="bg-blue-50 text-blue-600"
          description="Cumulative logged"
        />

        <StatCard
          icon={CheckCircle2}
          number={summary.classifiedComplaints}
          label="Classified Complaints"
          iconBg="bg-emerald-50 text-emerald-600"
          description="NLP categorized"
        />

        <StatCard
          icon={Clock}
          number={summary.pendingReview}
          label="Pending Review"
          iconBg="bg-amber-50 text-amber-600"
          description="Manual triage queue"
        />

        <StatCard
          icon={Layers}
          number={summary.categoriesCount}
          label="Grievance Categories"
          iconBg="bg-indigo-50 text-indigo-600"
          description="Across civic domains"
        />
      </div>

      {/* Side-by-Side Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 h-[380px]">
          {summary.totalComplaints === 0 ? (
            <div className="h-full bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-500">
              No grievance data available
            </div>
          ) : (
            <CategoryChart data={chartData} />
          )}
        </div>
        <div className="lg:col-span-7 h-[380px]">
          {summary.totalComplaints === 0 ? (
            <div className="h-full bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-500">
              No grievance data available
            </div>
          ) : (
            <ComplaintTrendChart data={analytics?.complaint_trend || []} />
          )}
        </div>
      </div>

      {/* Recent Complaints Section */}
      <RecentComplaints
        complaints={complaints}
        onSelectComplaint={(complaint) => setSelectedComplaint(complaint)}
      />

      {/* Detailed Complaint Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
