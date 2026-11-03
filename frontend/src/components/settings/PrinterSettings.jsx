import React, { useState, useEffect } from 'react';
import { printerService } from '../../services/printerService';
import { Printer, Bluetooth, Usb, CheckCircle2, AlertTriangle, RefreshCw, XCircle, FileText, Smartphone } from 'lucide-react';
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

  const handlePairBluetooth = async () => {
    setLoading(true);
    try {
      const res = await printerService.pairBluetooth();
      setToast({
        message: `Successfully paired Bluetooth printer: ${res.deviceName}`,
        type: 'success',
      });
    } catch (err) {
      if (err.name !== 'NotFoundError') {
        setToast({
          message: err.message || 'Failed to pair Bluetooth printer.',
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
        message: `Connected natively to ${res.deviceName}`,
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: err.message || 'Failed to connect native Bluetooth device.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePairUsb = async () => {
    setLoading(true);
    try {
      const res = await printerService.pairUsb();
      setToast({
        message: `Successfully paired Web USB printer: ${res.deviceName}`,
        type: 'success',
      });
    } catch (err) {
      if (err.name !== 'NotFoundError') {
        setToast({
          message: err.message || 'Failed to pair Web USB printer.',
          type: 'error',
        });
      }
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
      setToast({ message: 'Test ESC/POS receipt sent to printer!', type: 'success' });
    } catch (err) {
      setToast({ message: `Print failed: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-[#0786C5]">
            <Printer size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Thermal POS Printer & ESC/POS Setup
              {status.isNative && (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  ANDROID NATIVE (CAPACITOR)
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Configure Bluetooth, Web USB, or Browser dialog printing formats for sales receipts.
            </p>
          </div>
        </div>

        {/* Current Connection Badge */}
        <div className="flex items-center gap-2">
          {status.connectionType === 'browser' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <FileText size={14} />
              Browser Window Print
            </span>
          ) : status.isConnected ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 size={14} />
              Connected ({status.deviceName || status.connectionType.toUpperCase()})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <AlertTriangle size={14} />
              Not Paired / Offline
            </span>
          )}
        </div>
      </div>

      {/* Connection Type Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bluetooth Mode */}
        <div
          onClick={() => printerService.setConnectionType(status.isNative ? 'native' : 'bluetooth')}
          className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
            status.connectionType === 'bluetooth' || status.connectionType === 'native'
              ? 'border-[#0786C5] bg-sky-50/50 dark:bg-sky-950/30 ring-2 ring-[#0786C5]/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <Bluetooth className="text-blue-500" size={18} />
              Bluetooth (ESC/POS)
            </div>
            {(status.connectionType === 'bluetooth' || status.connectionType === 'native') && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#0786C5]"></span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {status.isNative
              ? 'Native Android Bluetooth socket printer pairing under Android Kotlin package.'
              : 'Wireless printing to Bluetooth thermal receipt printers via Web Bluetooth API.'}
          </p>
          {!status.isBluetoothSupported && !status.isNative && (
            <p className="mt-2 text-[11px] text-rose-500 font-semibold flex items-center gap-1">
              <XCircle size={12} /> Web Bluetooth not available on current browser.
            </p>
          )}
        </div>

        {/* Web USB Mode */}
        <div
          onClick={() => printerService.setConnectionType('usb')}
          className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
            status.connectionType === 'usb'
              ? 'border-[#0786C5] bg-sky-50/50 dark:bg-sky-950/30 ring-2 ring-[#0786C5]/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <Usb className="text-emerald-500" size={18} />
              Web USB (ESC/POS)
            </div>
            {status.connectionType === 'usb' && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#0786C5]"></span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Direct cable USB thermal printing using Chrome WebUSB driverless interface.
          </p>
          <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Note: If Windows driver is installed, use "Browser Standard" instead.
          </p>
          {!status.isUsbSupported && (
            <p className="mt-2 text-[11px] text-rose-500 font-semibold flex items-center gap-1">
              <XCircle size={12} /> Web USB not available on current browser.
            </p>
          )}
        </div>

        {/* Standard Browser Print Mode */}
        <div
          onClick={() => printerService.setConnectionType('browser')}
          className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
            status.connectionType === 'browser'
              ? 'border-[#0786C5] bg-sky-50/50 dark:bg-sky-950/30 ring-2 ring-[#0786C5]/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <FileText className="text-purple-500" size={18} />
              Browser Standard
            </div>
            {status.connectionType === 'browser' && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#0786C5]"></span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Standard system print window preview fallback for any installed desktop printer.
          </p>
        </div>
      </div>

      {/* Native Paired Devices List for Android */}
      {status.isNative && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Smartphone size={16} className="text-blue-500" />
              Bonded Android Bluetooth Devices
            </h4>
            <button
              onClick={loadNativeDevices}
              className="text-xs font-semibold text-[#0786C5] hover:underline flex items-center gap-1"
            >
              <RefreshCw size={12} /> Refresh Devices
            </button>
          </div>

          {nativeDevices.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              No paired Bluetooth devices found in Android Settings. Pair your thermal printer in Android Bluetooth Settings first.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {nativeDevices.map((dev) => (
                <div
                  key={dev.address}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{dev.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{dev.address}</p>
                  </div>
                  <button
                    onClick={() => handlePairNativeDevice(dev)}
                    disabled={loading}
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold text-white bg-[#0786C5] hover:bg-sky-600 transition-colors"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Options: Paper Size & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        {/* Paper Size selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Receipt Paper Size:
          </label>
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => printerService.setPaperWidth('80mm')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                status.paperWidth === '80mm'
                  ? 'bg-white dark:bg-slate-900 text-[#0786C5] shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              80mm (Standard POS)
            </button>
            <button
              onClick={() => printerService.setPaperWidth('58mm')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                status.paperWidth === '58mm'
                  ? 'bg-white dark:bg-slate-900 text-[#0786C5] shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              58mm (Mobile Mini)
            </button>
          </div>
        </div>

        {/* Pairing / Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {(status.connectionType === 'bluetooth' || status.connectionType === 'native') && !status.isNative && (
            <button
              onClick={handlePairBluetooth}
              disabled={loading || !status.isBluetoothSupported}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Bluetooth size={14} />}
              Pair Bluetooth Printer
            </button>
          )}

          {status.connectionType === 'usb' && (
            <button
              onClick={handlePairUsb}
              disabled={loading || !status.isUsbSupported}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Usb size={14} />}
              Pair Web USB Printer
            </button>
          )}

          {status.isConnected && (
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:border dark:border-rose-800 transition-colors"
            >
              Disconnect
            </button>
          )}

          <button
            onClick={handleTestPrint}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            <Printer size={14} />
            Test Print ESC/POS
          </button>
        </div>
      </div>

      {toast && <NotificationToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
