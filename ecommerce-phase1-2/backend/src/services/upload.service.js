const sharp = require("sharp");
const fs = require("fs/promises");
const path = require("path");

// Re-encodes the uploaded file through sharp (strips EXIF/metadata, caps
// dimensions, converts to webp). Re-encoding also protects against
// polyglot files that pass MIME checks but aren't valid images.
const processProfileImage = async (filePath) => {
  const outputPath = filePath.replace(path.extname(filePath), ".webp");

  await sharp(filePath)
    .resize(512, 512, { fit: "cover" })
    .webp({ quality: 80 })
    .toFile(outputPath);

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

module.exports = { processProfileImage, processProductImage };
