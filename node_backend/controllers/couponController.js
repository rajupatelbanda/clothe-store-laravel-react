const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

// @desc    Fetch all coupons
// @route   GET /api/coupons
// @access  Public
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({ is_active: true });
  const mappedCoupons = coupons.map(c => ({
    ...c._doc,
    id: c._id,
  }));
  res.json(mappedCoupons);
});

// @desc    Apply coupon
// @route   POST /api/coupons/apply
// @access  Private
const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const coupon = await Coupon.findOne({ code, is_active: true });

  if (coupon) {
    if (coupon.expiry_date < new Date()) {
      res.status(400);
      throw new Error('Coupon has expired');
    }
    res.json({
      ...coupon._doc,
      id: coupon._id,
    });
  } else {
    res.status(404);
    throw new Error('Invalid coupon code');
  }
});

// @desc    Create a coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discount_type, discount_value, expiry_date } = req.body;

  const coupon = await Coupon.create({
    code,
    discount_type,
    discount_value,
    expiry_date,
  });

  res.status(201).json(coupon);
});

// @desc    Delete a coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    await coupon.deleteOne();
    res.json({ message: 'Coupon removed' });
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});

module.exports = {
  getCoupons,
  applyCoupon,
  createCoupon,
  deleteCoupon,
};
