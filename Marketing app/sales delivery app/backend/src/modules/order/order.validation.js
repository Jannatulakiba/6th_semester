import { z } from 'zod';

export const placeOrderSchema = z.object({
  body: z.object({
    userId: z.string().optional(),
    items: z.array(z.any()).min(1, 'Cart cannot be empty'),
    amount: z.number().min(0, 'Amount must be a positive number'),
    address: z.object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      email: z.string().email('Invalid email'),
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      zipcode: z.string().min(1, 'Zipcode is required'),
      country: z.string().min(1, 'Country is required'),
      phone: z.string().min(1, 'Phone is required')
    })
  })
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    status: z.string().min(1, 'Status is required')
  })
});
