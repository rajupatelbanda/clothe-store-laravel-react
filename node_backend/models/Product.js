const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0.0,
  },
  discount_price: {
    type: Number,
  },
  discount_percentage: {
    type: Number,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  colors: [String],
  sizes: [String],
  images: [String],
  video: {
    type: String,
  },
  is_featured: {
    type: Boolean,
    default: false,
  },
  is_trending: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  variations: [{
    color: String,
    size: String,
    price: Number,
    stock: Number,
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
