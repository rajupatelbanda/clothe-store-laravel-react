const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    items,
    address,
    payment_method,
    shipping,
    total,
    phone,
    payment_id,
    payment_status,
    coupon_id,
  } = req.body;

  if (items && items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const order = new Order({
      user: req.user._id,
      address: address,
      payment_method: payment_method,
      total: total,
      phone,
      shipping_charge: shipping || 0,
      payment_id: payment_id || null,
      payment_status: payment_status || 'unpaid',
      coupon: coupon_id || null,
    });

    const createdOrder = await order.save();

    const createdOrderItems = await Promise.all(
      items.map(async (item) => {
        const orderItem = new OrderItem({
          order: createdOrder._id,
          product: item.product_id,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size,
        });
        return await orderItem.save();
      })
    );

    res.status(201).json({ order: createdOrder, items: createdOrderItems });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  const items = await OrderItem.find({ order: req.params.id }).populate('product');

  if (order) {
    const mappedOrder = {
      ...order._doc,
      id: order._id,
      user: order.user ? { ...order.user._doc, id: order.user._id } : null,
    };
    const mappedItems = items.map(i => ({
      ...i._doc,
      id: i._id,
      product: i.product ? { ...i.product._doc, id: i.product._id } : null,
    }));
    res.json({ order: mappedOrder, items: mappedItems });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  const mappedOrders = orders.map(o => ({
    ...o._doc,
    id: o._id,
  }));
  res.json(mappedOrders);
});

// @desc    Get all orders
// @route   GET /api/admin/all-orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
  const mappedOrders = orders.map(o => ({
    ...o._doc,
    id: o._id,
    user: o.user ? { ...o.user._doc, id: o.user._id } : null,
  }));
  res.json(mappedOrders);
});

// @desc    Update order status
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status || order.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
};
