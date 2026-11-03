import React, { useState } from 'react';
import { StatusBadge } from '../common/Badge';
import { formatPHP, formatDate } from '../../utils/formatters';
import { printerService } from '../../services/printerService';
import { NotificationToast } from '../common/NotificationToast';
import { Eye, ArrowUpDown, Printer } from 'lucide-react';

export const OrderTable = ({ orders, onSelectOrder, sortBy, sortOrder, onSort }) => {
  const [toast, setToast] = useState(null);

  const handleQuickPrint = async (e, order) => {
    e.stopPropagation();
    try {
      const isReady = await printerService.ensureConnected();
      const status = printerService.getStatus();
      if (status.connectionType !== 'browser' && !isReady) {
        onSelectOrder(order); // Open detail modal for pairing
        return;
      }
      const res = await printerService.printOrder(order);
      if (res.type !== 'browser') {
        setToast({ message: `Receipt ${order.externalOrderId} sent to thermal printer!`, type: 'success' });
      }
    } catch (err) {
      setToast({ message: `Print failed: ${err.message}`, type: 'error' });
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No order records found.</p>
        <p className="text-xs text-slate-400 mt-1">Try resetting search filters or refreshing sync data.</p>
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
              {renderSortableHeader('Order ID', 'externalOrderId')}
              {renderSortableHeader('Customer Name', 'customerName')}
              {renderSortableHeader('Merchant / Store', 'merchant')}
              {renderSortableHeader('Order Date', 'orderDate')}
              <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">Items</th>
              {renderSortableHeader('Total Amount', 'totalAmount')}
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Method</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payment Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order Status</th>
              <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {orders.map((o) => (
              <tr
                key={o.id}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
              >
                <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{o.externalOrderId}</td>
                <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">{o.customerName}</td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                  {o.merchant ? o.merchant.merchantName : 'TRAKZ Merchant'}
                </td>
                <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{formatDate(o.orderDate)}</td>
                <td className="px-4 py-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                  {o.itemCount || (o.orderItems ? o.orderItems.length : 0)}
                </td>
                <td className="px-4 py-3.5 font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                  {formatPHP(o.totalAmount)}
                </td>
                <td className="px-4 py-3.5 font-medium text-slate-600 dark:text-slate-400 uppercase text-[10px]">
                  {o.paymentMethod || 'N/A'}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <StatusBadge status={o.paymentStatus} />
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <StatusBadge status={o.orderStatus} />
                </td>
                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={(e) => handleQuickPrint(e, o)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900 transition-colors"
                      title="Quick Print ESC/POS Receipt"
                    >
                      <Printer size={13} />
                      Print
                    </button>
                    <button
                      onClick={() => onSelectOrder(o)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#0786C5] bg-sky-50 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300 dark:hover:bg-sky-900 transition-colors"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {toast && <NotificationToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
