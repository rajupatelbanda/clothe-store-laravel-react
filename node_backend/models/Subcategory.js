const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
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
}, {
  timestamps: true,
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports = Subcategory;
