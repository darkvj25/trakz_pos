const systemService = require('../services/system.service');
const { sendSuccess } = require('../utils/response');

class SystemController {
  async getStatus(req, res, next) {
    try {
      const status = await systemService.getSystemStatus();
      return sendSuccess(res, 'System status retrieved', status);
    } catch (error) {
      next(error);
    }
  }

  async getLogs(req, res, next) {
    try {
      const logs = await systemService.getLogs(req.query.limit);
      return sendSuccess(res, 'Audit logs retrieved', logs);
    } catch (error) {
      next(error);
    }
  }

  async getSettings(req, res, next) {
    try {
      const settings = await systemService.getSettings();
      return sendSuccess(res, 'System settings retrieved', settings);
    } catch (error) {
      next(error);
    }
  }

  async resetDemo(req, res, next) {
    try {
      const { confirm } = req.body;
      const result = await systemService.resetDemoData(confirm, req.user ? req.user.id : null);
      return sendSuccess(res, 'Demo data reset successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SystemController();
