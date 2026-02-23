const express = require('express');
const router = express.Router();
const {
  getPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
} = require('../controllers/pageController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getPages);
router.get('/admin/pages', protect, admin, getPages);
router.get('/:slug', getPageBySlug);

// Admin routes
router.post('/admin/pages', protect, admin, createPage);
router.put('/admin/pages/:id', protect, admin, updatePage);
router.delete('/admin/pages/:id', protect, admin, deletePage);

module.exports = router;
