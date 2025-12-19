import { z } from 'zod';

export const createAdSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  published: z.boolean().default(false)
});

export const updateAdSchema = createAdSchema.partial();
