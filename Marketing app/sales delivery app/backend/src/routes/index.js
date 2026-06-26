import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes.js';
import userRouter from '../modules/user/user.routes.js';
import productRouter from '../modules/product/product.routes.js';
import cartRouter from '../modules/cart/cart.routes.js';
import orderRouter from '../modules/order/order.routes.js';
import adminRouter from '../modules/admin/admin.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/product', productRouter);
router.use('/cart', cartRouter);
router.use('/order', orderRouter);
router.use('/admin', adminRouter);

export default router;
