import { z } from 'zod';
import logger from '../shared/utils/logger.js';

const envSchema = z.object({
  PORT: z.string().transform(Number).default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().refine(
    (val) => val.startsWith('mongodb://') || val.startsWith('mongodb+srv://'),
    { message: 'MONGODB_URI must be a valid MongoDB connection string' }
  ),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters long'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email'),
  ADMIN_PASSWORD: z.string().min(6, 'ADMIN_PASSWORD must be at least 6 characters'),
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  ADMIN_SECRET_KEY: z.string().min(1, 'ADMIN_SECRET_KEY is required'),
});

export const validateEnv = () => {
  try {
    const parsed = envSchema.parse(process.env);
    // Bind parsed values back to process.env for downstream usage (especially parsed/transformed ones)
    Object.assign(process.env, parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('❌ Environment validation failed:');
      error.issues.forEach((err) => {
        logger.error(`   - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export default validateEnv;
