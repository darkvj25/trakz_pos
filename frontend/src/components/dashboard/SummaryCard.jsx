import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, CreditCard, RefreshCw } from 'lucide-react';
import { formatPHP } from '../../utils/formatters';

export const SummaryCard = ({ type, data, syncStatus }) => {
  if (type === 'revenue') {
    const isPositive = (data?.changePercent || 0) >= 0;
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Total Revenue
          </span>
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/80 text-[#0786C5] dark:text-sky-400 flex items-center justify-center font-bold">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatPHP(data?.total || 0)}
          </h3>

          <div className="flex items-center gap-2 pt-1 text-xs">
            <span
              className={`flex items-center font-bold ${
                isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isPositive ? <TrendingUp size={14} className="mr-0.5" /> : <TrendingDown size={14} className="mr-0.5" />}
              {Math.abs(data?.changePercent || 0)}%
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-medium">vs yesterday ({formatPHP(data?.yesterday || 0)})</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'orders') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Total Orders
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <ShoppingBag size={20} />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {(data?.total || 0).toLocaleString()}
          </h3>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Today: <strong className="text-slate-800 dark:text-slate-200">{data?.today || 0}</strong>
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <RefreshCw size={12} className="animate-spin-slow" /> Real-time sync
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'digital') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Digital Payments
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CreditCard size={20} />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {data?.percentage || 0}%
          </h3>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
            {data?.totalDigitalCount || 0} of {data?.totalCount || 0} total transactions
          </div>
        </div>
      </div>
    );
  }

  return null;
};
