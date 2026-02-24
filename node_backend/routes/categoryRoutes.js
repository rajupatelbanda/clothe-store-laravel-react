const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

router.get('/categories', getCategories);
router.get('/admin/categories', protect, admin, getCategories);
router.get('/categories/:slug', getCategoryBySlug);

// Admin routes
router.post('/admin/categories', protect, admin, upload.single('image'), createCategory);
router.put('/admin/categories/:id', protect, admin, upload.single('image'), updateCategory);
router.post('/admin/categories/:id', protect, admin, upload.single('image'), updateCategory); // Laravel style
router.delete('/admin/categories/:id', protect, admin, deleteCategory);

module.exports = router;
