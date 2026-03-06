const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
} = require('../controllers/settingController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

router.get('/settings', getSettings);

// Admin routes
router.post(
  '/admin/settings',
  protect,
  admin,
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
  ]),
  updateSettings
);

module.exports = router;
