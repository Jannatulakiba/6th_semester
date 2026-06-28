import userModel from '../../modules/user/user.model.js';
import ApiError from '../errors/ApiError.js';

export const isAdmin = async (req, _res, next) => {
  try {
    const user = await userModel.findById(req.user.id).select('role');

    if (!user) {
      return next(ApiError.unauthorized('User not found. Please login again.'));
    }

    if (user.role !== 'admin') {
      return next(ApiError.forbidden('Admin access required'));
    }

    req.userRole = user.role;
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    return next(ApiError.internal('Authorization check failed'));
  }
};

export default isAdmin;
