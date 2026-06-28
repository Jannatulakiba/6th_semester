import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    size: z.string().min(1, 'Size is required'),
  })
});

export const updateCartSchema = z.object({
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    size: z.string().min(1, 'Size is required'),
    quantity: z.number().min(0, 'Quantity must be 0 or more'),
  })
});
