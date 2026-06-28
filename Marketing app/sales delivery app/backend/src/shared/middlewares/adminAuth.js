import logger from '../utils/logger.js';
import jwt from 'jsonwebtoken';
import ApiError from '../errors/ApiError.js';
import config from '../../config/index.js';

export const adminAuth = (req, _res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token && req.headers.token) {
    token = req.headers.token;
  }

  if (!token) {
    return next(ApiError.unauthorized('Not authorized, login again'));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    if (decoded.email !== config.adminEmail) {
      return next(ApiError.forbidden('Not authorized, admin access required'));
    }

    next();
  } catch (error) {
    logger.error(`Admin JWT verification failed: ${error.name} - ${error.message}`);
    return next(ApiError.unauthorized('Invalid or expired admin token'));
  }
};

export default adminAuth;
