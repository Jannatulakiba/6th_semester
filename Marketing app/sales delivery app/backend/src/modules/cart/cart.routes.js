import { Router } from 'express';
import { addToCart, updateCart, getUserCart } from './cart.controller.js';
import authUser from '../../shared/middlewares/auth.js';
import { validate } from '../../shared/middlewares/validate.js';
import { addToCartSchema, updateCartSchema } from './cart.validation.js';

const router = Router();

router.post('/get', authUser, getUserCart);
router.post('/add', authUser, validate(addToCartSchema), addToCart);
router.post('/update', authUser, validate(updateCartSchema), updateCart);

export default router;
