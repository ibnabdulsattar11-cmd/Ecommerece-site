import multer from "multer";

import path from "node:path";

import crypto from "node:crypto";

import ApiError from "../utils/ApiError.js";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// NOTE: local disk storage is fine for development. In production, swap the
// storage engine for a Cloudinary/S3 upload stream (see services/upload.service.js).
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "../../uploads")),
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomBytes(16).toString("hex");
    cb(null, `${uniqueName}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new ApiError(400, "Only JPEG, PNG, and WEBP images are allowed"),
      false,
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export default upload;
