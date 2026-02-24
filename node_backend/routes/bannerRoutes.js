const express = require('express');
const router = express.Router();
const {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/bannerController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

router.get('/banners', getBanners);
router.get('/admin/banners', protect, admin, getBanners);

// Admin routes
router.post('/admin/banners', protect, admin, upload.single('image'), createBanner);
router.put('/admin/banners/:id', protect, admin, upload.single('image'), updateBanner);
router.post('/admin/banners/:id', protect, admin, upload.single('image'), updateBanner); // Support Laravel _method=PUT trick if needed
router.delete('/admin/banners/:id', protect, admin, deleteBanner);

module.exports = router;
