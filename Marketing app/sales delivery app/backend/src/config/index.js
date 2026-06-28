/**
 * Centralized configuration — single source of truth for all env variables.
 * Import this instead of reading process.env directly throughout the codebase.
 */
const config = Object.freeze({
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  mongodbUri: process.env.MONGODB_URI,
  dbName: 'clothDelivery',

  // Auth
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '15m',           // Short-lived Access Token
  refreshExpiresIn: '7d',        // Long-lived Refresh Token
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,

  // Admin
  adminSecretKey: process.env.ADMIN_SECRET_KEY,

  // App constants
  currency: 'usd',
  deliveryCharge: 10,
});

export default config;
