const orderService = require('../services/order.service');
const { sendSuccess } = require('../utils/response');

class OrderController {
  async getOrders(req, res, next) {
    try {
      const queryParams = { ...req.query };
      if (req.user && req.user.merchantId) {
        queryParams.merchantId = req.user.merchantId;
      }
      const result = await orderService.getOrders(queryParams);
      return sendSuccess(res, 'Orders retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      return sendSuccess(res, 'Order details retrieved', order);
    } catch (error) {
      next(error);
    }
  }

  async getOrderItems(req, res, next) {
    try {
      const items = await orderService.getOrderItems(req.params.id);
      return sendSuccess(res, 'Order items retrieved', items);
    } catch (error) {
      next(error);
    }
  }

  async exportOrders(req, res, next) {
    try {
      const orders = await orderService.exportOrders(req.query);
      return sendSuccess(res, 'Orders exported', orders);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
