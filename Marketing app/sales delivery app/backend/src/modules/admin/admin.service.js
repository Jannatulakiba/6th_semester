import bcrypt from 'bcryptjs';
import userRepository from '../user/user.repository.js';
import productRepository from '../product/product.repository.js';
import orderRepository from '../order/order.repository.js';
import { deleteFromCloudinary } from '../../shared/utils/cloudinaryHelper.js';
import { BCRYPT_SALT_ROUNDS } from '../../shared/constants/index.js';
import ApiError from '../../shared/errors/ApiError.js';
import authService from '../auth/auth.service.js';
import config from '../../config/index.js';

const LIMITS = {
  TOP_RATED: 5,
  MOST_ACTIVE: 5,
  RECENT_ADMIN: 10,
};

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

class AdminService {
  /**
   * Get high-level admin dashboard statistics.
   */
  async getStats() {
    const [totalUsers, totalProducts, totalOrders, recentOrders] = await Promise.all([
      userRepository.countDocuments(),
      productRepository.count(),
      orderRepository.countDocuments(),
      orderRepository.model.find().sort({ date: -1 }).limit(5),
    ]);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [newUsersThisWeek, newProductsThisWeek, newOrdersThisWeek] = await Promise.all([
      userRepository.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      productRepository.count({ createdAt: { $gte: oneWeekAgo } }),
      orderRepository.countDocuments({ date: { $gte: oneWeekAgo.getTime() } }),
    ]);

    const [topRatedProducts, recentProducts] = await Promise.all([
      productRepository.model.find({ totalRatings: { $gt: 0 } })
        .sort({ averageRating: -1 })
        .limit(LIMITS.TOP_RATED)
        .select('name averageRating totalRatings image price'),

      productRepository.model.find()
        .sort({ date: -1 })
        .limit(LIMITS.RECENT_ADMIN)
        .select('name image price category date'),
    ]);

    // Revenue stats
    const totalRevenue = await orderRepository.model.aggregate([
      { $match: { payment: true } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      newUsersThisWeek,
      newProductsThisWeek,
      newOrdersThisWeek,
      totalRevenue: totalRevenue[0]?.total || 0,
      topRatedProducts,
      recentProducts,
      recentOrders,
    };
  }

  /**
   * Get all users with their order counts.
   */
  async getAllUsersWithStats() {
    const users = await userRepository.model.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'orders',
          let: { uId: { $toString: '$_id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$uId'] } } },
          ],
          as: 'orders',
        },
      },
      {
        $addFields: {
          orderCount: { $size: '$orders' },
        },
      },
      {
        $project: {
          password: 0,
          orders: 0,
        },
      },
    ]);

    return users;
  }

  /**
   * Delete a user and clean up their profile photo.
   */
  async deleteUser(targetId, adminId) {
    const user = await userRepository.findById(targetId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (user._id.toString() === adminId.toString()) {
      throw ApiError.badRequest('Cannot delete your own account');
    }

    // Cleanup profile photo
    if (user.cloudinaryId) {
      await deleteFromCloudinary(user.cloudinaryId);
    }

    await userRepository.findByIdAndDelete(targetId);
  }

  /**
   * Delete a product by admin with image cleanup.
   */
  async deleteProductByAdmin(productId) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Cleanup all product images from Cloudinary
    if (product.cloudinaryIds && product.cloudinaryIds.length > 0) {
      const deletePromises = product.cloudinaryIds.map((cid) => deleteFromCloudinary(cid));
      await Promise.all(deletePromises);
    }

    await productRepository.findByIdAndDelete(productId);
  }

  /**
   * Toggle a user's role between 'user' and 'admin'.
   */
  async changeUserRole(targetId, newRole, adminId) {
    if (targetId.toString() === adminId.toString() && newRole === 'user') {
      throw ApiError.badRequest('You cannot demote yourself');
    }

    const user = await userRepository.findById(targetId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    user.role = newRole;
    await user.save();

    return { _id: user._id, name: user.name, email: user.email, role: user.role };
  }

  /**
   * Create the first admin user (one-time bootstrap).
   */
  async setupFirstAdmin({ email, password, name, secretKey }) {
    if (!secretKey || secretKey !== config.adminSecretKey) {
      throw ApiError.forbidden('Invalid secret key');
    }

    const existingAdmin = await userRepository.model.findOne({ role: 'admin' });
    if (existingAdmin) {
      throw ApiError.badRequest('An admin already exists. Use the admin panel to create more admins.');
    }

    // Promote existing user if email matches
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      existingUser.role = 'admin';
      await existingUser.save();

      const accessToken = authService.generateAccessToken(existingUser);
      const refreshToken = authService.generateRefreshToken(existingUser);
      await userRepository.addRefreshToken(existingUser._id, refreshToken);

      return {
        message: 'Existing user promoted to admin',
        accessToken,
        refreshToken,
        user: authService.sanitizeUser(existingUser),
      };
    }

    // Create new admin
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const newAdmin = await userRepository.create({
      name: name || 'Admin',
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
    });

    const accessToken = authService.generateAccessToken(newAdmin);
    const refreshToken = authService.generateRefreshToken(newAdmin);
    await userRepository.addRefreshToken(newAdmin._id, refreshToken);

    return {
      message: 'First admin created successfully',
      accessToken,
      refreshToken,
      user: authService.sanitizeUser(newAdmin),
      isNew: true,
    };
  }

  /**
   * ISO week number calculator.
   */
  getISOWeek(date) {
    const tmp = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    tmp.setDate(tmp.getDate() - dayNr + 3);
    const firstThursday = tmp.valueOf();
    tmp.setMonth(0, 1);
    if (tmp.getDay() !== 4) {
      tmp.setMonth(0, 1 + ((4 - tmp.getDay() + 7) % 7));
    }
    return 1 + Math.ceil((firstThursday - tmp) / 604800000);
  }

  /**
   * Get all chart data for admin statistics tab.
   */
  async getChartData() {
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    // 1. Weekly trends (users & orders)
    const [weeklyUsers, weeklyOrders] = await Promise.all([
      userRepository.model.aggregate([
        { $match: { createdAt: { $gte: twelveWeeksAgo } } },
        { $group: { _id: { year: { $isoWeekYear: '$createdAt' }, week: { $isoWeek: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.week': 1 } },
      ]),
      orderRepository.model.aggregate([
        { $addFields: { dateObj: { $toDate: '$date' } } },
        { $match: { dateObj: { $gte: twelveWeeksAgo } } },
        { $group: { _id: { year: { $isoWeekYear: '$dateObj' }, week: { $isoWeek: '$dateObj' } }, count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
        { $sort: { '_id.year': 1, '_id.week': 1 } },
      ]),
    ]);

    const weeklyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      const weekStart = new Date(d);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

      const isoYear = weekStart.getFullYear();
      const isoWeek = this.getISOWeek(weekStart);

      weeklyTrends.push({
        week: `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()}`,
        users: weeklyUsers.find((w) => w._id.year === isoYear && w._id.week === isoWeek)?.count || 0,
        orders: weeklyOrders.find((w) => w._id.year === isoYear && w._id.week === isoWeek)?.count || 0,
        revenue: weeklyOrders.find((w) => w._id.year === isoYear && w._id.week === isoWeek)?.revenue || 0,
      });
    }

    // 2. Rating distribution
    const ratingDistribution = await productRepository.model.aggregate([
      { $unwind: '$ratings' },
      { $group: { _id: '$ratings.value', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const ratingData = [1, 2, 3, 4, 5].map((star) => ({
      rating: `${star} Star`,
      count: ratingDistribution.find((r) => r._id === star)?.count || 0,
    }));

    // 3. Top categories by product count
    const topCategories = await productRepository.model.aggregate([
      { $group: { _id: '$category', products: { $sum: 1 } } },
      { $sort: { products: -1 } },
      { $limit: LIMITS.MOST_ACTIVE },
      { $project: { category: '$_id', products: 1, _id: 0 } },
    ]);

    // 4. Monthly growth (orders & revenue)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyGrowth = await orderRepository.model.aggregate([
      { $addFields: { dateObj: { $toDate: '$date' } } },
      { $match: { dateObj: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$dateObj' }, month: { $month: '$dateObj' } }, orders: { $sum: 1 }, revenue: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthlyData = monthlyGrowth.map((m) => ({
      month: MONTH_NAMES[m._id.month - 1],
      orders: m.orders,
      revenue: m.revenue || 0,
    }));

    return { weeklyTrends, ratingData, topCategories, monthlyData };
  }
}

export default new AdminService();
