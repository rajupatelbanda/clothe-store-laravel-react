const express = require('express');
const router = express.Router();
const {
  getLogs,
  viewLog,
  deleteLog,
  backupDatabase,
  downloadBackup,
  clearCache,
} = require('../controllers/systemController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/admin/system/logs', protect, admin, getLogs);
router.get('/admin/system/logs/:filename', protect, admin, viewLog);
router.delete('/admin/system/logs/:filename', protect, admin, deleteLog);
router.post('/admin/system/backup', protect, admin, backupDatabase);
router.get('/admin/system/backup/download/:filename', protect, admin, downloadBackup);
router.post('/admin/system/cache/clear/:type', protect, admin, clearCache);

module.exports = router;
