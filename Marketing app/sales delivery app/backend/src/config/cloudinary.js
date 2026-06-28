import logger from '../shared/utils/logger.js';
import { v2 as cloudinary } from 'cloudinary';
import config from './index.js';

const connectCloudinary = () => {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
  logger.info('✅ Cloudinary Configured');
};

export default connectCloudinary;
