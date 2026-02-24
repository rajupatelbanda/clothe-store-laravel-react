const asyncHandler = require("express-async-handler");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);

  if (!order) {
    res.status(500);
    throw new Error("Some error occured");
  }

  res.json(order);
});

// @desc    Verify Razorpay payment
// @route   POST /api/razorpay/verify
// @access  Private
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest("hex");

  if (digest === razorpay_signature) {
    res.json({ status: "success" });
  } else {
    res.status(400);
    throw new Error("Transaction not legitimate!");
  }
});

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};
