import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

const allowedOrigins = [
  'https://cloth-delivery-app-69dz.vercel.app', // Frontend
  'https://cloth-delivery-app-6p82.vercel.app', // Admin
  'http://localhost:5173',
  'http://localhost:5174',
];

export const setupSecurity = (app) => {
  // Trust proxy for rate limiting behind reverse proxies (like Render)
  app.set('trust proxy', 1);

  // Helmet secure headers
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // Make req.query writable for Express 5 compatibility with hpp/mongoSanitize
  app.use((req, res, next) => {
    Object.defineProperty(req, 'query', {
      value: { ...req.query },
      writable: true,
      configurable: true,
      enumerable: true,
    });
    next();
  });

  // CORS config
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Fallback or allow all in development, but be strict in production if needed
        callback(null, true);
      }
    },
    credentials: true,
  }));

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // Prevent NoSQL Query Injection
  app.use(mongoSanitize());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 200, // Limit each IP to 200 requests per window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes.',
    },
    validate: { xForwardedForHeader: false, default: true },
  });
  app.use('/api', limiter);
};

export default setupSecurity;
