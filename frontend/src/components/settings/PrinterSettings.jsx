import React, { useState, useEffect } from 'react';
import { printerService } from '../../services/printerService';
import { Bluetooth, Usb, RefreshCw, Printer, CheckCircle2, Sliders } from 'lucide-react';
import { NotificationToast } from '../common/NotificationToast';

export const PrinterSettings = () => {
  const [status, setStatus] = useState(printerService.getStatus());
  const [loading, setLoading] = useState(false);
  const [nativeDevices, setNativeDevices] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const unsubscribe = printerService.subscribe((updatedStatus) => {
      setStatus(updatedStatus);
    });
    if (printerService.isCapacitorNative()) {
      loadNativeDevices();
    }
    return () => unsubscribe();
  }, []);

  const loadNativeDevices = async () => {
    try {
      const list = await printerService.listNativePairedDevices();
      setNativeDevices(list);
    } catch (e) {
      console.warn('Native devices load error:', e);
    }
  };

  const handleToggleThermalEnabled = (e) => {
    printerService.setThermalEnabled(e.target.checked);
  };

  const handlePaperSizeChange = (width) => {
    printerService.setPaperWidth(width);
  };

  const handlePrintModeChange = (mode) => {
    printerService.setPrintMode(mode);
  };

  const handlePairBluetooth = async () => {
    setLoading(true);
    try {
      const res = await printerService.pairBluetooth();
      setToast({
        message: `Connected Bluetooth Printer: ${res.deviceName}`,
        type: 'success',
      });
    } catch (err) {
      if (err.name !== 'NotFoundError' && err.name !== 'AbortError') {
        setToast({
          message: err.message || 'Bluetooth pairing failed.',
          type: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePairUsb = async () => {
    setLoading(true);
    try {
      const res = await printerService.pairUsb();
      setToast({
        message: `Paired Web USB Printer: ${res.deviceName}`,
        type: 'success',
      });
    } catch (err) {
      if (err.name !== 'NotFoundError' && err.name !== 'AbortError') {
        setToast({
          message: err.message || 'USB pairing failed.',
          type: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePairNativeDevice = async (device) => {
    setLoading(true);
    try {
      const res = await printerService.pairNativeBluetooth(device.address, device.name);
      setToast({
        message: `Connected SPP to ${res.deviceName}`,
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: err.message || 'Native Bluetooth connection failed.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await printerService.disconnect();
      setToast({ message: 'Printer disconnected.', type: 'info' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestPrint = async () => {
    setLoading(true);
    try {
      await printerService.printTestReceipt();
      setToast({ message: 'Test ESC/POS receipt sent!', type: 'success' });
    } catch (err) {
      setToast({ message: `Print failed: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-[#0786C5] shrink-0">
            <Printer size={22} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Printer Configuration & Hardware Setup
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Configure Web Bluetooth, Web USB, or Android Native thermal printers.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 animate-in fade-in duration-150">
          {/* Row 1: Enable Thermal Printing Toggle */}
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
            <div>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                Enable Thermal Printing
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Enable binary ESC/POS hardware receipt printing for order checkout.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                checked={!!status.thermalEnabled}
                onChange={handleToggleThermalEnabled}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a1e9]"></div>
            </label>
          </div>

          {/* Row 2: Grid for Paper Size & Print Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Paper Size */}
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Paper Size
              </label>
              <div className="p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl flex items-center">
                <button
                  type="button"
                  onClick={() => handlePaperSizeChange('58mm')}
                  className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all text-center ${
                    status.paperWidth === '58mm'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  58mm (Mobile Mini)
                </button>
                <button
                  type="button"
                  onClick={() => handlePaperSizeChange('80mm')}
                  className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all text-center ${
                    status.paperWidth === '80mm'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  80mm (Standard POS)
                </button>
              </div>
            </div>

            {/* Print Mode */}
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Print Mode
              </label>
              <div className="p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl flex items-center">
                <button
                  type="button"
                  onClick={() => handlePrintModeChange('auto')}
                  className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all text-center ${
                    status.printMode === 'auto'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Automatic Print
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintModeChange('ask')}
                  className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all text-center ${
                    status.printMode === 'ask' || !status.printMode
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Ask to Print
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Status Display Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
              Hardware Status
            </span>
            {status.isConnected ? (
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                Connected ({status.deviceName || 'Thermal Printer'})
              </span>
            ) : (
              <span className="text-xs font-black text-rose-500 dark:text-rose-400">
                Not Connected
              </span>
            )}
          </div>

          {/* Android Native Paired Devices if in Capacitor Native App */}
          {status.isNative && nativeDevices.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Paired Android Bluetooth Devices:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {nativeDevices.map((dev) => (
                  <button
                    key={dev.address}
                    onClick={() => handlePairNativeDevice(dev)}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-xs text-left transition-colors"
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{dev.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{dev.address}</p>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-[#0786C5] text-white font-extrabold text-[11px]">
                      Connect
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Row 4: Pairing Action Buttons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {/* Connect USB Printer */}
            <button
              type="button"
              onClick={handlePairUsb}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#00a1e9] hover:bg-[#008fcb] shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Usb size={16} />}
              Connect USB Printer
            </button>

            {/* Connect Bluetooth Printer */}
            <button
              type="button"
              onClick={handlePairBluetooth}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#2563eb] hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Bluetooth size={16} />}
              Connect Bluetooth Printer
            </button>
          </div>

          {/* Connected Action Options: Disconnect & Test Print */}
          {status.isConnected && (
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleTestPrint}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                <Printer size={15} />
                Test Print ESC/POS
              </button>

              <button
                type="button"
                onClick={handleDisconnect}
                disabled={loading}
                className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 dark:hover:bg-rose-900 transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

      {toast && <NotificationToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
