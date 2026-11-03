const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, paymentController.getPayments);
router.get('/statistics', authenticate, paymentController.getStatistics);
router.get('/export', authenticate, paymentController.exportPayments);
router.get('/:id', authenticate, paymentController.getPaymentById);

module.exports = router;
