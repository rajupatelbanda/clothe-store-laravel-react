const express = require('express');
const router = express.Router();
const {
  getSubcategories,
  createSubcategory,
  deleteSubcategory,
} = require('../controllers/subcategoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/subcategories', getSubcategories);
router.get('/admin/subcategories', protect, admin, getSubcategories);

// Admin routes
router.post('/admin/subcategories', protect, admin, createSubcategory);
router.delete('/admin/subcategories/:id', protect, admin, deleteSubcategory);

module.exports = router;
