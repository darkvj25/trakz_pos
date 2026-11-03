const prisma = require('../config/db');
const trakzAdapter = require('../integrations/trakzAdapter');

class SyncService {
  async getSyncStatus() {
    const lastSync = await prisma.syncLog.findFirst({
      orderBy: { startedAt: 'desc' },
    });

    const pendingQueueCount = await prisma.syncQueue.count({
      where: { status: 'PENDING' },
    });

    const totalSyncedOrders = await prisma.order.count({
      where: { syncedAt: { not: null } },
    });

    const totalSyncedPayments = await prisma.payment.count({
      where: { syncedAt: { not: null } },
    });

    return {
      lastSync: lastSync
        ? {
            id: lastSync.id,
            syncType: lastSync.syncType,
            startedAt: lastSync.startedAt,
            completedAt: lastSync.completedAt,
            status: lastSync.status,
            recordsProcessed: lastSync.recordsProcessed,
            recordsFailed: lastSync.recordsFailed,
          }
        : null,
      pendingQueueCount,
      totalSyncedOrders,
      totalSyncedPayments,
      systemOnline: true,
    };
  }

  async triggerSync(syncType = 'MANUAL') {
    const startTime = new Date();
    const syncLog = await prisma.syncLog.create({
      data: {
        syncType: syncType,
        startedAt: startTime,
        status: 'IN_PROGRESS',
        recordsProcessed: 0,
        recordsFailed: 0,
      },
    });

    try {
      // 1. Fetch remote orders via adapter
      const remoteOrders = await trakzAdapter.fetchOrders();
      const remotePayments = await trakzAdapter.fetchPayments();

      let processed = 0;
      let failed = 0;

      // 2. Process Orders
      for (const ro of remoteOrders) {
        try {
          // Find or default merchant
          let merchant = await prisma.merchant.findUnique({
            where: { externalMerchantId: ro.merchantId },
          });

          if (!merchant) {
            merchant = await prisma.merchant.create({
              data: {
                externalMerchantId: ro.merchantId,
                merchantName: ro.merchantName || 'TRAKZ Partner Merchant',
                status: 'ACTIVE',
              },
            });
          }

          const existingOrder = await prisma.order.findUnique({
            where: { externalOrderId: ro.externalOrderId },
          });

          if (!existingOrder) {
            await prisma.order.create({
              data: {
                externalOrderId: ro.externalOrderId,
                merchantId: merchant.id,
                customerName: ro.customerName,
                orderDate: new Date(ro.orderDate),
                subtotal: ro.subtotal,
                deliveryFee: ro.deliveryFee,
                discount: ro.discount,
                totalAmount: ro.totalAmount,
                paymentStatus: ro.paymentStatus || 'PAID',
                orderStatus: ro.orderStatus || 'DELIVERED',
                syncedAt: new Date(),
                orderItems: {
                  create: (ro.items || []).map((it) => ({
                    externalProductId: it.externalProductId,
                    productName: it.productName,
                    quantity: it.quantity,
                    unitPrice: it.unitPrice,
                    subtotal: it.subtotal,
                  })),
                },
              },
            });
            processed++;
          }
        } catch (err) {
          console.error(`Failed to sync order ${ro.externalOrderId}:`, err);
          failed++;
        }
      }

      // 3. Process Payments
      for (const rp of remotePayments) {
        try {
          const existingPayment = await prisma.payment.findUnique({
            where: { externalPaymentId: rp.externalPaymentId },
          });

          if (!existingPayment) {
            const matchingOrder = await prisma.order.findUnique({
              where: { externalOrderId: rp.externalOrderId },
            });

            if (matchingOrder) {
              await prisma.payment.create({
                data: {
                  externalPaymentId: rp.externalPaymentId,
                  orderId: matchingOrder.id,
                  merchantId: matchingOrder.merchantId,
                  paymentMethod: rp.paymentMethod,
                  referenceNumber: rp.referenceNumber,
                  amount: rp.amount,
                  paymentStatus: rp.paymentStatus,
                  paymentDate: new Date(rp.paymentDate),
                  syncedAt: new Date(),
                },
              });
              processed++;
            }
          }
        } catch (err) {
          console.error(`Failed to sync payment ${rp.externalPaymentId}:`, err);
          failed++;
        }
      }

      // Update sync log
      const updatedLog = await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          completedAt: new Date(),
          status: failed === 0 ? 'SUCCESS' : 'PARTIAL',
          recordsProcessed: processed,
          recordsFailed: failed,
        },
      });

      return updatedLog;
    } catch (err) {
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          completedAt: new Date(),
          status: 'FAILED',
          errorMessage: err.message,
        },
      });
      throw err;
    }
  }

  async getSyncHistory(limit = 20) {
    const logs = await prisma.syncLog.findMany({
      take: parseInt(limit, 10) || 20,
      orderBy: { startedAt: 'desc' },
    });
    return logs;
  }
}

module.exports = new SyncService();
