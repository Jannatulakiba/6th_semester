import { z } from 'zod';

export const addProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.string().or(z.number()),
    category: z.string().min(1, 'Category is required'),
    subCategory: z.string().min(1, 'SubCategory is required'),
    bestseller: z.string().optional(),
    sizes: z.string().transform((str, ctx) => {
      try {
        const parsed = JSON.parse(str);
        if (!Array.isArray(parsed)) throw new Error();
        return parsed;
      } catch (e) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Sizes must be a valid JSON array string' });
        return z.NEVER;
      }
    }).optional()
  })
});
