import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userRepository from '../user/user.repository.js';
import { EMAIL_REGEX, validatePassword } from '../user/user.validation.js';
import { uploadToCloudinary } from '../../shared/utils/cloudinaryHelper.js';
import { BCRYPT_SALT_ROUNDS, CLOUDINARY_FOLDERS } from '../../shared/constants/index.js';
import ApiError from '../../shared/errors/ApiError.js';
import config from '../../config/index.js';

class AuthService {
  generateAccessToken(user) {
    return jwt.sign(
      { id: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { id: user._id },
      config.jwtSecret,
      { expiresIn: config.refreshExpiresIn }
    );
  }

  async register({ name, email, password }, photoBuffer = null) {
    if (!email || !password) {
      throw ApiError.badRequest('Email and password are required');
    }

    if (!EMAIL_REGEX.test(email)) {
      throw ApiError.badRequest('Please enter a valid email address');
    }

    const pwdCheck = validatePassword(password);
    if (!pwdCheck.valid) {
      throw ApiError.badRequest(pwdCheck.message);
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw ApiError.conflict('Email already exists');
    }

    let profilePhoto = '';
    let cloudinaryId = '';

    if (photoBuffer) {
      const result = await uploadToCloudinary(photoBuffer, CLOUDINARY_FOLDERS.PROFILES);
      profilePhoto = result.secure_url;
      cloudinaryId = result.public_id;
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const newUser = await userRepository.create({
      name: name || '',
      email: email.toLowerCase(),
      password: hashedPassword,
      profilePhoto,
      cloudinaryId,
    });

    const accessToken = this.generateAccessToken(newUser);
    const refreshToken = this.generateRefreshToken(newUser);

    await userRepository.addRefreshToken(newUser._id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(newUser),
    };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw ApiError.badRequest('Email and password are required');
    }

    if (!EMAIL_REGEX.test(email)) {
      throw ApiError.badRequest('Please enter a valid email address');
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await userRepository.addRefreshToken(user._id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async adminLogin({ email, password }) {
    if (!email || !password) {
      throw ApiError.badRequest('Email and password are required');
    }

    let user = await userRepository.findByEmail(email);

    if (user && user.role === 'admin') {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw ApiError.unauthorized('Invalid email or password');

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);
      await userRepository.addRefreshToken(user._id, refreshToken);

      return { accessToken, refreshToken, user: this.sanitizeUser(user) };
    }

    if (email === config.adminEmail && password === config.adminPassword) {
      if (!user) {
        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        user = await userRepository.create({
          name: 'Super Admin',
          email: email.toLowerCase(),
          password: hashedPassword,
          role: 'admin',
        });
      } else if (user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);
      await userRepository.addRefreshToken(user._id, refreshToken);

      return { accessToken, refreshToken, user: this.sanitizeUser(user) };
    }

    throw ApiError.unauthorized('Invalid email or password');
  }

  async refresh(oldRefreshToken) {
    if (!oldRefreshToken) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    try {
      const decoded = jwt.verify(oldRefreshToken, config.jwtSecret);
      const user = await userRepository.findByIdWithPassword(decoded.id);

      if (!user) {
        throw ApiError.unauthorized('Invalid refresh token');
      }

      // Check if the old refresh token is in the database list
      const isTokenPresent = user.refreshTokens.includes(oldRefreshToken);

      if (!isTokenPresent) {
        // Potential Token Reuse / Hijacking!
        // Clear all active tokens for this user to force full logout
        await userRepository.clearAllRefreshTokens(user._id);
        throw ApiError.forbidden('Session expired or hijacked. Please login again.');
      }

      // Rotate token: remove old, generate and add new
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Perform atomic update: remove old, push new
      await userRepository.removeRefreshToken(user._id, oldRefreshToken);
      await userRepository.addRefreshToken(user._id, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  }

  async logout(userId, refreshToken) {
    if (userId && refreshToken) {
      await userRepository.removeRefreshToken(userId, refreshToken);
    }
  }

  sanitizeUser(user) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto,
      role: user.role,
      bio: user.bio,
    };
  }
}

export default new AuthService();
