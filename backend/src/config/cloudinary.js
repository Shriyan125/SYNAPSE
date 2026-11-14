import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';
import { logger } from './logger.js';

// Configure Cloudinary SDK with environment variables
cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true,
});

/**
 * Upload a file buffer to Cloudinary using upload_stream
 * @param {Buffer} buffer - File buffer from multer
 * @param {object} options - Custom Cloudinary options
 * @returns {Promise<import('cloudinary').UploadApiResponse>}
 */
export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
      const err = new Error(
        'Cloudinary credentials are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.'
      );
      err.statusCode = 500;
      err.code = 'CLOUDINARY_CONFIG_ERROR';
      logger.error(err.message);
      return reject(err);
    }

    const uploadOptions = {
      folder: `${env.cloudinary.folder}/avatars`,
      resource_type: 'image',
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        logger.error(`Cloudinary upload failed: ${error.message}`);
        return reject(error);
      }
      resolve(result);
    });

    stream.end(buffer);
  });
};

export const cloudinaryService = {
  uploadToCloudinary,
};

export { cloudinary };
