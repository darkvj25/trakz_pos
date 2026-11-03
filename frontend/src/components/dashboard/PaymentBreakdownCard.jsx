import React from 'react';
import { CreditCard, Smartphone, Banknote, Globe } from 'lucide-react';
import { formatPHP } from '../../utils/formatters';

export const PaymentBreakdownCard = ({ breakdown }) => {
  const methods = [
    {
      key: 'gcash',
      label: 'GCash',
      icon: Smartphone,
      color: 'bg-sky-50 text-[#0786C5] dark:bg-sky-950 dark:text-sky-400',
      data: breakdown?.gcash || { amount: 0, count: 0 },
    },
    {
      key: 'cards',
      label: 'Credit / Debit Cards',
      icon: CreditCard,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
      data: breakdown?.cards || { amount: 0, count: 0 },
    },
    {
      key: 'cash',
      label: 'Cash Payments',
      icon: Banknote,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
      data: breakdown?.cash || { amount: 0, count: 0 },
    },
    {
      key: 'otherOnline',
      label: 'Other Online Channels',
      icon: Globe,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
      data: breakdown?.otherOnline || { amount: 0, count: 0 },
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
        Payment Methods Breakdown
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {methods.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.key}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{m.label}</span>
                <p className="text-base font-bold text-slate-900 dark:text-white">{formatPHP(m.data.amount)}</p>
                <p className="text-[11px] text-slate-400">{m.data.count} transactions</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${m.color}`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
