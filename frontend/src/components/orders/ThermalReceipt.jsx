import React, { useState, useEffect } from 'react';
import { formatDate } from '../../utils/formatters';
import { receiptService } from '../../services/receiptService';

export const ThermalReceipt = ({ order }) => {
  const [config, setConfig] = useState(receiptService.getConfig());

  useEffect(() => {
    const unsubscribe = receiptService.subscribe((updated) => {
      setConfig(updated);
    });
    return () => unsubscribe();
  }, []);

  if (!order) return null;

  const totalAmount = parseFloat(order.totalAmount || 0);
  const subtotal = parseFloat(order.subtotal || totalAmount);
  const deliveryFee = parseFloat(order.deliveryFee || 0);
  const convenienceFee = parseFloat(order.convenienceFee || 0);
  const discount = parseFloat(order.discount || 0);

  // Philippine BIR 12% VAT calculation math
  const vatableSales = totalAmount > 0 ? (totalAmount / 1.12).toFixed(2) : '0.00';
  const vatAmount = totalAmount > 0 ? (totalAmount - parseFloat(vatableSales)).toFixed(2) : '0.00';

  const totalItemsCount = (order.orderItems || []).reduce((acc, item) => acc + item.quantity, 0);

  // Generate deterministic transaction / receipt numbers based on Order ID
  const storeCode = order.merchant?.externalMerchantId || 'TZ1076';
  const rawIdNum = (order.externalOrderId || '0000').replace(/[^0-9]/g, '').padEnd(8, '0').slice(-8);
  const siNumber = `05-${rawIdNum}`;
  const transNumber = `1076 ${rawIdNum}`;
  const trakzRef = `TZ-${rawIdNum.slice(-4)}`;

  const storeName = config.storeName || order.merchant?.merchantName || 'MALAYBALAY SUPER FOODS CORP.';

  return (
    <div className="w-full flex justify-center bg-slate-200 dark:bg-slate-950 p-4 rounded-xl overflow-x-auto">
      {/* 80mm Thermal Receipt Simulation Container */}
      <div
        id="thermal-receipt-container"
        className="w-[320px] bg-white text-black p-4 shadow-2xl font-mono text-[11px] leading-tight selection:bg-slate-300"
        style={{ fontFamily: "'Courier New', Courier, monospace" }}
      >
        {/* Merchant Store Header */}
        <div className="text-center space-y-0.5 uppercase">
          <p className="font-extrabold text-[12px] tracking-wide">
            {storeName}
          </p>
          {config.addressLine1 && <p className="text-[10px]">{config.addressLine1}</p>}
          {config.addressLine2 && <p className="text-[10px]">{config.addressLine2}</p>}
          {config.vatTin && (
            <p className="text-[10px]">
              {config.vatTin.startsWith('VAT') ? config.vatTin : `VAT Reg TIN: ${config.vatTin}`}
            </p>
          )}
          {config.serialNo && (
            <p className="text-[10px]">
              {config.serialNo.startsWith('POS') ? config.serialNo : `POS05-SN: ${config.serialNo}`}
            </p>
          )}
          {config.minNumber && (
            <p className="text-[10px]">
              {config.minNumber.startsWith('MIN') ? config.minNumber : `MIN# ${config.minNumber}`}
            </p>
          )}
          <p className="font-bold pt-1">{storeCode}</p>
          <p className="font-extrabold text-[13px] tracking-widest pt-0.5">
            {config.headerTitle || 'SALES INVOICE'}
          </p>
          <p className="font-bold text-[11px]">{config.subHeaderTitle || 'CUSTOMER COPY'}</p>
        </div>

        {/* Invoice Identifiers */}
        <div className="mt-2 text-left uppercase space-y-0.5">
          <p className="font-bold text-[12px]">SI# {siNumber}</p>
          <p>Trans# {transNumber}</p>
          <p>Cashier: 10762021-RUBY PAUCAN</p>
        </div>

        {/* Double Line Separator */}
        <p className="my-1 text-center font-bold overflow-hidden select-none whitespace-nowrap">
          ====================================
        </p>

        {/* Date, Time & Station Queue Number */}
        <div className="flex justify-between font-bold text-[11px]">
          <span>{formatDate(order.orderDate)}</span>
          <span>#{rawIdNum.slice(-2)}</span>
        </div>

        {/* Channel Header (TRAKZ) */}
        <p className="my-1 text-center font-bold overflow-hidden select-none whitespace-nowrap">
          ====================================
        </p>
        <p className="text-center font-extrabold tracking-widest text-[12px]">
          -------- TRAKZ --------
        </p>

        {/* Line Items */}
        <div className="mt-2 space-y-1.5">
          {(order.orderItems || []).map((item, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex justify-between font-bold">
                <span className="uppercase">
                  {item.quantity} {item.productName}
                </span>
                <span>{parseFloat(item.subtotal || 0).toFixed(2)}V</span>
              </div>
              <p className="pl-4 text-[10px] text-gray-700 uppercase">
                {item.quantity} ORIGINAL CHOICE
              </p>
            </div>
          ))}

          {/* Delivery Fee line if present */}
          {deliveryFee > 0 && (
            <div className="flex justify-between">
              <span className="uppercase">1 DELIVERY FEE</span>
              <span>{deliveryFee.toFixed(2)}V</span>
            </div>
          )}

          {/* Convenience Fee line if present */}
          {convenienceFee > 0 && (
            <div className="flex justify-between">
              <span className="uppercase">1 CONVENIENCE FEE</span>
              <span>{convenienceFee.toFixed(2)}V</span>
            </div>
          )}

          {/* Discount line if present */}
          {discount > 0 && (
            <div className="flex justify-between font-bold">
              <span className="uppercase">LESS: DISCOUNT</span>
              <span>-{discount.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Items Count & Subtotal Line */}
        <div className="mt-3 pt-1 border-t border-dashed border-black">
          <div className="flex justify-between font-bold">
            <span>{totalItemsCount} Item(s)</span>
            <span>Subtotal PHP {subtotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Total Due Section */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between items-baseline font-black text-[13px]">
            <span>TOTAL DUE</span>
            <span>PHP {totalAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-bold text-[11px] pt-1">
            <span>TRAKZ# {trakzRef}</span>
            <span>{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* BIR Tax Breakdown */}
        <div className="mt-3 pt-2 border-t border-dotted border-black space-y-0.5 text-[10px]">
          <div className="flex justify-between">
            <span>VATable Sales</span>
            <span>{vatableSales}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT Amount</span>
            <span>{vatAmount}</span>
          </div>
          <div className="flex justify-between">
            <span>Zero-Rated Sales</span>
            <span>0.00</span>
          </div>
          <div className="flex justify-between">
            <span>VAT-Exempt Sales</span>
            <span>0.00</span>
          </div>
        </div>

        {/* Order Details Asterisk Divider */}
        <p className="my-2 text-center font-bold overflow-hidden select-none whitespace-nowrap">
          ************************************
        </p>

        {/* TRAKZ Order Metadata */}
        <div className="space-y-0.5 text-[10px] uppercase">
          <p className="font-bold">Order #{order.externalOrderId}</p>
          <p>Start time: {new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(order.orderDate))}</p>
          <p>Name: {order.customerName}</p>
          <div className="flex justify-between">
            <span>Address:</span>
            <span>Grid: 0</span>
          </div>
          <p>Not applicable</p>
          <p>Contact Number: Not applicable</p>
          <p>Remarks: [D4]</p>
        </div>

        {/* Asterisk Footer Divider */}
        <p className="my-2 text-center font-bold overflow-hidden select-none whitespace-nowrap">
          ************************************
        </p>

        {/* Charge & Signature Footer */}
        <div className="space-y-1 text-[10px] uppercase pt-1">
          <p className="font-bold">Charge To : {trakzRef}</p>
          <p className="pt-2">Signature : _______________________</p>
        </div>

        {/* Custom Notice Description if set */}
        {config.customNotice && (
          <div className="mt-3 pt-2 border-t border-dashed border-black text-center text-[9px] uppercase font-semibold text-gray-800">
            <p>{config.customNotice}</p>
          </div>
        )}

        <div className="mt-3 text-center text-[9px] font-bold text-gray-700">
          {config.footerLine1 && <p>{config.footerLine1}</p>}
          {config.footerLine2 && <p>{config.footerLine2}</p>}
        </div>
      </div>
    </div>
  );
};
