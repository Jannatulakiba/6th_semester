import { z } from 'zod';

export const setupFirstAdminSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().optional(),
    secretKey: z.string().min(1, 'Secret key is required'),
  }),
});

export const changeUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(['user', 'admin'], {
      errorMap: () => ({ message: 'Role must be either "user" or "admin"' }),
    }),
  }),
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});
