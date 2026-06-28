import ApiResponse from '../../shared/utils/ApiResponse.js';
import adminService from './admin.service.js';

const isProduction = process.env.NODE_ENV === 'production';

const setRefreshTokenCookie = (res, req, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const getAdminStats = async (req, res, next) => {
  try {
    const stats = await adminService.getStats();
    ApiResponse.ok(stats).send(res);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsersWithStats();
    ApiResponse.ok({ users }).send(res);
  } catch (error) {
    next(error);
  }
};

export const adminDeleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    await adminService.deleteUser(id, adminId);
    ApiResponse.ok(null, 'User deleted successfully').send(res);
  } catch (error) {
    next(error);
  }
};

export const adminDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await adminService.deleteProductByAdmin(id);
    ApiResponse.ok(null, 'Product deleted successfully').send(res);
  } catch (error) {
    next(error);
  }
};

export const createFirstAdmin = async (req, res, next) => {
  try {
    const { email, password, name, secretKey } = req.body;
    const { accessToken, refreshToken, user, message, isNew } = await adminService.setupFirstAdmin({
      email,
      password,
      name,
      secretKey,
    });

    setRefreshTokenCookie(res, req, refreshToken);
    ApiResponse.created({ accessToken, user }, message).send(res);
  } catch (error) {
    next(error);
  }
};

export const toggleUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = req.user.id;
    const user = await adminService.changeUserRole(id, role, adminId);
    ApiResponse.ok({ user }, 'User role updated successfully').send(res);
  } catch (error) {
    next(error);
  }
};

export const getChartStats = async (req, res, next) => {
  try {
    const chartData = await adminService.getChartData();
    ApiResponse.ok(chartData).send(res);
  } catch (error) {
    next(error);
  }
};

export default {
  getAdminStats,
  getAllUsers,
  adminDeleteUser,
  adminDeleteProduct,
  createFirstAdmin,
  toggleUserRole,
  getChartStats,
};
