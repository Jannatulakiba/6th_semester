import ApiResponse from '../../shared/utils/ApiResponse.js';
import orderService from './order.service.js';

export const placeOrder = async (req, res, next) => {
  try {
    const { userId, items, amount, address } = req.body;
    await orderService.placeOrderCOD({ userId, items, amount, address });
    ApiResponse.created(null, 'Order Placed').send(res);
  } catch (error) {
    next(error);
  }
};

export const placeOrderStripe = async (req, res, next) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;
    const { session_url } = await orderService.placeOrderStripe({ userId, items, amount, address, origin });
    ApiResponse.ok({ session_url }).send(res);
  } catch (error) {
    next(error);
  }
};

export const verifyStripe = async (req, res, next) => {
  try {
    const { orderId, success, userId } = req.body;
    const verified = await orderService.verifyStripePayment({ orderId, success, userId });
    ApiResponse.ok({ verified }).send(res);
  } catch (error) {
    next(error);
  }
};

export const allOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const data = await orderService.getAllOrders({ page, limit });
    ApiResponse.ok(data).send(res);
  } catch (error) {
    next(error);
  }
};

export const userOrders = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const data = await orderService.getUserOrders(userId, { page, limit });
    ApiResponse.ok(data).send(res);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { orderId, status } = req.body;
    await orderService.updateOrderStatus({ orderId, status });
    ApiResponse.ok(null, 'Status Updated').send(res);
  } catch (error) {
    next(error);
  }
};

export default {
  placeOrder,
  placeOrderStripe,
  verifyStripe,
  allOrders,
  userOrders,
  updateStatus,
};
