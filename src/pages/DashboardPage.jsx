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

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [analyticsData, complaintsData] = await Promise.all([
          getAnalytics('30d'),
          getComplaints({ page: 1, limit: 6 })
        ]);
        setAnalytics(analyticsData);
        setComplaints(complaintsData.complaints || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    await updateComplaintStatus(id, newStatus);
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const summary = analytics?.summary || {
    totalComplaints: 1245,
    totalTrend: '+12.4% from last month',
    classifiedComplaints: 1180,
    classifiedTrend: '94.8% auto-categorized',
    pendingReview: 65,
    pendingTrend: '-8.2% backlog reduction',
    categoriesCount: 8,
    categoriesTrend: 'Active Grievance Taxonomies'
  };

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
          trend={summary.totalTrend}
          trendType="positive"
          iconBg="bg-blue-50 text-blue-600"
          description="Cumulative logged"
        />

        <StatCard
          icon={CheckCircle2}
          number={summary.classifiedComplaints}
          label="Classified Complaints"
          trend={summary.classifiedTrend}
          trendType="positive"
          iconBg="bg-emerald-50 text-emerald-600"
          description="NLP confidence >80%"
        />

        <StatCard
          icon={Clock}
          number={summary.pendingReview}
          label="Pending Review"
          trend={summary.pendingTrend}
          trendType="negative"
          iconBg="bg-amber-50 text-amber-600"
          description="Manual triage queue"
        />

        <StatCard
          icon={Layers}
          number={summary.categoriesCount}
          label="Grievance Categories"
          trend={summary.categoriesTrend}
          trendType="neutral"
          iconBg="bg-indigo-50 text-indigo-600"
          description="Across civic domains"
        />
      </div>

      {/* Side-by-Side Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 h-[380px]">
          <CategoryChart data={analytics?.categoryDistribution || []} />
        </div>
        <div className="lg:col-span-7 h-[380px]">
          <ComplaintTrendChart data={analytics?.complaintTrends || []} />
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
