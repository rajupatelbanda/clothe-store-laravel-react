const express = require('express');
const router = express.Router();
const {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} = require('../controllers/brandController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

router.get('/brands', getBrands);
router.get('/admin/brands', protect, admin, getBrands);

// Admin routes
router.post('/admin/brands', protect, admin, upload.single('image'), createBrand);
router.put('/admin/brands/:id', protect, admin, upload.single('image'), updateBrand);
router.post('/admin/brands/:id', protect, admin, upload.single('image'), updateBrand);
router.delete('/admin/brands/:id', protect, admin, deleteBrand);

module.exports = router;
