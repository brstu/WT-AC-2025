import { z } from 'zod';

/* =======================
   Movie validation schema
======================= */
export const movieSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be at most 100 characters'),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be at most 1000 characters'),

  year: z
    .number()
    .int('Year must be an integer')
    .min(1888, 'Year must be >= 1888')
    .max(new Date().getFullYear() + 1, 'Year is too large'),

  rating: z
    .number()
    .min(0, 'Rating must be between 0 and 10')
    .max(10, 'Rating must be between 0 and 10'),

  posterUrl: z
    .string()
    .url('Poster URL must be a valid URL')
    .or(z.literal(''))
    .optional(),
});

/* =======================
   Types
======================= */
export type MovieFormData = z.infer<typeof movieSchema>;
