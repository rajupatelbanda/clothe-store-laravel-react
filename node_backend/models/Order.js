const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  total: {
    type: Number,
    required: true,
    default: 0.0,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  payment_id: {
    type: String,
  },
  payment_status: {
    type: String,
    default: 'unpaid',
  },
  payment_method: {
    type: String,
    default: 'stripe',
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  shipping_charge: {
    type: Number,
    default: 0.0,
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
  },
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
