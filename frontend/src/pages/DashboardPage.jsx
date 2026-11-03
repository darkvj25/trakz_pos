import React, { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import { systemService } from '../services/systemService';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { PaymentBreakdownCard } from '../components/dashboard/PaymentBreakdownCard';
import { QuickNavCard } from '../components/dashboard/QuickNavCard';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { NotificationToast } from '../components/common/NotificationToast';

export const DashboardPage = ({ isOnline, isSyncing, lastSyncTime, triggerSync }) => {
  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [period, setPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const [sum, rev] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getRevenue(period),
      ]);
      setSummary(sum);
      setRevenueData(rev);
    } catch (err) {
      console.error('Failed loading dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleManualSync = async () => {
    const success = await triggerSync();
    if (success) {
      setToast({ message: 'Synchronization completed successfully.', type: 'success' });
      loadDashboardData();
    } else {
      setToast({ message: 'Synchronization failed or network is offline.', type: 'error' });
    }
  };

  const handleConfirmReset = async () => {
    setResetting(true);
    try {
      await systemService.resetDemo();
      setToast({ message: 'Local demo dataset re-initialized successfully.', type: 'success' });
      setResetDialogOpen(false);
      loadDashboardData();
    } catch (err) {
      setToast({ message: 'Failed to reset demo dataset.', type: 'error' });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard type="revenue" data={summary?.revenue} />
        <SummaryCard type="orders" data={summary?.orders} syncStatus={summary?.syncStatus} />
        <SummaryCard type="digital" data={summary?.digitalPayments} />
      </div>

      {/* Main Analytics Chart */}
      <RevenueChart data={revenueData} period={period} setPeriod={setPeriod} />

      {/* Payment Methods Breakdown */}
      <PaymentBreakdownCard breakdown={summary?.digitalPayments?.breakdown} />

      {/* Quick Navigation & Management */}
      <QuickNavCard
        onManualSync={handleManualSync}
        onResetDemo={() => setResetDialogOpen(true)}
        isSyncing={isSyncing}
        isOnline={isOnline}
      />

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Local Demo Data?"
        message="This will restore local order and payment records back to standard seed demonstration data. Authoritative production databases will not be touched."
        confirmText="Confirm Reset"
        isDanger={true}
        isLoading={resetting}
      />

      {/* Notification Toast */}
      {toast && (
        <NotificationToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
