import React from 'react';
import { StatusBadge } from '../common/Badge';
import { formatPHP, formatDate } from '../../utils/formatters';
import { Eye, ArrowUpDown } from 'lucide-react';

export const PaymentTable = ({ payments, onSelectPayment, sortBy, sortOrder, onSort }) => {
  if (!payments || payments.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No payment transaction records found.</p>
        <p className="text-xs text-slate-400 mt-1">Try broadening your search or date filters.</p>
      </div>
    );
  }

  const renderSortableHeader = (label, field) => (
    <th
      onClick={() => onSort(field)}
      className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none"
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <ArrowUpDown size={12} className={sortBy === field ? 'text-[#0786C5]' : 'opacity-40'} />
      </div>
    </th>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              {renderSortableHeader('Transaction ID', 'externalPaymentId')}
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order ID</th>
              {renderSortableHeader('Customer', 'customer')}
              {renderSortableHeader('Merchant', 'merchant')}
              {renderSortableHeader('Payment Date', 'paymentDate')}
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Method</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reference No.</th>
              {renderSortableHeader('Amount', 'amount')}
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {payments.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
              >
                <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{p.externalPaymentId}</td>
                <td className="px-4 py-3.5 font-semibold text-[#0786C5] dark:text-sky-400">
                  {p.externalOrderId || (p.order ? p.order.externalOrderId : 'N/A')}
                </td>
                <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                  {p.customerName || (p.order ? p.order.customerName : 'N/A')}
                </td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                  {p.merchantName || (p.merchant ? p.merchant.merchantName : 'TRAKZ Merchant')}
                </td>
                <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{formatDate(p.paymentDate)}</td>
                <td className="px-4 py-3.5 font-bold uppercase text-[10px] text-slate-600 dark:text-slate-400">
                  {p.paymentMethod}
                </td>
                <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-400">{p.referenceNumber}</td>
                <td className="px-4 py-3.5 font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                  {formatPHP(p.amount)}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <StatusBadge status={p.paymentStatus} />
                </td>
                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                  <button
                    onClick={() => onSelectPayment(p)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#0786C5] bg-sky-50 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300 dark:hover:bg-sky-900 transition-colors"
                  >
                    <Eye size={14} />
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
