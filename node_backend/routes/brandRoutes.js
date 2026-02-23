const express = require('express');
const router = express.Router();
const {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} = require('../controllers/brandController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/brands', getBrands);
router.get('/admin/brands', protect, admin, getBrands);

// Admin routes
router.post('/admin/brands', protect, admin, createBrand);
router.put('/admin/brands/:id', protect, admin, updateBrand);
router.post('/admin/brands/:id', protect, admin, updateBrand);
router.delete('/admin/brands/:id', protect, admin, deleteBrand);

module.exports = router;
