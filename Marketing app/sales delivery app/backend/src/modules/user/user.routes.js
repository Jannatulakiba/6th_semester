import { Router } from 'express';
import { getUser, getDashboardStats, updateProfile, changePassword } from './user.controller.js';
import authUser from '../../shared/middlewares/auth.js';
import { profileUpload } from '../../shared/middlewares/multer.js';

const router = Router();

router.get('/profile', authUser, getUser);
router.get('/dashboard', authUser, getDashboardStats);
router.put('/profile', authUser, profileUpload.single('photo'), updateProfile);
router.put('/password', authUser, changePassword);

export default router;
