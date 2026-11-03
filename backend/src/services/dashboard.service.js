const prisma = require('../config/db');

class DashboardService {
  async getSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Total Revenue (All completed/paid orders)
    const totalRevenueResult = await prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { totalAmount: true },
    });
    const totalRevenue = parseFloat(totalRevenueResult._sum.totalAmount || 0);

    // Today's Revenue vs Yesterday's Revenue
    const todayRevenueResult = await prisma.order.aggregate({
      where: {
        paymentStatus: 'PAID',
        orderDate: { gte: today },
      },
      _sum: { totalAmount: true },
    });
    const todayRevenue = parseFloat(todayRevenueResult._sum.totalAmount || 0);

    const yesterdayRevenueResult = await prisma.order.aggregate({
      where: {
        paymentStatus: 'PAID',
        orderDate: { gte: yesterday, lt: today },
      },
      _sum: { totalAmount: true },
    });
    const yesterdayRevenue = parseFloat(yesterdayRevenueResult._sum.totalAmount || 0);

    let revenueChangePercent = 0;
    if (yesterdayRevenue > 0) {
      revenueChangePercent = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
    } else if (todayRevenue > 0) {
      revenueChangePercent = 100;
    }

    // Total Orders count
    const totalOrdersCount = await prisma.order.count();
    const todayOrdersCount = await prisma.order.count({
      where: { orderDate: { gte: today } },
    });

    // Digital Payments statistics
    const digitalMethods = ['GCASH', 'CREDIT_CARD', 'DEBIT_CARD', 'ONLINE_PAYMENT'];
    const totalPaymentsCount = await prisma.payment.count({
      where: { paymentStatus: 'SUCCESSFUL' },
    });

    const digitalPaymentsCount = await prisma.payment.count({
      where: {
        paymentStatus: 'SUCCESSFUL',
        paymentMethod: { in: digitalMethods },
      },
    });

    const digitalPercentage = totalPaymentsCount > 0 ? (digitalPaymentsCount / totalPaymentsCount) * 100 : 0;

    // Method Breakdown
    const gcashPayments = await prisma.payment.aggregate({
      where: { paymentStatus: 'SUCCESSFUL', paymentMethod: 'GCASH' },
      _sum: { amount: true },
      _count: true,
    });

    const cardPayments = await prisma.payment.aggregate({
      where: {
        paymentStatus: 'SUCCESSFUL',
        paymentMethod: { in: ['CREDIT_CARD', 'DEBIT_CARD'] },
      },
      _sum: { amount: true },
      _count: true,
    });

    const otherOnlinePayments = await prisma.payment.aggregate({
      where: { paymentStatus: 'SUCCESSFUL', paymentMethod: 'ONLINE_PAYMENT' },
      _sum: { amount: true },
      _count: true,
    });

    const cashPayments = await prisma.payment.aggregate({
      where: { paymentStatus: 'SUCCESSFUL', paymentMethod: 'CASH' },
      _sum: { amount: true },
      _count: true,
    });

    // Get latest sync log
    const lastSync = await prisma.syncLog.findFirst({
      orderBy: { startedAt: 'desc' },
    });

    return {
      revenue: {
        total: totalRevenue,
        today: todayRevenue,
        yesterday: yesterdayRevenue,
        changePercent: Math.round(revenueChangePercent * 10) / 10,
      },
      orders: {
        total: totalOrdersCount,
        today: todayOrdersCount,
      },
      digitalPayments: {
        percentage: Math.round(digitalPercentage * 10) / 10,
        totalDigitalCount: digitalPaymentsCount,
        totalCount: totalPaymentsCount,
        breakdown: {
          gcash: { amount: parseFloat(gcashPayments._sum.amount || 0), count: gcashPayments._count },
          cards: { amount: parseFloat(cardPayments._sum.amount || 0), count: cardPayments._count },
          otherOnline: { amount: parseFloat(otherOnlinePayments._sum.amount || 0), count: otherOnlinePayments._count },
          cash: { amount: parseFloat(cashPayments._sum.amount || 0), count: cashPayments._count },
        },
      },
      syncStatus: {
        lastSyncedAt: lastSync ? lastSync.completedAt || lastSync.startedAt : null,
        status: lastSync ? lastSync.status : 'SUCCESS',
      },
    };
  }

  async getRevenueAnalytics(period = 'daily', startDate = null, endDate = null) {
    const now = new Date();
    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date();

    if (!startDate) {
      if (period === 'daily') {
        start.setDate(now.getDate() - 7); // last 7 days
      } else if (period === 'weekly') {
        start.setDate(now.getDate() - 30); // last 30 days
      } else if (period === 'monthly') {
        start.setMonth(now.getMonth() - 6); // last 6 months
      }
    }

    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        orderDate: {
          gte: start,
          lte: end,
        },
      },
      select: {
        orderDate: true,
        totalAmount: true,
      },
      orderBy: { orderDate: 'asc' },
    });

    // Grouping by date format
    const grouped = {};

    orders.forEach((o) => {
      let key;
      const d = new Date(o.orderDate);
      if (period === 'monthly') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'weekly') {
        // week starting date string
        const first = d.getDate() - d.getDay();
        const weekStart = new Date(d.setDate(first));
        key = `Week of ${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      } else {
        key = d.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = { label: key, revenue: 0, orders: 0 };
      }
      grouped[key].revenue += parseFloat(o.totalAmount);
      grouped[key].orders += 1;
    });

    const chartData = Object.values(grouped).map((item) => ({
      label: item.label,
      revenue: Math.round(item.revenue * 100) / 100,
      orders: item.orders,
    }));

    return chartData;
  }

  async getPaymentStatistics() {
    const stats = await prisma.payment.groupBy({
      by: ['paymentMethod', 'paymentStatus'],
      _sum: { amount: true },
      _count: { id: true },
    });

    return stats.map((s) => ({
      paymentMethod: s.paymentMethod,
      paymentStatus: s.paymentStatus,
      totalAmount: parseFloat(s._sum.amount || 0),
      count: s._count.id,
    }));
  }

  async getOrderStatistics() {
    const stats = await prisma.order.groupBy({
      by: ['orderStatus'],
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    return stats.map((s) => ({
      status: s.orderStatus,
      count: s._count.id,
      totalAmount: parseFloat(s._sum.totalAmount || 0),
    }));
  }
}

module.exports = new DashboardService();
