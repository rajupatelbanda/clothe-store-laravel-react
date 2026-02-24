const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  res.send(req.file.path);
});

module.exports = router;
