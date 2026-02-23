const express = require('express');
const router = express.Router();
const {
  getReviews,
  createReview,
  updateReviewStatus,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/reviews', protect, createReview);

// Admin routes
router.get('/admin/reviews', protect, admin, getReviews);
router.patch('/admin/reviews/:id/status', protect, admin, updateReviewStatus);
router.post('/admin/reviews/:id/status', protect, admin, updateReviewStatus);
router.delete('/admin/reviews/:id', protect, admin, deleteReview);

module.exports = router;
