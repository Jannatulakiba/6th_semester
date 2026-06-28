import { Router } from 'express';
import adminAuth from '../../shared/middlewares/adminAuth.js';
import authUser from '../../shared/middlewares/auth.js';
import { placeOrder, placeOrderStripe, verifyStripe, allOrders, userOrders, updateStatus } from './order.controller.js';
import { validate } from '../../shared/middlewares/validate.js';
import { placeOrderSchema, updateOrderStatusSchema } from './order.validation.js';

const router = Router();

// Admin Features
router.post('/list', adminAuth, allOrders);
router.post('/status', adminAuth, validate(updateOrderStatusSchema), updateStatus);

// Payment Features
router.post('/place', authUser, validate(placeOrderSchema), placeOrder);
router.post('/stripe', authUser, validate(placeOrderSchema), placeOrderStripe);

// Verify Payment
router.post('/verifyStripe', authUser, verifyStripe);

// User Feature
router.post('/userorders', authUser, userOrders);

export default router;
