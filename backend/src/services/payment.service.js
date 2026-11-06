const prisma = require('../config/db');

class PaymentService {
  async getPayments(params = {}) {
    const {
      merchantId,
      search,
      paymentMethod,
      paymentStatus,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'paymentDate',
      sortOrder = 'desc',
    } = params;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (merchantId) {
      where.merchantId = merchantId;
    }

    if (search) {
      where.OR = [
        { externalPaymentId: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { order: { externalOrderId: { contains: search, mode: 'insensitive' } } },
        { order: { customerName: { contains: search, mode: 'insensitive' } } },
        { merchant: { merchantName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (paymentMethod && paymentMethod !== 'ALL') {
      where.paymentMethod = paymentMethod;
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) where.paymentDate.lte = new Date(endDate);
    }

    const orderBy = {};
    if (sortBy === 'customer') {
      orderBy.order = { customerName: sortOrder };
    } else if (sortBy === 'merchant') {
      orderBy.merchant = { merchantName: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          merchant: { select: { id: true, merchantName: true, externalMerchantId: true } },
          order: {
            select: {
              id: true,
              externalOrderId: true,
              customerName: true,
              orderStatus: true,
            },
          },
        },
      }),
    ]);

    const formattedPayments = payments.map((p) => ({
      ...p,
      amount: parseFloat(p.amount),
      customerName: p.order ? p.order.customerName : 'N/A',
      externalOrderId: p.order ? p.order.externalOrderId : 'N/A',
      merchantName: p.merchant ? p.merchant.merchantName : 'N/A',
    }));

    return {
      payments: formattedPayments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getPaymentById(id) {
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [{ id }, { externalPaymentId: id }, { referenceNumber: id }],
      },
      include: {
        merchant: true,
        order: {
          include: {
            orderItems: true,
          },
        },
      },
    });

    if (!payment) {
      throw { statusCode: 404, message: 'Payment record not found' };
    }

    return {
      ...payment,
      amount: parseFloat(payment.amount),
      order: payment.order
        ? {
            ...payment.order,
            subtotal: parseFloat(payment.order.subtotal),
            deliveryFee: parseFloat(payment.order.deliveryFee),
            convenienceFee: parseFloat(payment.order.convenienceFee || 0),
            riderTip: parseFloat(payment.order.riderTip || 0),
            discount: parseFloat(payment.order.discount),
            totalAmount: parseFloat(payment.order.totalAmount),
          }
        : null,
    };
  }

  async getPaymentStatistics() {
    const [totalPayments, successful, pending, failed, sumAmount] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.count({ where: { paymentStatus: 'SUCCESSFUL' } }),
      prisma.payment.count({ where: { paymentStatus: 'PENDING' } }),
      prisma.payment.count({ where: { paymentStatus: 'FAILED' } }),
      prisma.payment.aggregate({
        where: { paymentStatus: 'SUCCESSFUL' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalPayments,
      successfulPayments: successful,
      pendingPayments: pending,
      failedPayments: failed,
      totalCollectedAmount: parseFloat(sumAmount._sum.amount || 0),
    };
  }

  async exportPayments(params = {}) {
    const { payments } = await this.getPayments({ ...params, limit: 5000, page: 1 });
    return payments;
  }
}

module.exports = new PaymentService();
