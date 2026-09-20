import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import upload from "../middlewares/upload.middleware.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// Re-encodes the uploaded file through sharp (strips EXIF/metadata, caps
// dimensions, converts to webp). Re-encoding also protects against
// polyglot files that pass MIME checks but aren't valid images.
const processProfileImage = async (filePath) => {
  const outputPath = filePath.replace(path.extname(filePath), ".webp");

  await sharp(filePath).resize(512, 512, { fit: "cover" }).webp({ quality: 80 }).toFile(outputPath);

  if (outputPath !== filePath) {
    await fs.unlink(filePath); // remove original upload
  }

  return outputPath;
};

const processProductImage = async (filePath) => {
  const outputPath = filePath.replace(path.extname(filePath), ".webp");

  await sharp(filePath)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(outputPath);

  if (outputPath !== filePath) {
    await fs.unlink(filePath);
  }

  return outputPath;
};

/**
 * FIX: `product.routes.js` imports `{ upload, handleProductImageUpload }`
 * from this file for `POST /api/products/upload-images`, but neither was
 * actually exported here — `upload` didn't exist in this file at all (the
 * working multer instance lives in `middlewares/upload.middleware.js`),
 * and `handleProductImageUpload` only ever existed as a commented-out
 * sketch. This crashed the whole app at boot (`upload.array(...)` on
 * `undefined`) and meant product image upload never actually worked.
 */
const handleProductImageUpload = async (req, res) => {
  if (!req.files || !req.files.length) {
    throw new ApiError(400, "No images uploaded");
  }

  const urls = await Promise.all(
    req.files.map(async (file) => {
      const processedPath = await processProductImage(file.path);
      return `/uploads/${path.basename(processedPath)}`;
    })
  );

  res.status(200).json(new ApiResponse(200, urls, "Images uploaded"));
};

export { processProfileImage, processProductImage, upload, handleProductImageUpload };