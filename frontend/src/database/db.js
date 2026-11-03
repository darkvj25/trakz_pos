import Dexie from 'dexie';

export const db = new Dexie('trakz_pos_db');

db.version(1).stores({
  orders: 'id, externalOrderId, merchantId, customerName, orderDate, paymentStatus, orderStatus, totalAmount',
  payments: 'id, externalPaymentId, orderId, merchantId, referenceNumber, paymentMethod, paymentStatus, paymentDate, amount',
  syncLogs: 'id, syncType, startedAt, completedAt, status',
  syncQueue: '++id, operationId, operationType, externalReferenceId, payload, status, createdAt',
  systemSettings: 'settingKey, settingValue',
});

/**
 * IndexedDB Offline Synchronization Helpers
 */
export const saveOrdersToCache = async (orders) => {
  if (!orders || !orders.length) return;
  await db.orders.bulkPut(orders);
};

export const savePaymentsToCache = async (payments) => {
  if (!payments || !payments.length) return;
  await db.payments.bulkPut(payments);
};

export const getCachedOrders = async (filters = {}) => {
  let collection = db.orders.orderBy('orderDate').reverse();
  let results = await collection.toArray();

  if (filters.search) {
    const query = filters.search.toLowerCase();
    results = results.filter(
      (o) =>
        (o.externalOrderId && o.externalOrderId.toLowerCase().includes(query)) ||
        (o.customerName && o.customerName.toLowerCase().includes(query)) ||
        (o.merchant && o.merchant.merchantName && o.merchant.merchantName.toLowerCase().includes(query))
    );
  }

  if (filters.paymentStatus && filters.paymentStatus !== 'ALL') {
    results = results.filter((o) => o.paymentStatus === filters.paymentStatus);
  }

  if (filters.orderStatus && filters.orderStatus !== 'ALL') {
    results = results.filter((o) => o.orderStatus === filters.orderStatus);
  }

  return results;
};

export const getCachedPayments = async (filters = {}) => {
  let collection = db.payments.orderBy('paymentDate').reverse();
  let results = await collection.toArray();

  if (filters.search) {
    const query = filters.search.toLowerCase();
    results = results.filter(
      (p) =>
        (p.externalPaymentId && p.externalPaymentId.toLowerCase().includes(query)) ||
        (p.referenceNumber && p.referenceNumber.toLowerCase().includes(query)) ||
        (p.customerName && p.customerName.toLowerCase().includes(query))
    );
  }

  if (filters.paymentMethod && filters.paymentMethod !== 'ALL') {
    results = results.filter((p) => p.paymentMethod === filters.paymentMethod);
  }

  if (filters.paymentStatus && filters.paymentStatus !== 'ALL') {
    results = results.filter((p) => p.paymentStatus === filters.paymentStatus);
  }

  return results;
};

export const clearCache = async () => {
  await db.orders.clear();
  await db.payments.clear();
  await db.syncLogs.clear();
  await db.syncQueue.clear();
};
