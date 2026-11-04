import React, { useState, useEffect } from 'react';
import { printerService } from '../../services/printerService';
import { Printer, Bluetooth, Usb, CheckCircle2, AlertTriangle, RefreshCw, XCircle, FileText, Smartphone, Settings, ExternalLink } from 'lucide-react';
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

  const handleOpenBluetoothSettings = async () => {
    try {
      await printerService.openNativeBluetoothSettings();
    } catch (e) {
      setToast({ message: 'Could not open Android Bluetooth Settings automatically.', type: 'error' });
    }
  };

  const handlePairBluetooth = async () => {
    setLoading(true);
    try {
      const res = await printerService.pairBluetooth();
      setToast({
        message: `Successfully connected Bluetooth printer: ${res.deviceName}`,
        type: 'success',
      });
    } catch (err) {
      if (err.name !== 'NotFoundError') {
        setToast({
          message: err.message || 'Failed to connect Bluetooth printer.',
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
        message: `Connected via BT 2.0 Classic Native socket to ${res.deviceName}`,
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: err.message || 'Failed to connect Bluetooth 2.0 Classic device.',
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
              {status.isNative ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  ANDROID NATIVE (BT 2.0 CLASSIC & BLE)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  WEB BROWSER MODE
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Configure Bluetooth 2.0 Classic / BLE, Web USB, or Browser printing formats for receipts.
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
              ? 'Native Bluetooth 2.0 Classic (SPP/RFCOMM) & BLE thermal printer connection.'
              : 'Wireless thermal receipt printing via Web Bluetooth API (BLE 5.0).'}
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

      {/* Bluetooth 2.0 Classic Guidance Banner for Web Browser users */}
      {!status.isNative && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
            <Bluetooth size={16} className="text-amber-600 shrink-0" />
            Bluetooth 2.0 Classic vs Web Bluetooth Note:
          </div>
          <p className="text-[11px] leading-relaxed">
            Web Bluetooth API in Chrome only supports <strong>Bluetooth 5.0 / BLE (Bluetooth Low Energy)</strong>.
            Thermal receipt printers that use <strong>Bluetooth 2.0 Classic (SPP/RFCOMM)</strong> (e.g. POS-58, POS-80, PT-210) require the <strong>TrakZ POS Native Android App</strong> to connect.
          </p>
        </div>
      )}

      {/* Native Paired Devices List for Android Native (BT 2.0 Classic & BLE) */}
      {status.isNative && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Smartphone size={16} className="text-blue-500" />
              Bonded Android Bluetooth 2.0 / Classic Printers
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenBluetoothSettings}
                className="text-xs font-bold text-[#0786C5] hover:underline flex items-center gap-1"
              >
                <Settings size={12} /> Android Bluetooth Settings
              </button>
              <button
                onClick={loadNativeDevices}
                className="text-xs font-semibold text-[#0786C5] hover:underline flex items-center gap-1"
              >
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
          </div>

          {nativeDevices.length === 0 ? (
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-2">
              <p className="italic">
                No paired Bluetooth devices found on this Android device.
              </p>
              <p className="text-[11px]">
                To connect a Bluetooth 2.0 Classic printer (e.g. POS-58 / POS-80 / PT-210), pair it in Android Bluetooth Settings first, then tap <strong>Refresh</strong> above.
              </p>
              <button
                onClick={handleOpenBluetoothSettings}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0786C5] hover:bg-sky-600 transition-colors"
              >
                <ExternalLink size={12} /> Open Android Bluetooth Settings
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {nativeDevices.map((dev) => {
                const isSelected = status.deviceName?.includes(dev.name) || status.deviceName?.includes(dev.address);
                return (
                  <div
                    key={dev.address}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs ${
                      isSelected
                        ? 'border-[#0786C5] bg-sky-50/60 dark:bg-sky-950/40 ring-1 ring-[#0786C5]'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        {dev.name}
                        {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{dev.address}</p>
                    </div>
                    <button
                      onClick={() => handlePairNativeDevice(dev)}
                      disabled={loading}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold text-white transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-[#0786C5] hover:bg-sky-600'
                      }`}
                    >
                      {isSelected ? 'Connected' : 'Connect SPP'}
                    </button>
                  </div>
                );
              })}
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
              Pair Web Bluetooth Device
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
