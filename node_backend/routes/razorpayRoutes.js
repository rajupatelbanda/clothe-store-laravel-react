const express = require("express");
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/razorpayController");
const { protect } = require("../middleware/authMiddleware");

router.post("/razorpay/order", protect, createRazorpayOrder);
router.post("/razorpay/verify", protect, verifyRazorpayPayment);

module.exports = router;
