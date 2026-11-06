import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/Badge';
import { formatPHP, formatDate } from '../../utils/formatters';
import { printElement } from '../../utils/export';
import { ThermalReceipt } from './ThermalReceipt';
import { printerService } from '../../services/printerService';
import { PrinterPairingModal } from '../common/PrinterPairingModal';
import { NotificationToast } from '../common/NotificationToast';
import { Printer, Store, User, ShoppingBag, Receipt, FileText, Settings, Bluetooth, Usb, RefreshCw } from 'lucide-react';

export const OrderDetailModal = ({ isOpen, onClose, order }) => {
  const [activeTab, setActiveTab] = useState('thermal');
  const [pairingModalOpen, setPairingModalOpen] = useState(false);
  const [printerStatus, setPrinterStatus] = useState(printerService.getStatus());
  const [isPrinting, setIsPrinting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const unsubscribe = printerService.subscribe((updated) => {
      setPrinterStatus(updated);
    });
    return () => unsubscribe();
  }, []);

  if (!order) return null;

  const handlePrintThermal = async () => {
    setIsPrinting(true);
    try {
      if (printerStatus.connectionType !== 'browser') {
        const isReady = await printerService.ensureConnected();
        if (!isReady) {
          setPairingModalOpen(true);
          setToast({
            message: `Please pair your ${printerStatus.connectionType.toUpperCase()} printer first.`,
            type: 'info',
          });
          return;
        }
      }

      const res = await printerService.printOrder(order);
      if (res.type !== 'browser') {
        setToast({
          message: `Receipt printed automatically via ESC/POS to ${printerStatus.deviceName || printerStatus.connectionType.toUpperCase()}!`,
          type: 'success',
        });
      }
    } catch (err) {
      setToast({
        message: `ESC/POS Print Error: ${err.message}`,
        type: 'error',
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintStandard = () => {
    printElement(`Order_${order.externalOrderId}`, 'printable-order-content');
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Sales Invoice / Order: ${order.externalOrderId}`} maxWidth="max-w-3xl">
        <div className="space-y-4">
          {/* View Mode Tabs & Quick Printer Status */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300">
              <button
                onClick={() => setActiveTab('thermal')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'thermal'
                    ? 'bg-white dark:bg-slate-900 text-[#0786C5] dark:text-sky-400 shadow-sm font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Receipt size={14} />
                Thermal POS Sales Invoice
              </button>
              <button
                onClick={() => setActiveTab('standard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'standard'
                    ? 'bg-white dark:bg-slate-900 text-[#0786C5] dark:text-sky-400 shadow-sm font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText size={14} />
                Full Order Details
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setPairingModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
                title="Configure Bluetooth / Web USB ESC/POS Printer"
              >
                {printerStatus.connectionType === 'bluetooth' ? (
                  <Bluetooth size={13} className="text-blue-500" />
                ) : printerStatus.connectionType === 'usb' ? (
                  <Usb size={13} className="text-emerald-500" />
                ) : (
                  <Printer size={13} className="text-purple-500" />
                )}
                <span className="capitalize">{printerStatus.connectionType} Mode</span>
                <Settings size={12} className="ml-0.5 text-slate-400" />
              </button>
              <StatusBadge status={order.paymentStatus} />
              <StatusBadge status={order.orderStatus} />
            </div>
          </div>

          {/* Tab 1: Thermal Receipt View */}
          {activeTab === 'thermal' && (
            <div className="space-y-4">
              <ThermalReceipt order={order} />
            </div>
          )}

          {/* Tab 2: Standard Detailed Specification View */}
          {activeTab === 'standard' && (
            <div id="printable-order-content" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Customer Box */}
                <div className="space-y-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                    <User size={16} className="text-[#0786C5]" />
                    Customer Information
                  </div>
                  <p><strong>Name:</strong> {order.customerName}</p>
                  <p><strong>Source Channel:</strong> {order.source || 'TRAKZ Mobile App'}</p>
                  <p><strong>Order Timestamp:</strong> {formatDate(order.orderDate)}</p>
                </div>

                {/* Merchant Box */}
                <div className="space-y-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                    <Store size={16} className="text-[#0786C5]" />
                    Merchant Partner Store
                  </div>
                  <p><strong>Store Name:</strong> {order.merchant ? order.merchant.merchantName : 'TRAKZ Merchant'}</p>
                  <p><strong>Merchant ID:</strong> {order.merchant ? order.merchant.externalMerchantId : 'N/A'}</p>
                  <p><strong>Synced At:</strong> {formatDate(order.syncedAt)}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <ShoppingBag size={16} className="text-[#0786C5]" />
                  Purchased Items & Quantities
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950 font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3">Product Name</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(order.orderItems || []).map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{item.productName}</td>
                          <td className="p-3 text-center font-bold">{item.quantity}</td>
                          <td className="p-3 text-right">{formatPHP(item.unitPrice)}</td>
                          <td className="p-3 text-right font-bold">{formatPHP(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="flex justify-end text-xs">
                <div className="w-full sm:w-72 space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatPHP(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Delivery Fee:</span>
                    <span className="font-semibold">{formatPHP(order.deliveryFee)}</span>
                  </div>
                  {parseFloat(order.convenienceFee || 0) > 0 && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Convenience Fee:</span>
                      <span className="font-semibold">{formatPHP(order.convenienceFee)}</span>
                    </div>
                  )}
                  {parseFloat(order.riderTip || 0) > 0 && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Rider's Tip:</span>
                      <span className="font-semibold">{formatPHP(order.riderTip)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>Discount:</span>
                    <span className="font-semibold">-{formatPHP(order.discount)}</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between font-extrabold text-sm text-slate-900 dark:text-white">
                    <span>Total Amount:</span>
                    <span className="text-[#0786C5] dark:text-sky-400">{formatPHP(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Action Footer */}
          <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrintThermal}
                disabled={isPrinting}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#0786C5] hover:bg-sky-600 shadow-sm transition-colors disabled:opacity-50"
              >
                {isPrinting ? <RefreshCw size={15} className="animate-spin" /> : <Printer size={15} />}
                Print Receipt ({printerStatus.connectionType.toUpperCase()})
              </button>

              <button
                onClick={() => setPairingModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                <Settings size={15} />
                Printer Pairing
              </button>

              {activeTab === 'standard' && (
                <button
                  onClick={handlePrintStandard}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  <Printer size={15} />
                  Print Standard Summary
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <PrinterPairingModal
        isOpen={pairingModalOpen}
        onClose={() => setPairingModalOpen(false)}
      />

      {toast && <NotificationToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};
