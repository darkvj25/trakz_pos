import React from 'react';

export const StatusBadge = ({ status }) => {
  const getStyles = (st) => {
    switch (st?.toUpperCase()) {
      case 'PAID':
      case 'SUCCESSFUL':
      case 'DELIVERED':
      case 'COMPLETED':
      case 'ACTIVE':
      case 'SUCCESS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800';
      case 'PENDING':
      case 'IN_TRANSIT':
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800';
      case 'FAILED':
      case 'CANCELLED':
      case 'REFUNDED':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStyles(
        status
      )}`}
    >
      {status ? status.replace('_', ' ') : 'N/A'}
    </span>
  );
};
