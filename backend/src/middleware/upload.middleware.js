/**
 * src/middleware/upload.middleware.js
 *
 * Multer configuration for admin uploads.
 */

const fs = require('fs');
const path = require('path');
const multer = require('multer');

const { env } = require('../config/env');
const { newId } = require('../utils/id');
const { badRequest } = require('./error.middleware');

const uploadBaseDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
const petUploadDir = path.join(uploadBaseDir, 'pets');

fs.mkdirSync(petUploadDir, { recursive: true });

const mimeToExt = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, petUploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = mimeToExt[file.mimetype];
    cb(null, `pet-${newId()}${ext}`);
  }
});

const uploadPetImage = multer({
  storage,
  limits: {
    fileSize: env.MAX_UPLOAD_BYTES
  },
  fileFilter: (_req, file, cb) => {
    if (!mimeToExt[file.mimetype]) {
      return cb(
        badRequest('Invalid image file type. Only JPEG, PNG, and WEBP are allowed.')
      );
    }
    return cb(null, true);
  }
});

module.exports = { uploadPetImage };