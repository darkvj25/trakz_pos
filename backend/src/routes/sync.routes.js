const express = require('express');
const syncController = require('../controllers/sync.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/status', authenticate, syncController.getStatus);
router.post('/start', authenticate, syncController.startSync);
router.get('/history', authenticate, syncController.getHistory);

module.exports = router;
