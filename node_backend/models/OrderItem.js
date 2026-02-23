const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
  },
  size: {
    type: String,
  },
}, {
  timestamps: true,
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
