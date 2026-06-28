import ApiResponse from '../../shared/utils/ApiResponse.js';
import authService from './auth.service.js';

const isProduction = process.env.NODE_ENV === 'production';

const setRefreshTokenCookie = (res, req, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const clearRefreshTokenCookie = (res, req) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: isProduction ? 'none' : 'lax',
  });
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const photoBuffer = req.file?.buffer || null;
    
    const { accessToken, refreshToken, user } = await authService.register(
      { name, email, password },
      photoBuffer
    );

    setRefreshTokenCookie(res, req, refreshToken);
    ApiResponse.created({ accessToken, user }, 'User registered successfully').send(res);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const { accessToken, refreshToken, user } = await authService.login({ email, password });

    setRefreshTokenCookie(res, req, refreshToken);
    ApiResponse.ok({ accessToken, user }, 'Login successful').send(res);
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { accessToken, refreshToken, user } = await authService.adminLogin({ email, password });

    setRefreshTokenCookie(res, req, refreshToken);
    ApiResponse.ok({ accessToken, user }, 'Admin login successful').send(res);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies?.refreshToken;
    const { accessToken, refreshToken: newRefreshToken, user } = await authService.refresh(oldRefreshToken);

    setRefreshTokenCookie(res, req, newRefreshToken);
    ApiResponse.ok({ accessToken, user }, 'Token refreshed successfully').send(res);
  } catch (error) {
    // If refresh token fails, make sure we clear the invalid cookie
    clearRefreshTokenCookie(res, req);
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies?.refreshToken;
    const userId = req.user?.id; // If authUser middleware was run, otherwise decoded manually if needed

    await authService.logout(userId, oldRefreshToken);

    clearRefreshTokenCookie(res, req);
    ApiResponse.ok(null, 'Logged out successfully').send(res);
  } catch (error) {
    next(error);
  }
};

export default {
  registerUser,
  loginUser,
  adminLogin,
  refreshToken,
  logoutUser,
};
