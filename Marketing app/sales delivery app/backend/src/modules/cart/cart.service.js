import userRepository from '../user/user.repository.js';
import ApiError from '../../shared/errors/ApiError.js';

class CartService {
  async addToCart({ userId, itemId, size }) {
    if (!size) {
      throw ApiError.badRequest('Product size is required');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const cartData = { ...user.cartData };

    if (cartData[itemId]) {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    } else {
      cartData[itemId] = { [size]: 1 };
    }

    await userRepository.findByIdAndUpdate(userId, { cartData });
  }

  async updateCart({ userId, itemId, size, quantity }) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const cartData = { ...user.cartData };

    if (!cartData[itemId]) {
      throw ApiError.badRequest('Item not found in cart');
    }

    cartData[itemId][size] = quantity;

    await userRepository.findByIdAndUpdate(userId, { cartData });
  }

  async getUserCart(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return { cartData: user.cartData };
  }
}

export default new CartService();
