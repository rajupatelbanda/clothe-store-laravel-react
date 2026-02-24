const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ONLY ensure upload directory exists for local development
// Vercel filesystem is read-only at the root
if (process.env.NODE_ENV !== 'production') {
  const uploadDir = 'uploads/';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Vercel only allows writing to /tmp
    const dest = process.env.NODE_ENV === 'production' ? '/tmp' : 'uploads/';
    cb(null, dest);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
