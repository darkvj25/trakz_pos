import React, { useState, useEffect } from 'react';
import { syncService } from '../services/syncService';
import { systemService } from '../services/systemService';
import { StatusBadge } from '../components/common/Badge';
import { formatDate } from '../utils/formatters';
import {
  RefreshCw,
  Database,
  Server,
  ShieldCheck,
  History,
  RotateCcw,
  Printer,
  Sliders,
  CheckCircle2,
  Activity,
  Layers
} from 'lucide-react';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { NotificationToast } from '../components/common/NotificationToast';
import { PrinterSettings } from '../components/settings/PrinterSettings';

export const SystemSettingsPage = ({ isOnline, isSyncing, triggerSync }) => {
  const [activeTab, setActiveTab] = useState('printer'); // 'printer' | 'sync'
  const [syncHistory, setSyncHistory] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState(null);

  const loadSettingsData = async () => {
    try {
      const [hist, sys, audit] = await Promise.all([
        syncService.getHistory(15),
        systemService.getStatus(),
        systemService.getLogs(15),
      ]);
      setSyncHistory(hist);
      setSystemStatus(sys);
      setLogs(audit);
    } catch (err) {
      console.warn('System settings load warning:', err.message);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleSyncNow = async () => {
    const ok = await triggerSync();
    if (ok) {
      setToast({ message: 'Synchronization completed successfully.', type: 'success' });
      loadSettingsData();
    } else {
      setToast({ message: 'Synchronization failed or system is offline.', type: 'error' });
    }
  };

  const handleConfirmReset = async () => {
    setResetting(true);
    try {
      await systemService.resetDemo();
      setToast({ message: 'Local demo dataset re-seeded successfully.', type: 'success' });
      setResetDialogOpen(false);
      loadSettingsData();
    } catch (e) {
      setToast({ message: 'Reset failed.', type: 'error' });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sliders size={20} className="text-[#0786C5]" />
            <h2 className="text-lg font-extrabold tracking-tight">System & Hardware Configuration</h2>
          </div>
          <p className="text-xs text-slate-300 font-medium max-w-xl">
            Configure thermal receipt printers and monitor local database synchronization.
          </p>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('printer')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'printer'
              ? 'bg-[#0786C5] text-white shadow-sm font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Printer size={16} />
          <span className="hidden sm:inline">Printer & ESC/POS Setup</span>
          <span className="sm:hidden">Printer Setup</span>
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'sync'
              ? 'bg-[#0786C5] text-white shadow-sm font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <RefreshCw size={16} />
          <span className="hidden sm:inline">Data Sync & System Status</span>
          <span className="sm:hidden">Sync & Status</span>
        </button>
      </div>

      {/* Tab 1: Thermal Printer Settings */}
      {activeTab === 'printer' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <PrinterSettings />
        </div>
      )}

      {/* Tab 2: System Status & Sync Control */}
      {activeTab === 'sync' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Sync Control Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={16} className="text-[#0786C5]" />
                Synchronization Actions
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Trigger manual background order sync or re-populate offline seed dataset.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSyncNow}
                disabled={isSyncing || !isOnline}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0786C5] hover:bg-sky-600 shadow-sm transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                Trigger Manual Synchronization
              </button>

              <button
                onClick={() => setResetDialogOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 transition-colors"
              >
                <RotateCcw size={16} />
                Re-seed Local Demo Data
              </button>
            </div>
          </div>

          {/* Recent Sync Log Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History size={18} className="text-[#0786C5]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Sync Execution Logs</h3>
              </div>
              <button
                onClick={loadSettingsData}
                className="text-xs font-semibold text-[#0786C5] hover:underline flex items-center gap-1"
              >
                <RefreshCw size={12} /> Refresh Logs
              </button>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950 font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Sync Type</th>
                    <th className="p-3">Started At</th>
                    <th className="p-3">Completed At</th>
                    <th className="p-3 text-center">Processed</th>
                    <th className="p-3 text-center">Failed</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {syncHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400 italic">
                        No recent sync logs recorded.
                      </td>
                    </tr>
                  ) : (
                    syncHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{item.syncType}</td>
                        <td className="p-3 text-slate-500">{formatDate(item.startedAt)}</td>
                        <td className="p-3 text-slate-500">{formatDate(item.completedAt)}</td>
                        <td className="p-3 text-center font-bold">{item.recordsProcessed}</td>
                        <td className="p-3 text-center font-bold text-rose-500">{item.recordsFailed}</td>
                        <td className="p-3">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={handleConfirmReset}
        title="Re-initialize Seed Dataset?"
        message="This action will clear and re-populate local demo orders and payments."
        confirmText="Confirm Re-seed"
        isDanger={true}
        isLoading={resetting}
      />

      {toast && <NotificationToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
