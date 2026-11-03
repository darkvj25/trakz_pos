import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, CreditCard, RefreshCw, RotateCcw } from 'lucide-react';

export const QuickNavCard = ({ onManualSync, onResetDemo, isSyncing, isOnline }) => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Order History',
      subtitle: 'View & filter all order details',
      icon: ShoppingBag,
      onClick: () => navigate('/orders'),
      color: 'bg-sky-50 text-[#0786C5] dark:bg-sky-950 dark:text-sky-400',
    },
    {
      title: 'Payment History',
      subtitle: 'Audit transaction records & ref IDs',
      icon: CreditCard,
      onClick: () => navigate('/payments'),
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
    },
    {
      title: 'Manual Sync',
      subtitle: 'Fetch latest updates from TRAKZ',
      icon: RefreshCw,
      onClick: onManualSync,
      disabled: isSyncing || !isOnline,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    },
    {
      title: 'Reset Demo Data',
      subtitle: 'Re-initialize local seed data',
      icon: RotateCcw,
      onClick: onResetDemo,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Quick Management Actions
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              onClick={act.onClick}
              disabled={act.disabled}
              className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-800 bg-white dark:bg-slate-900 hover:shadow-md transition-all text-left flex items-start gap-3.5 group disabled:opacity-50"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${act.color}`}
              >
                <Icon size={20} className={act.title === 'Manual Sync' && isSyncing ? 'animate-spin' : ''} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0786C5] dark:group-hover:text-sky-400 transition-colors">
                  {act.title}
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                  {act.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
