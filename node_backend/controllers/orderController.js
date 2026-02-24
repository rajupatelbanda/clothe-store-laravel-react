const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');

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

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    if (!req.user) {
      res.status(401);
      throw new Error('User context missing');
    }

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

    // Send order confirmation email
    try {
      const emailItems = (createdOrderItems || []).map(item => `<li>${item.quantity} x Item (₹${item.price})</li>`).join('');
      
      if (req.user && req.user.email) {
        await sendEmail({
          email: req.user.email,
          subject: `Order Confirmation - #${createdOrder._id}`,
          message: `Your order has been placed successfully. Order ID: ${createdOrder._id}. Total Amount: ₹${total}`,
          html: `
            <h1>Thank you for your order!</h1>
            <p>Your order <strong>#${createdOrder._id}</strong> has been placed successfully.</p>
            <p><strong>Total Amount:</strong> ₹${total}</p>
            <p><strong>Shipping Address:</strong> ${address}</p>
            <h3>Items:</h3>
            <ul>${emailItems}</ul>
            <p>We will notify you once your order is shipped.</p>
          `
        });
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      // Don't throw error here to avoid breaking the order flow
    }

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
