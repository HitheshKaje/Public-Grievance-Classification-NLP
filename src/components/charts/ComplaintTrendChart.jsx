// src/components/charts/ComplaintTrendChart.jsx
import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function ComplaintTrendChart({ data = [] }) {
  const [timeRange, setTimeRange] = useState('30');

  // Filter data according to dropdown selection
  const filteredData = React.useMemo(() => {
    const days = parseInt(timeRange, 10);
    if (days >= data.length) return data;
    return data.slice(-days);
  }, [data, timeRange]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg border border-slate-700 space-y-1">
          <p className="font-semibold text-slate-200 border-b border-slate-700 pb-1">
            {label}, 2026
          </p>
          <div className="flex items-center justify-between gap-4 text-blue-400">
            <span>Total Inflow:</span>
            <span className="font-bold text-white">{payload[0]?.value}</span>
          </div>
          {payload[1] && (
            <div className="flex items-center justify-between gap-4 text-emerald-400">
              <span>Auto-Classified:</span>
              <span className="font-bold text-white">{payload[1]?.value}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Complaints Trend
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily citizen grievance intake volume
          </p>
        </div>

        {/* Time range dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="7">Last 7 Days</option>
            <option value="14">Last 14 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Line / Area Chart Container */}
      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorClassified" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="complaints"
              name="Total Complaints"
              stroke="#2563EB"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorComplaints)"
            />
            <Area
              type="monotone"
              dataKey="classified"
              name="Auto Classified"
              stroke="#10B981"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorClassified)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-blue-600 rounded-full" />
          <span className="text-slate-600 font-medium">Total Complaints</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-emerald-500 rounded-full border-dashed" />
          <span className="text-slate-600 font-medium">Auto-Classified</span>
        </div>
      </div>
    </div>
  );
}
