import { useState, useEffect, useCallback } from 'react';
import { syncService } from '../services/syncService';
import { saveOrdersToCache, savePaymentsToCache } from '../database/db';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';

export const useSync = (isOnline = true) => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [error, setError] = useState(null);

  const fetchSyncStatus = useCallback(async () => {
    if (!isOnline) return;
    try {
      const data = await syncService.getStatus();
      setSyncStatus(data);
      if (data.lastSync) {
        setLastSyncTime(data.lastSync.completedAt || data.lastSync.startedAt);
      }
    } catch (err) {
      console.warn('Sync status fetch error:', err.message);
    }
  }, [isOnline]);

  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      setError('Cannot sync while network is offline.');
      return false;
    }

    setIsSyncing(true);
    setError(null);
    try {
      const result = await syncService.startSync('MANUAL');
      setLastSyncTime(new Date().toISOString());

      // After backend sync, pull orders & payments into browser IndexedDB cache
      const ordersRes = await orderService.getOrders({ limit: 100 });
      const paymentsRes = await paymentService.getPayments({ limit: 100 });

      if (ordersRes && ordersRes.orders) {
        await saveOrdersToCache(ordersRes.orders);
      }
      if (paymentsRes && paymentsRes.payments) {
        await savePaymentsToCache(paymentsRes.payments);
      }

      await fetchSyncStatus();
      setIsSyncing(false);
      return true;
    } catch (err) {
      setError(err.message || 'Synchronization failed.');
      setIsSyncing(false);
      return false;
    }
  }, [isOnline, fetchSyncStatus]);

  useEffect(() => {
    fetchSyncStatus();
    const interval = setInterval(() => {
      fetchSyncStatus();
    }, 60000); // refresh status every 1 minute
    return () => clearInterval(interval);
  }, [fetchSyncStatus]);

  return {
    syncStatus,
    isSyncing,
    lastSyncTime,
    error,
    triggerSync,
    fetchSyncStatus,
  };
};
