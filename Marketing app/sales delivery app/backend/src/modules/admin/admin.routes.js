import { Router } from 'express';
import authUser from '../../shared/middlewares/auth.js';
import isAdmin from '../../shared/middlewares/adminRole.js';
import { validate } from '../../shared/middlewares/validate.js';
import {
  getAdminStats,
  getAllUsers,
  adminDeleteUser,
  adminDeleteProduct,
  createFirstAdmin,
  toggleUserRole,
  getChartStats,
} from './admin.controller.js';
import { setupFirstAdminSchema, changeUserRoleSchema } from './admin.validation.js';

const router = Router();

// First admin setup (bootstrap)
router.post('/setup', validate(setupFirstAdminSchema), createFirstAdmin);

// Admin dashboard & user management routes
router.use(authUser, isAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/chart-stats', getChartStats);
router.delete('/users/:id', adminDeleteUser);
router.delete('/products/:id', adminDeleteProduct);
router.put('/users/:id/role', validate(changeUserRoleSchema), toggleUserRole);

export default router;
