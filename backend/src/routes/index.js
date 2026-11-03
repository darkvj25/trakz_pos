const express = require('express');
const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');
const syncRoutes = require('./sync.routes');
const systemRoutes = require('./system.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/sync', syncRoutes);
router.use('/system', systemRoutes);

module.exports = router;
