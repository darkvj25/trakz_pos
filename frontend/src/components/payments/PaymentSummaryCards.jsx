import React from 'react';
import { CreditCard, CheckCircle2, Clock, XCircle, DollarSign } from 'lucide-react';
import { formatPHP } from '../../utils/formatters';

export const PaymentSummaryCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Payments',
      value: (stats?.totalPayments || 0).toLocaleString(),
      icon: CreditCard,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
    },
    {
      title: 'Successful Payments',
      value: (stats?.successfulPayments || 0).toLocaleString(),
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    },
    {
      title: 'Pending Payments',
      value: (stats?.pendingPayments || 0).toLocaleString(),
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    },
    {
      title: 'Failed Payments',
      value: (stats?.failedPayments || 0).toLocaleString(),
      icon: XCircle,
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
    },
    {
      title: 'Total Collected',
      value: formatPHP(stats?.totalCollectedAmount || 0),
      icon: DollarSign,
      color: 'bg-sky-50 text-[#0786C5] dark:bg-sky-950 dark:text-sky-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {c.title}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{c.value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${c.color}`}>
              <Icon size={20} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
