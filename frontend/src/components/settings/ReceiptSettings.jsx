import React, { useState, useEffect } from 'react';
import { receiptService, DEFAULT_RECEIPT_CONFIG } from '../../services/receiptService';
import { FileText, Save, RotateCcw, Building, MapPin, Receipt, ShieldCheck, MessageSquare, Lock } from 'lucide-react';
import { NotificationToast } from '../common/NotificationToast';

export const ReceiptSettings = () => {
  const [form, setForm] = useState(receiptService.getConfig());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const unsubscribe = receiptService.subscribe((updated) => {
      setForm(updated);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    receiptService.saveConfig(form);
    setToast({
      message: 'Receipt descriptions and header settings saved successfully!',
      type: 'success',
    });
  };

  const handleReset = () => {
    const reset = receiptService.resetToDefault();
    setForm(reset);
    setToast({
      message: 'Reset receipt layout to default BIR configuration.',
      type: 'info',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-[#0786C5] shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Receipt Template & Description Settings
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Customize business header, BIR tax TIN registration, custom terms, description notes, and footer lines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw size={14} />
            Reset Defaults
          </button>

          <button
            onClick={handleSave}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0786C5] hover:bg-sky-600 shadow-sm transition-colors"
          >
            <Save size={14} />
            Save Settings
          </button>
        </div>
      </div>

      {/* Main Grid: Form Left, Live Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-5 text-xs">
          {/* Business & Store Header Section */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white border-b border-slate-200/60 dark:border-slate-800 pb-2">
              <Building size={16} className="text-[#0786C5]" />
              Merchant Header & Business Name
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Store / Merchant Business Name
              </label>
              <input
                type="text"
                name="storeName"
                value={form.storeName}
                onChange={handleChange}
                placeholder="e.g. MALAYBALAY SUPER FOODS CORP."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0786C5] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={handleChange}
                  placeholder="e.g. FORTICH STREET BARANGAY 3 POB."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0786C5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={handleChange}
                  placeholder="e.g. CITY OF MALAYBALAY CAPITAL BUKIDNON"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0786C5] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* BIR & Machine Registration Section (Read-Only / Protected for BIR Compliance) */}
          <div className="space-y-3 p-4 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/50 dark:border-amber-900/40 pb-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <ShieldCheck size={16} className="text-[#0786C5]" />
                BIR Tax & Machine Registration Info
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                <Lock size={12} />
                BIR Compliant • System Locked
              </div>
            </div>

            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 font-medium">
              Notice: Machine accreditation and VAT registration details are legally protected by BIR regulations and cannot be modified or deleted by merchant users.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  VAT Reg TIN
                  <Lock size={11} className="text-amber-600 dark:text-amber-400" />
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="vatTin"
                    value={form.vatTin || ''}
                    readOnly
                    disabled
                    placeholder="011-019-610-000"
                    className="w-full px-3 py-2 pr-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-mono font-semibold cursor-not-allowed select-none focus:outline-none"
                  />
                  <Lock size={14} className="absolute right-2.5 top-2.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  POS Serial No (SN)
                  <Lock size={11} className="text-amber-600 dark:text-amber-400" />
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="serialNo"
                    value={form.serialNo || ''}
                    readOnly
                    disabled
                    placeholder="GM183SJM"
                    className="w-full px-3 py-2 pr-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-mono font-semibold cursor-not-allowed select-none focus:outline-none"
                  />
                  <Lock size={14} className="absolute right-2.5 top-2.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  MIN Number
                  <Lock size={11} className="text-amber-600 dark:text-amber-400" />
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="minNumber"
                    value={form.minNumber || ''}
                    readOnly
                    disabled
                    placeholder="26032515372705917"
                    className="w-full px-3 py-2 pr-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-mono font-semibold cursor-not-allowed select-none focus:outline-none"
                  />
                  <Lock size={14} className="absolute right-2.5 top-2.5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Titles & Custom Description Notes */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white border-b border-slate-200/60 dark:border-slate-800 pb-2">
              <MessageSquare size={16} className="text-[#0786C5]" />
              Titles & Custom Description / Terms
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Invoice Header Title
                </label>
                <input
                  type="text"
                  name="headerTitle"
                  value={form.headerTitle}
                  onChange={handleChange}
                  placeholder="SALES INVOICE / OFFICIAL RECEIPT"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0786C5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sub-header Label
                </label>
                <input
                  type="text"
                  name="subHeaderTitle"
                  value={form.subHeaderTitle}
                  onChange={handleChange}
                  placeholder="CUSTOMER COPY"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0786C5] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Custom Description / Receipt Notes / Return Policy
              </label>
              <textarea
                name="customNotice"
                rows={3}
                value={form.customNotice}
                onChange={handleChange}
                placeholder="Enter custom terms, return policy, or description notes displayed on thermal receipts..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0786C5] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Footer Line 1
                </label>
                <input
                  type="text"
                  name="footerLine1"
                  value={form.footerLine1}
                  onChange={handleChange}
                  placeholder="POWERED BY TRAKZ POS SYSTEM"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0786C5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Footer Line 2
                </label>
                <input
                  type="text"
                  name="footerLine2"
                  value={form.footerLine2}
                  onChange={handleChange}
                  placeholder="THANK YOU AND PLEASE COME AGAIN!"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0786C5] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Live Thermal Receipt Preview Column */}
        <div className="lg:col-span-5 space-y-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Receipt size={14} className="text-[#0786C5]" />
            Live Receipt Layout Preview
          </h4>

          <div className="bg-slate-200 dark:bg-slate-950 p-3 rounded-xl flex justify-center overflow-x-auto">
            <div
              className="w-[280px] bg-white text-black p-3 shadow-md font-mono text-[10px] leading-tight select-none uppercase"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              {/* Header Preview */}
              <div className="text-center space-y-0.5">
                <p className="font-extrabold text-[11px] tracking-wide">
                  {form.storeName || 'MALAYBALAY SUPER FOODS CORP.'}
                </p>
                {form.addressLine1 && <p className="text-[9px]">{form.addressLine1}</p>}
                {form.addressLine2 && <p className="text-[9px]">{form.addressLine2}</p>}
                {form.vatTin && (
                  <p className="text-[9px]">
                    {form.vatTin.startsWith('VAT') ? form.vatTin : `VAT Reg TIN: ${form.vatTin}`}
                  </p>
                )}
                {form.serialNo && (
                  <p className="text-[9px]">
                    {form.serialNo.startsWith('POS') ? form.serialNo : `POS05-SN: ${form.serialNo}`}
                  </p>
                )}
                {form.minNumber && (
                  <p className="text-[9px]">
                    {form.minNumber.startsWith('MIN') ? form.minNumber : `MIN# ${form.minNumber}`}
                  </p>
                )}
                <p className="font-bold pt-1">TZ1076</p>
                <p className="font-extrabold text-[12px] tracking-widest pt-0.5">
                  {form.headerTitle || 'SALES INVOICE'}
                </p>
                <p className="font-bold text-[10px]">{form.subHeaderTitle || 'CUSTOMER COPY'}</p>
              </div>

              {/* Sample Body */}
              <p className="my-1 text-center font-bold">=============================</p>
              <div className="space-y-1 my-1">
                <div className="flex justify-between font-bold">
                  <span>1x SAMPLE ITEM ITEM</span>
                  <span>150.00V</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>2x BEVERAGE CAN</span>
                  <span>100.00V</span>
                </div>
              </div>
              <p className="my-1 text-center font-bold">=============================</p>
              <div className="flex justify-between font-black text-[12px]">
                <span>TOTAL DUE</span>
                <span>PHP 250.00</span>
              </div>
              <p className="my-1 text-center font-bold">*****************************</p>

              {/* Custom Notice Preview */}
              {form.customNotice && (
                <div className="my-2 pt-1 border-t border-dashed border-black text-center text-[8.5px] font-semibold text-gray-800">
                  <p>{form.customNotice}</p>
                </div>
              )}

              {/* Footer Preview */}
              <div className="mt-2 text-center text-[8.5px] font-bold text-gray-700 space-y-0.5">
                {form.footerLine1 && <p>{form.footerLine1}</p>}
                {form.footerLine2 && <p>{form.footerLine2}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && <NotificationToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
