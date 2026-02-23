const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/orders', protect, getMyOrders);
router.post('/orders', protect, addOrderItems);
router.get('/orders/:id', protect, getOrderById);

// Admin routes
router.get('/admin/all-orders', protect, admin, getOrders);
router.get('/admin/orders', protect, admin, getOrders); // Extra match
router.patch('/admin/orders/:id/status', protect, admin, updateOrderStatus);
router.post('/admin/orders/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
