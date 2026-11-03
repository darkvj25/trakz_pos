import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatPHP } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
        <p className="font-bold text-slate-300">{label}</p>
        <p className="font-semibold text-sky-400">Revenue: {formatPHP(payload[0].value)}</p>
        {payload[0].payload.orders !== undefined && (
          <p className="text-slate-400">Orders: {payload[0].payload.orders}</p>
        )}
      </div>
    );
  }
  return null;
};

export const RevenueChart = ({ data, period, setPeriod }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Analytics</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Financial performance overview & transaction trends
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 self-start sm:self-auto">
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                period === p
                  ? 'bg-white dark:bg-slate-900 text-[#0786C5] dark:text-sky-400 shadow-sm'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-72 w-full pt-4">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0786C5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0786C5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(val) => `₱${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0786C5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No analytics data available for selected period.
          </div>
        )}
      </div>
    </div>
  );
};
