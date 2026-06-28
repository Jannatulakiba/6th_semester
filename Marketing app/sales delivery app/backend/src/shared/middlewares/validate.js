import { ZodError } from 'zod';
import ApiError from '../errors/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      next(ApiError.badRequest('Validation failed', errors));
    } else {
      next(error);
    }
  }
};

export default validate;
