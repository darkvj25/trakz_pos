const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/summary', authenticate, dashboardController.getSummary);
router.get('/revenue', authenticate, dashboardController.getRevenue);
router.get('/payment-statistics', authenticate, dashboardController.getPaymentStatistics);
router.get('/order-statistics', authenticate, dashboardController.getOrderStatistics);

module.exports = router;
