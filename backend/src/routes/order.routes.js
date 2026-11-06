const express = require('express');
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, orderController.getOrders);
router.post('/', authenticate, orderController.createOrder);
router.get('/export', authenticate, orderController.exportOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.get('/:id/items', authenticate, orderController.getOrderItems);

module.exports = router;
