import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { formatPHP } from '../../utils/formatters';
import { calculateOrderTotalDetails } from '../../utils/riderFeeMatrix';
import { Plus, Trash2, ShoppingCart, User, CreditCard, HeartHandshake } from 'lucide-react';

export const CreateOrderModal = ({ isOpen, onClose, onCreateOrder }) => {
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('GCASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [deliveryDistance, setDeliveryDistance] = useState(3.5);
  const [discount, setDiscount] = useState(0);
  const [riderTip, setRiderTip] = useState(25);
  const [items, setItems] = useState([
    { productName: 'Wireless Barcode Scanner', quantity: 1, unitPrice: 1500, sku: 'SCN-01', category: 'NON_FOOD_RETAIL' },
    { productName: '80mm Thermal Paper Roll', quantity: 2, unitPrice: 150, sku: 'PPR-80', category: 'NON_FOOD_RETAIL' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.unitPrice) || 0) * (parseInt(item.quantity, 10) || 1), 0);
  const breakdown = calculateOrderTotalDetails(subtotal, deliveryDistance, discount, riderTip);

  const handleAddItem = () => {
    setItems([
      ...items,
      { productName: 'New Retail Item', quantity: 1, unitPrice: 100, sku: `ITEM-${items.length + 1}`, category: 'NON_FOOD_RETAIL' },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreateOrder({
        customerName: customerName || 'Walk-in Customer',
        paymentMethod,
        referenceNumber,
        deliveryDistance: parseFloat(deliveryDistance) || 0,
        discount: parseFloat(discount) || 0,
        riderTip: parseFloat(riderTip) || 0,
        items: items.map((it) => ({
          ...it,
          quantity: parseInt(it.quantity, 10) || 1,
          unitPrice: parseFloat(it.unitPrice) || 0,
        })),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Sales Transaction" maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer & Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <User size={13} className="text-[#0786C5]" /> Customer Name
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Maria Clara"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0786C5]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <CreditCard size={13} className="text-[#0786C5]" /> Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0786C5]"
            >
              <option value="GCASH">GCASH</option>
              <option value="CASH">CASH</option>
              <option value="CREDIT_CARD">CREDIT CARD</option>
              <option value="DEBIT_CARD">DEBIT CARD</option>
              <option value="ONLINE_PAYMENT">ONLINE PAYMENT</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Reference Number (Optional)
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Auto-generated if empty"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0786C5]"
            />
          </div>
        </div>

        {/* Order Items Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
            <span className="flex items-center gap-1.5">
              <ShoppingCart size={15} className="text-[#0786C5]" />
              Cart Items & Quantities
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-[#0786C5] hover:bg-sky-600 transition-colors"
            >
              <Plus size={13} />
              Add Item
            </button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-2.5">Product Name</th>
                  <th className="p-2.5 w-20 text-center">Qty</th>
                  <th className="p-2.5 w-28 text-right">Unit Price (₱)</th>
                  <th className="p-2.5 w-28 text-right">Subtotal</th>
                  <th className="p-2.5 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.productName}
                        onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        required
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full p-1.5 text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        required
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className="w-full p-1.5 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        required
                      />
                    </td>
                    <td className="p-2 text-right font-bold text-slate-800 dark:text-slate-200">
                      {formatPHP((parseFloat(item.unitPrice) || 0) * (parseInt(item.quantity, 10) || 1))}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length <= 1}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg disabled:opacity-30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Matrix & Tip Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Delivery Distance (km)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={deliveryDistance}
              onChange={(e) => setDeliveryDistance(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Calculates delivery fee tier automatically.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1 text-[#0786C5]">
              <HeartHandshake size={14} /> Rider's Tip (₱)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={riderTip}
              onChange={(e) => setRiderTip(e.target.value)}
              placeholder="0.00"
              className="w-full p-2.5 font-bold border-2 border-sky-400 dark:border-sky-600 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0786C5]"
            />
            <p className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold mt-1">
              Shows on transaction & printed/digital receipt!
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Discount (₱)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Total Calculations Summary */}
        <div className="flex justify-end text-xs">
          <div className="w-full sm:w-80 space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Items Subtotal:</span>
              <span className="font-semibold">{formatPHP(breakdown.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Delivery Fee ({breakdown.riderFeeDetails?.tierLabel || 'N/A'}):</span>
              <span className="font-semibold">{formatPHP(breakdown.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Convenience Fee:</span>
              <span className="font-semibold">{formatPHP(breakdown.convenienceFee)}</span>
            </div>
            {breakdown.riderTip > 0 && (
              <div className="flex justify-between text-sky-600 dark:text-sky-400 font-bold">
                <span>Rider's Tip:</span>
                <span>{formatPHP(breakdown.riderTip)}</span>
              </div>
            )}
            {breakdown.discount > 0 && (
              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <span>Discount:</span>
                <span className="font-semibold">-{formatPHP(breakdown.discount)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between font-extrabold text-sm text-slate-900 dark:text-white">
              <span>Grand Total:</span>
              <span className="text-[#0786C5] dark:text-sky-400">{formatPHP(breakdown.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0786C5] hover:bg-sky-600 transition-colors disabled:opacity-50 shadow-md"
          >
            {isSubmitting ? 'Creating Transaction...' : 'Complete & Process Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
