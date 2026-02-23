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

router.get('/logs', protect, admin, getLogs);
router.get('/logs/:filename', protect, admin, viewLog);
router.delete('/logs/:filename', protect, admin, deleteLog);
router.post('/backup', protect, admin, backupDatabase);
router.get('/backup/download/:filename', protect, admin, downloadBackup);
router.post('/cache/clear/:type', protect, admin, clearCache);

module.exports = router;
