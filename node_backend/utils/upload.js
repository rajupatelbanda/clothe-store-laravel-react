const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "gemini-cloth-store", // Specify a folder in Cloudinary
    format: async (req, file) => "webp", // supports data URI
    public_id: (req, file) => `${file.fieldname}-${Date.now()}`,
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(file.originalname.toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Images only!");
  }
}

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
});

module.exports = upload;
