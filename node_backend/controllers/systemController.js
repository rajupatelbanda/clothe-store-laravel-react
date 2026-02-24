const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');

// @desc    Get all log files
// @route   GET /api/admin/system/logs
// @access  Private/Admin
const getLogs = asyncHandler(async (req, res) => {
  const logDir = path.join(__dirname, '../logs');
  
  // Only try to create/read logs if not in production or if directory actually exists
  if (!fs.existsSync(logDir)) {
    if (process.env.NODE_ENV === 'production') {
      return res.json([]); // Return empty logs on Vercel safely
    }
    fs.mkdirSync(logDir);
  }

  const files = fs.readdirSync(logDir);
  const logs = files.map(file => {
    const stats = fs.statSync(path.join(logDir, file));
    return {
      name: file,
      size: (stats.size / 1024).toFixed(2) + ' KB',
      last_modified: stats.mtime.toLocaleString('en-US'),
    };
  });

  res.json(logs);
});

// @desc    View log file content
// @route   GET /api/admin/system/logs/:filename
// @access  Private/Admin
const viewLog = asyncHandler(async (req, res) => {
  const logPath = path.join(__dirname, '../logs', req.params.filename);
  if (fs.existsSync(logPath)) {
    const content = fs.readFileSync(logPath, 'utf8');
    res.json({ content });
  } else {
    res.status(404);
    throw new Error('Log file not found');
  }
});

// @desc    Delete log file
// @route   DELETE /api/admin/system/logs/:filename
// @access  Private/Admin
const deleteLog = asyncHandler(async (req, res) => {
  const logPath = path.join(__dirname, '../logs', req.params.filename);
  if (fs.existsSync(logPath)) {
    fs.unlinkSync(logPath);
    res.json({ message: 'Log file deleted' });
  } else {
    res.status(404);
    throw new Error('Log file not found');
  }
});

// @desc    Backup database (Mock)
// @route   POST /api/admin/system/backup
// @access  Private/Admin
const backupDatabase = asyncHandler(async (req, res) => {
  const filename = `backup-${Date.now()}.json`;
  // In a real app, you'd use mongodump or export collections to JSON
  res.json({ message: 'Backup created', filename });
});

// @desc    Download backup (Mock)
// @route   GET /api/admin/system/backup/download/:filename
// @access  Private/Admin
const downloadBackup = asyncHandler(async (req, res) => {
  res.send('Backup data stream...');
});

// @desc    Clear cache (Mock)
// @route   POST /api/admin/system/cache/clear/:type
// @access  Private/Admin
const clearCache = asyncHandler(async (req, res) => {
  res.json({ message: `${req.params.type} cache cleared successfully` });
});

module.exports = {
  getLogs,
  viewLog,
  deleteLog,
  backupDatabase,
  downloadBackup,
  clearCache,
};
