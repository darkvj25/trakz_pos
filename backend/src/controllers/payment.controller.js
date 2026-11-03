const paymentService = require('../services/payment.service');
const { sendSuccess } = require('../utils/response');

class PaymentController {
  async getPayments(req, res, next) {
    try {
      const queryParams = { ...req.query };
      if (req.user && req.user.merchantId) {
        queryParams.merchantId = req.user.merchantId;
      }
      const result = await paymentService.getPayments(queryParams);
      return sendSuccess(res, 'Payments retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getPaymentById(req, res, next) {
    try {
      const payment = await paymentService.getPaymentById(req.params.id);
      return sendSuccess(res, 'Payment details retrieved', payment);
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const stats = await paymentService.getPaymentStatistics();
      return sendSuccess(res, 'Payment statistics retrieved', stats);
    } catch (error) {
      next(error);
    }
  }

  async exportPayments(req, res, next) {
    try {
      const payments = await paymentService.exportPayments(req.query);
      return sendSuccess(res, 'Payments exported', payments);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
