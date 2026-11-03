const prisma = require('../config/db');

class OrderService {
  async getOrders(params = {}) {
    const {
      merchantId,
      search,
      paymentStatus,
      orderStatus,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'orderDate',
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
        { externalOrderId: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { merchant: { merchantName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus;
    }

    if (orderStatus && orderStatus !== 'ALL') {
      where.orderStatus = orderStatus;
    }

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    const orderBy = {};
    if (sortBy === 'merchant') {
      orderBy.merchant = { merchantName: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          merchant: { select: { id: true, merchantName: true, externalMerchantId: true } },
          orderItems: true,
          payments: {
            select: {
              id: true,
              externalPaymentId: true,
              paymentMethod: true,
              referenceNumber: true,
              amount: true,
              paymentStatus: true,
            },
          },
        },
      }),
    ]);

    const formattedOrders = orders.map((o) => ({
      ...o,
      subtotal: parseFloat(o.subtotal),
      deliveryFee: parseFloat(o.deliveryFee),
      convenienceFee: parseFloat(o.convenienceFee || 0),
      deliveryDistance: o.deliveryDistance ? parseFloat(o.deliveryDistance) : null,
      riderPayout: parseFloat(o.riderPayout || 0),
      trakzMargin: parseFloat(o.trakzMargin || 0),
      discount: parseFloat(o.discount),
      totalAmount: parseFloat(o.totalAmount),
      itemCount: o.orderItems.reduce((acc, item) => acc + item.quantity, 0),
      paymentMethod: o.payments[0] ? o.payments[0].paymentMethod : 'N/A',
      paymentRef: o.payments[0] ? o.payments[0].referenceNumber : 'N/A',
    }));

    return {
      orders: formattedOrders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getOrderById(id) {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { externalOrderId: id }],
      },
      include: {
        merchant: true,
        orderItems: true,
        payments: true,
      },
    });

    if (!order) {
      throw { statusCode: 404, message: 'Order not found' };
    }

    return {
      ...order,
      subtotal: parseFloat(order.subtotal),
      deliveryFee: parseFloat(order.deliveryFee),
      convenienceFee: parseFloat(order.convenienceFee || 0),
      deliveryDistance: order.deliveryDistance ? parseFloat(order.deliveryDistance) : null,
      riderPayout: parseFloat(order.riderPayout || 0),
      trakzMargin: parseFloat(order.trakzMargin || 0),
      discount: parseFloat(order.discount),
      totalAmount: parseFloat(order.totalAmount),
      orderItems: order.orderItems.map((item) => ({
        ...item,
        unitPrice: parseFloat(item.unitPrice),
        subtotal: parseFloat(item.subtotal),
      })),
      payments: order.payments.map((p) => ({
        ...p,
        amount: parseFloat(p.amount),
      })),
    };
  }

  async getOrderItems(orderId) {
    const items = await prisma.orderItem.findMany({
      where: { orderId },
    });
    return items.map((item) => ({
      ...item,
      unitPrice: parseFloat(item.unitPrice),
      subtotal: parseFloat(item.subtotal),
    }));
  }

  async exportOrders(params = {}) {
    const { orders } = await this.getOrders({ ...params, limit: 5000, page: 1 });
    return orders;
  }
}

module.exports = new OrderService();
