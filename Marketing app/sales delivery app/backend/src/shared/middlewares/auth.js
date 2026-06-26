import logger from '../utils/logger.js';
import jwt from 'jsonwebtoken';
import ApiError from '../errors/ApiError.js';
import config from '../../config/index.js';

const TOKEN_ERROR_MESSAGES = {
  TokenExpiredError: 'Token expired',
  JsonWebTokenError: 'Invalid token',
  NotBeforeError: 'Token not yet active',
};

export const authUser = (req, _res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token && req.headers.token) {
    token = req.headers.token;
  }

  if (!token) {
    return next(ApiError.unauthorized('Not Authorized, Login Again'));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = { id: decoded.id, email: decoded.email };

    if (!req.body) {
      req.body = {};
    }
    req.body.userId = decoded.id;

    next();
  } catch (error) {
    logger.error(`JWT verification failed: ${error.name} - ${error.message}`);
    const message = TOKEN_ERROR_MESSAGES[error.name] || 'Authentication failed';
    return next(ApiError.unauthorized(message));
  }
};

export default authUser;
