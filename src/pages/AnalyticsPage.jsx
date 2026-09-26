// src/pages/AnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Clock,
  Layers,
  FileText
} from 'lucide-react';
import { getAnalytics } from '../services/api';
import CategoryChart from '../components/charts/CategoryChart';
import ComplaintTrendChart from '../components/charts/ComplaintTrendChart';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getAnalytics(timeRange);
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [timeRange]);

  const categoryDistribution = analytics?.categoryDistribution || [];
  const statusBreakdown = analytics?.statusBreakdown || [
    { status: 'Resolved', count: 780, color: '#10B981' },
    { status: 'In Progress', count: 310, color: '#3B82F6' },
    { status: 'Under Review', count: 90, color: '#F59E0B' },
    { status: 'Pending', count: 65, color: '#EF4444' },
  ];

  const totalComplaints = categoryDistribution.reduce((acc, c) => acc + c.value, 0) || 1245;
  const resolvedCount = statusBreakdown.find((s) => s.status === 'Resolved')?.count || 780;
  const resolutionRate = Math.round((resolvedCount / totalComplaints) * 100);

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Grievance Analytics & Redressal Metrics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated operational indicators, category volumes, and citizen redressal trends
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="ytd">Year to Date (2026)</option>
          </select>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Complaints</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalComplaints.toLocaleString()}</p>
            <span className="text-[11px] text-emerald-600 font-medium">Logged in portal</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Resolution Rate</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{resolutionRate}%</p>
            <span className="text-[11px] text-emerald-600 font-medium">{resolvedCount} grievances resolved</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Backlog</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">155</p>
            <span className="text-[11px] text-amber-600 font-medium">Pending or under review</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Highest Volume</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">Water Supply</p>
            <span className="text-[11px] text-sky-600 font-medium">19.3% of total inflow</span>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Row 1: Category Distribution (Donut) & Complaint Trends (Line) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 h-[390px]">
          <CategoryChart data={categoryDistribution} />
        </div>
        <div className="lg:col-span-7 h-[390px]">
          <ComplaintTrendChart data={analytics?.complaintTrends || []} />
        </div>
      </div>

      {/* Row 2: Category-wise Complaint Counts (Bar Chart) & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category-wise Complaint Counts Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Category-wise Complaint Counts
              </h3>
              <p className="text-xs text-slate-500">
                Total grievances classified per public service sector
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Absolute Count
            </span>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryDistribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value} complaints`, 'Volume']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  fill="#2563EB"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color || '#2563EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Card */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Status Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Resolution workflow breakdown of recorded grievances
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {statusBreakdown.map((item) => {
                const pct = Math.round((item.count / totalComplaints) * 100);
                return (
                  <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.status}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono">{item.count}</span>
                        <span className="font-bold text-slate-800 w-10 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 mt-4 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Average resolution time currently stands at <strong>3.2 business days</strong>.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
