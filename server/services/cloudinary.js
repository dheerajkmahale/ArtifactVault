import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Uploads a local file path or buffer to Cloudinary
 * @param {string|Buffer} fileInput - Local file path or Buffer
 * @param {object} options - Optional Cloudinary upload options
 * @returns {Promise<object>} Cloudinary upload result
 */
export async function uploadToCloudinary(fileInput, options = {}) {
  const defaultOptions = {
    folder: 'artifactvault',
    resource_type: 'image',
    ...options,
  };

  if (Buffer.isBuffer(fileInput)) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        defaultOptions,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(fileInput);
    });
  }

  return cloudinary.uploader.upload(fileInput, defaultOptions);
}

/**
 * Deletes an image asset from Cloudinary
 * @param {string} publicId - Cloudinary asset public_id
 * @returns {Promise<object|null>}
 */
export async function deleteFromCloudinary(publicId) {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('[Cloudinary] Asset deletion warning:', err.message || err);
    return null;
  }
}
