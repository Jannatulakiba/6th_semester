import logger from './logger.js';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

export const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary upload error: ${error.message}`);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (identifier) => {
  if (!identifier) return null;

  try {
    let publicId = identifier;

    if (identifier.startsWith('http')) {
      const parts = identifier.split('/');
      const folderAndFile = parts.slice(-2).join('/');
      publicId = folderAndFile.replace(/\.[^/.]+$/, '');
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error(`Cloudinary delete error: ${error.message}`);
    throw error;
  }
};
