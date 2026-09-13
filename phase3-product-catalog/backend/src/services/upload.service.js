const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/products');
const THUMB_DIR = path.join(UPLOAD_DIR, 'thumbnails');

// Ensure upload directories exist
[UPLOAD_DIR, THUMB_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Store in memory first so Sharp can process before writing to disk
// (swap storage for Cloudinary/S3 SDK upload if you go that route instead)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG or WEBP images are allowed'), false);
  }
  cb(null, true);
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 }, // 5MB per file, max 8 images
});

/**
 * Processes an uploaded image buffer:
 * - resizes main image to max 1200px wide, converts to webp
 * - generates a 300px thumbnail
 * Returns { url, thumbnailUrl } to be saved on ProductImage.
 */
exports.processProductImage = async (fileBuffer, originalName) => {
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  const mainPath = path.join(UPLOAD_DIR, `${filename}.webp`);
  const thumbPath = path.join(THUMB_DIR, `${filename}-thumb.webp`);

  await sharp(fileBuffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(mainPath);

  await sharp(fileBuffer)
    .resize({ width: 300, height: 300, fit: 'cover' })
    .webp({ quality: 75 })
    .toFile(thumbPath);

  return {
    url: `/uploads/products/${filename}.webp`,
    thumbnailUrl: `/uploads/products/thumbnails/${filename}-thumb.webp`,
  };
};

/**
 * Express route handler: POST /api/products/upload-images
 * Accepts multipart field "images" (array), returns processed URLs.
 * Frontend calls this first, then sends the returned URLs in the
 * create/update product payload (see product.controller.js).
 */
exports.handleProductImageUpload = async (req, res, next) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ success: false, message: 'No images uploaded' });
    }

    const results = await Promise.all(
      req.files.map((file) => exports.processProductImage(file.buffer, file.originalname))
    );

    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};
