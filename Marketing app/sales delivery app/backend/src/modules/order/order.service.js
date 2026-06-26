import mongoose from 'mongoose';
import orderRepository from './order.repository.js';
import userRepository from '../user/user.repository.js';
import Stripe from 'stripe';
import ApiError from '../../shared/errors/ApiError.js';
import config from '../../config/index.js';

class OrderService {
  constructor() {
    this.currency = config.currency || 'usd';
    this.deliveryCharge = config.deliveryCharge || 10;
  }

  getStripe() {
    return new Stripe(config.stripeSecretKey);
  }

  async placeOrderCOD({ userId, items, amount, address }) {
    const session = await mongoose.startSession();
    let order;
    try {
      await session.withTransaction(async () => {
        [order] = await orderRepository.model.create([{
          userId,
          items,
          amount,
          address,
          paymentMethod: 'COD',
          payment: false,
          date: Date.now()
        }], { session });

        await userRepository.findByIdAndUpdate(userId, { cartData: {} }, { session });
      });
    } finally {
      session.endSession();
    }
    return order;
  }

  async placeOrderStripe({ userId, items, amount, address, origin }) {
    const order = await orderRepository.create({
      userId,
      items,
      amount,
      address,
      paymentMethod: 'Stripe',
      payment: false,
      date: Date.now()
    });

    const stripe = this.getStripe();

    const line_items = items.map((item) => ({
      price_data: {
        currency: this.currency,
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.quantity
    }));

    line_items.push({
      price_data: {
        currency: this.currency,
        product_data: { name: 'Delivery Charges' },
        unit_amount: this.deliveryCharge * 100
      },
      quantity: 1
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${order._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${order._id}`,
      line_items,
      mode: 'payment'
    });

    return { session_url: session.url };
  }

  async verifyStripePayment({ orderId, success, userId }) {
    if (success === 'true') {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await orderRepository.findByIdAndUpdate(orderId, { payment: true }, { session });
          await userRepository.findByIdAndUpdate(userId, { cartData: {} }, { session });
        });
        return true;
      } finally {
        session.endSession();
      }
    }

    await orderRepository.findByIdAndDelete(orderId);
    return false;
  }

  async getAllOrders({ page = 1, limit = 10 } = {}) {
    if (Number(limit) === 0) {
      const orders = await orderRepository.findWithPagination({}, 0, 0);
      return { orders, page: 1, limit: 0, total: orders.length, totalPages: 1 };
    }
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      orderRepository.findWithPagination({}, skip, limit),
      orderRepository.countDocuments()
    ]);
    return { orders, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async getUserOrders(userId, { page = 1, limit = 10 } = {}) {
    if (Number(limit) === 0) {
      const orders = await orderRepository.findWithPagination({ userId }, 0, 0);
      return { orders, page: 1, limit: 0, total: orders.length, totalPages: 1 };
    }
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      orderRepository.findWithPagination({ userId }, skip, limit),
      orderRepository.countDocuments({ userId })
    ]);
    return { orders, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async updateOrderStatus({ orderId, status }) {
    const order = await orderRepository.findByIdAndUpdate(orderId, { status });
    if (!order) {
      throw ApiError.notFound('Order not found');
    }
  }
}

export default new OrderService();
