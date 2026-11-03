import React from 'react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/Badge';
import { formatPHP, formatDate } from '../../utils/formatters';
import { printElement } from '../../utils/export';
import { Printer, CreditCard, Hash, Store, User, FileText } from 'lucide-react';

export const PaymentDetailModal = ({ isOpen, onClose, payment }) => {
  if (!payment) return null;

  const handlePrint = () => {
    printElement(`Payment_${payment.externalPaymentId}`, 'printable-payment-content');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Payment Specification: ${payment.externalPaymentId}`} maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Print Content Wrapper */}
        <div id="printable-payment-content" className="space-y-6">
          {/* Amount & Status Header */}
          <div className="p-6 rounded-2xl bg-gradient-to-tr from-[#0786C5] to-sky-500 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div>
              <span className="text-xs uppercase font-semibold text-sky-100">Total Amount Collected</span>
              <h2 className="text-3xl font-extrabold tracking-tight">{formatPHP(payment.amount)}</h2>
            </div>
            <div>
              <StatusBadge status={payment.paymentStatus} />
            </div>
          </div>

          {/* Key Reference Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <CreditCard size={14} className="text-[#0786C5]" />
                Payment Method & Reference
              </div>
              <p><strong>Method:</strong> {payment.paymentMethod}</p>
              <p><strong>Reference No:</strong> <span className="font-mono font-bold">{payment.referenceNumber}</span></p>
              <p><strong>Payment Date:</strong> {formatDate(payment.paymentDate)}</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <Hash size={14} className="text-[#0786C5]" />
                System Identifiers
              </div>
              <p><strong>Transaction ID:</strong> {payment.externalPaymentId}</p>
              <p><strong>Internal DB ID:</strong> <span className="font-mono">{payment.id}</span></p>
              <p><strong>Related Order ID:</strong> {payment.externalOrderId || (payment.order ? payment.order.externalOrderId : 'N/A')}</p>
            </div>
          </div>

          {/* Customer & Merchant Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <User size={14} className="text-[#0786C5]" />
                Customer
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {payment.customerName || (payment.order ? payment.order.customerName : 'N/A')}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Store size={14} className="text-[#0786C5]" />
                Merchant Store
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {payment.merchantName || (payment.merchant ? payment.merchant.merchantName : 'TRAKZ Merchant')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            <Printer size={16} />
            Print Transaction Details
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0786C5] hover:bg-sky-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
