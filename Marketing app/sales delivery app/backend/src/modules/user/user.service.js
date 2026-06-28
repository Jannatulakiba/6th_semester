import bcrypt from 'bcryptjs';
import userRepository from './user.repository.js';
import orderModel from '../order/order.model.js'; // Will be created in order module
import { uploadToCloudinary, deleteFromCloudinary } from '../../shared/utils/cloudinaryHelper.js';
import { BCRYPT_SALT_ROUNDS, CLOUDINARY_FOLDERS } from '../../shared/constants/index.js';
import ApiError from '../../shared/errors/ApiError.js';
import { validatePassword } from './user.validation.js';

class UserService {
  async findUserById(id) {
    const user = await userRepository.findByIdExcludePassword(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return this.sanitizeUser(user);
  }

  async getDashboardData(userId) {
    const [user, userOrders] = await Promise.all([
      userRepository.findByIdExcludePassword(userId),
      orderModel.find({ userId }).sort({ date: -1 }),
    ]);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const totalOrders = userOrders.length;
    const recentOrders = userOrders.slice(0, 5);
    const totalSpent = userOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const pendingOrders = userOrders.filter(o => o.status !== 'Delivered').length;

    return {
      user: { ...this.sanitizeUser(user), createdAt: user.createdAt },
      stats: { totalOrders, totalSpent, pendingOrders },
      recentOrders,
    };
  }

  async updateUserProfile(userId, { name, bio }, photoBuffer) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;

    if (photoBuffer) {
      if (user.cloudinaryId) {
        await deleteFromCloudinary(user.cloudinaryId);
      }
      const result = await uploadToCloudinary(photoBuffer, CLOUDINARY_FOLDERS.PROFILES);
      user.profilePhoto = result.secure_url;
      user.cloudinaryId = result.public_id;
    }

    await user.save();
    return this.sanitizeUser(user);
  }

  async changeUserPassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw ApiError.badRequest('Current password and new password are required');
    }

    const pwdCheck = validatePassword(newPassword);
    if (!pwdCheck.valid) {
      throw ApiError.badRequest(pwdCheck.message);
    }

    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    await user.save();
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

export default new UserService();
