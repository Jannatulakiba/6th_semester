import ApiResponse from '../../shared/utils/ApiResponse.js';
import userService from './user.service.js';

export const getUser = async (req, res, next) => {
  try {
    const user = await userService.findUserById(req.user.id);
    ApiResponse.ok({ user }).send(res);
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const data = await userService.getDashboardData(req.user.id);
    ApiResponse.ok(data).send(res);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    const photoBuffer = req.file?.buffer || null;
    const user = await userService.updateUserProfile(req.user.id, { name, bio }, photoBuffer);
    ApiResponse.ok({ user }, 'Profile updated successfully').send(res);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await userService.changeUserPassword(req.user.id, currentPassword, newPassword);
    ApiResponse.ok(null, 'Password changed successfully').send(res);
  } catch (error) {
    next(error);
  }
};

export default {
  getUser,
  getDashboardStats,
  updateProfile,
  changePassword,
};
