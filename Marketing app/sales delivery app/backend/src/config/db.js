import logger from '../shared/utils/logger.js';
import mongoose from 'mongoose';
import config from './index.js';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  mongoose.connection.on('connected', () => {
    logger.info('✅ MongoDB Connected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`❌ MongoDB Connection Error: ${err.message}`);
  });

  try {
    const maskedUri = config.mongodbUri ? config.mongodbUri.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED';
    logger.info(`📡 Attempting to connect to MongoDB Atlas...`);

    await mongoose.connect(config.mongodbUri, {
      dbName: config.dbName,
      family: 4 // Force IPv4
    });

    logger.info('✅ MongoDB Initialized');
  } catch (error) {
    logger.error(`❌ MongoDB Initial Connection Failed: ${error.message}`);
    throw error;
  }
};

export default connectDB;
