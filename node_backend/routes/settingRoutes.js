const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
} = require('../controllers/settingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/settings', getSettings);

// Admin routes
router.post('/admin/settings', protect, admin, updateSettings);

module.exports = router;
