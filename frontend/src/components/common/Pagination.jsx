import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage, totalPages, onPageChange, totalRecords, limit }) => {
  if (totalPages <= 1 && totalRecords <= limit) return null;

  const startRecord = (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, totalRecords);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-xs text-slate-500 dark:text-slate-400">
      <div>
        Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{startRecord}</span> to{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{endRecord}</span> of{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{totalRecords}</span> records
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="px-3 py-1 font-medium text-slate-700 dark:text-slate-300">
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
