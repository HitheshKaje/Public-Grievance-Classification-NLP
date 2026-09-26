// src/components/charts/CategoryChart.jsx
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function CategoryChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = item.percentage || Math.round((item.value / total) * 1000) / 10;
      return (
        <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg border border-slate-700">
          <div className="font-semibold text-slate-100 flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.name}
          </div>
          <div className="mt-1 text-slate-300">
            Complaints: <span className="font-bold text-white">{item.value.toLocaleString()}</span>
          </div>
          <div className="text-blue-400 font-medium">
            Share: {pct}%
          </div>
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
            Grievance Category Distribution
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown across municipal public services
          </p>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
          8 Categories
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center flex-1 mt-2">
        {/* Donut Chart Container */}
        <div className="md:col-span-6 h-60 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={92}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={1}
                stroke="#ffffff"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Donut Center Total Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total</span>
            <span className="text-xl font-bold text-slate-900">{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Categories Legend with Percentages */}
        <div className="md:col-span-6 space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {data.map((cat) => {
            const pct = cat.percentage || Math.round((cat.value / total) * 100);
            return (
              <div
                key={cat.name}
                className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium text-slate-700 truncate">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-slate-500 font-mono text-[11px]">{cat.value}</span>
                  <span className="font-semibold text-slate-900 w-10 text-right">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
