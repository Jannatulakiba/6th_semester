import logger from './shared/utils/logger.js';
import validateEnv from './config/env.js';
import connectCloudinary from './config/cloudinary.js';
import app from './app.js';
import config from './config/index.js';
import { startKeepAlive } from './shared/utils/keepAlive.js';
import connectDB from './config/db.js';

// Validate environment variables before doing anything
validateEnv();
connectDB()
// Pre-initialize connections
connectCloudinary();

// Start the server
app.listen(config.port, () => {
  logger.info(`🚀 Server is running on PORT: ${config.port}`);
  
  // Start keep-alive self-pinging loop if deployed on Render
  if (process.env.RENDER === 'true') {
    startKeepAlive();
  }
});
