const express = require('express');
const router = express.Router();
const {
  getCoupons,
  applyCoupon,
  createCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/coupons', getCoupons);
router.post('/coupons/apply', protect, applyCoupon);

// Admin routes
router.get('/admin/coupons', protect, admin, getCoupons);
router.post('/admin/coupons', protect, admin, createCoupon);
router.delete('/admin/coupons/:id', protect, admin, deleteCoupon);

module.exports = router;
