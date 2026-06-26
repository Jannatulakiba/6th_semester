import { Router } from 'express';
import { listProducts, addProduct, removeProduct, singleProduct, editProduct, rateProduct, addComment, deleteComment } from './product.controller.js';
import { productUpload } from '../../shared/middlewares/multer.js';
import adminAuth from '../../shared/middlewares/adminAuth.js';
import authUser from '../../shared/middlewares/auth.js';
import { validate } from '../../shared/middlewares/validate.js';
import { addProductSchema } from './product.validation.js';

const router = Router();

// Public routes
router.post('/single', singleProduct);
router.get('/list', listProducts);

// Admin routes
router.post('/add', adminAuth, productUpload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), validate(addProductSchema), addProduct);

router.post('/remove', adminAuth, removeProduct);

router.put('/edit/:id', adminAuth, productUpload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), editProduct);

// Authenticated user routes
router.post('/:id/rate', authUser, rateProduct);
router.post('/:id/comment', authUser, addComment);
router.delete('/:id/comment/:commentId', authUser, deleteComment);

export default router;
