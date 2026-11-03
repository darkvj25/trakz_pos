const express = require('express');
const systemController = require('../controllers/system.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/status', systemController.getStatus);
router.get('/logs', authenticate, systemController.getLogs);
router.get('/settings', authenticate, systemController.getSettings);
router.post('/reset-demo', authenticate, systemController.resetDemo);

module.exports = router;
