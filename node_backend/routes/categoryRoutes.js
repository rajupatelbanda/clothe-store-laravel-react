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

router.get('/categories', getCategories);
router.get('/admin/categories', protect, admin, getCategories);
router.get('/categories/:slug', getCategoryBySlug);

// Admin routes
router.post('/admin/categories', protect, admin, createCategory);
router.put('/admin/categories/:id', protect, admin, updateCategory);
router.post('/admin/categories/:id', protect, admin, updateCategory); // Laravel style
router.delete('/admin/categories/:id', protect, admin, deleteCategory);

module.exports = router;
