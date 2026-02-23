const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
  const productsCount = await Product.countDocuments();
  const ordersCount = await Order.countDocuments();
  const usersCount = await User.countDocuments();

  const orders = await Order.find({});
  const totalSales = orders.reduce((acc, order) => acc + order.total, 0);

  res.json({
    productsCount,
    ordersCount,
    usersCount,
    totalSales,
  });
});

module.exports = { getStats };
