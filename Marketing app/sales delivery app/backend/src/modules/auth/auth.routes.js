import { Router } from 'express';
import { registerUser, loginUser, adminLogin, refreshToken, logoutUser } from './auth.controller.js';
import { profileUpload } from '../../shared/middlewares/multer.js';
import { validate } from '../../shared/middlewares/validate.js';
import { registerSchema, loginSchema } from './auth.validation.js';

const router = Router();

router.post('/register', profileUpload.single('photo'), validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/admin', adminLogin);
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);

export default router;
