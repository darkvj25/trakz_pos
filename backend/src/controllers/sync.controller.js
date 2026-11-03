const syncService = require('../services/sync.service');
const { sendSuccess } = require('../utils/response');

class SyncController {
  async getStatus(req, res, next) {
    try {
      const status = await syncService.getSyncStatus();
      return sendSuccess(res, 'Sync status retrieved', status);
    } catch (error) {
      next(error);
    }
  }

  async startSync(req, res, next) {
    try {
      const syncLog = await syncService.triggerSync(req.body.syncType || 'MANUAL');
      return sendSuccess(res, 'Synchronization initiated successfully', syncLog);
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const history = await syncService.getSyncHistory(req.query.limit);
      return sendSuccess(res, 'Sync history retrieved', history);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SyncController();
