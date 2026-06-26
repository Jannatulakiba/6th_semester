import express from 'express';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import logger from './shared/utils/logger.js';
import connectDB from './config/db.js';
import setupSecurity from './shared/middlewares/security.js';
import routes from './routes/index.js';
import errorHandler from './shared/middlewares/errorHandler.js';

const app = express();

// ─── Global Middlewares ──────────────────────────────────────
app.use(cookieParser());
setupSecurity(app);

app.use(pinoHttp({ logger }));
app.use(express.json());

// Database connection middleware (ensures DB is ready before routes)
// app.use(async (_req, _res, next) => {
//   try {
//     await connectDB();
//     next();
//   } catch (error) {
//     next(error); // Pass to global error handler
//   }
// });

// ─── API Routes ──────────────────────────────────────────────
app.use('/api', routes);

// ─── Health Check ────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Cloth Delivery API is running (Modular) 🚀' });
});

// ─── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler (must be LAST) ─────────────────────
app.use(errorHandler);

export default app;
