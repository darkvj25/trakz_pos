const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/response');

class DashboardController {
  async getSummary(req, res, next) {
    try {
      const summary = await dashboardService.getSummary();
      return sendSuccess(res, 'Dashboard summary metrics retrieved', summary);
    } catch (error) {
      next(error);
    }
  }

  async getRevenue(req, res, next) {
    try {
      const { period, startDate, endDate } = req.query;
      const data = await dashboardService.getRevenueAnalytics(period, startDate, endDate);
      return sendSuccess(res, 'Revenue analytics retrieved', data);
    } catch (error) {
      next(error);
    }
  }

  async getPaymentStatistics(req, res, next) {
    try {
      const stats = await dashboardService.getPaymentStatistics();
      return sendSuccess(res, 'Payment statistics retrieved', stats);
    } catch (error) {
      next(error);
    }
  }

  async getOrderStatistics(req, res, next) {
    try {
      const stats = await dashboardService.getOrderStatistics();
      return sendSuccess(res, 'Order statistics retrieved', stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
