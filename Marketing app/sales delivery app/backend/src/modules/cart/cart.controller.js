import ApiResponse from '../../shared/utils/ApiResponse.js';
import cartService from './cart.service.js';

export const addToCart = async (req, res, next) => {
  try {
    const { userId, itemId, size } = req.body;
    await cartService.addToCart({ userId, itemId, size });
    ApiResponse.ok(null, 'Added to cart').send(res);
  } catch (error) {
    next(error);
  }
};

export const updateCart = async (req, res, next) => {
  try {
    const { userId, itemId, size, quantity } = req.body;
    await cartService.updateCart({ userId, itemId, size, quantity });
    ApiResponse.ok(null, 'Cart updated').send(res);
  } catch (error) {
    next(error);
  }
};

export const getUserCart = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const { cartData } = await cartService.getUserCart(userId);
    ApiResponse.ok({ cartData }).send(res);
  } catch (error) {
    next(error);
  }
};

export default {
  addToCart,
  updateCart,
  getUserCart,
};
