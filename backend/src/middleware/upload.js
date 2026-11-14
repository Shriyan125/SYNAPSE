import multer from 'multer';
import { BadRequestError } from '../utils/errors.js';

// Use memory storage so we can stream directly to Cloudinary without writing to disk
const storage = multer.memoryStorage();

// File filter restricting uploads to standard image MIME types
const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        'Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed for avatars.'
      )
    );
  }
};

/**
 * Avatar image upload middleware (max 5MB)
 */
export const uploadAvatarMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
  },
  fileFilter: imageFilter,
}).single('avatar');
