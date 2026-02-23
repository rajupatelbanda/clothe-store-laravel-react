const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');

// @desc    Get all reviews (Admin)
// @route   GET /api/admin/reviews
// @access  Private/Admin
const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({}).populate('user', 'name').populate('product', 'name');
  res.json(reviews);
});

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment, productId, product_id } = req.body;

  const review = await Review.create({
    user: req.user._id,
    product: productId || product_id,
    rating: Number(rating),
    comment,
  });

  res.status(201).json(review);
});

// @desc    Update review status (Approve)
// @route   PATCH /api/admin/reviews/:id/status
// @access  Private/Admin
const updateReviewStatus = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review) {
    review.is_approved = req.body.is_approved !== undefined ? req.body.is_approved : review.is_approved;
    const updatedReview = await review.save();
    res.json(updatedReview);
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

// @desc    Delete a review
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review) {
    await review.deleteOne();
    res.json({ message: 'Review removed' });
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

module.exports = {
  getReviews,
  createReview,
  updateReviewStatus,
  deleteReview,
};
