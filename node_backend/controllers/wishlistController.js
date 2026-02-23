const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.find({ user: req.user._id }).populate('product');
  res.json(wishlist);
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const wishlistExists = await Wishlist.findOne({ user: req.user._id, product: productId });

  if (wishlistExists) {
    res.status(400);
    throw new Error('Product already in wishlist');
  }

  const wishlist = await Wishlist.create({
    user: req.user._id,
    product: productId,
  });

  res.status(201).json(wishlist);
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findById(req.params.id);

  if (wishlist && wishlist.user.toString() === req.user._id.toString()) {
    await wishlist.deleteOne();
    res.json({ message: 'Product removed from wishlist' });
  } else {
    res.status(404);
    throw new Error('Wishlist item not found');
  }
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
