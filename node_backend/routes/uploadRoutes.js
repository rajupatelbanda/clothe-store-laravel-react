const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  const path = req.file.path.replace(/\\/g, '/');
  res.send(`/${path}`);
});

module.exports = router;
