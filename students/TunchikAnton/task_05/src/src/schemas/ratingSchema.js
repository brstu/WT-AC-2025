const { z } = require('zod');

const ratingSchema = z.object({
  title: z.string()
    .min(1, 'Title must be at least 1 character')
    .max(100, 'Title must be at most 100 characters'),
  description: z.string()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  rating: z.number()
    .min(0, 'Rating must be at least 0')
    .max(10, 'Rating must be at most 10'),
  category: z.enum(['movies', 'games', 'books', 'music', 'other']),
  tags: z.array(z.string())
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  isPublic: z.boolean().default(true),
  dueDate: z.string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid date format. Use ISO 8601'
    })
    .optional()
});

const updateRatingSchema = ratingSchema.partial().refine(
  data => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

const querySchema = z.object({
  q: z.string().optional(),
  category: z.enum(['movies', 'games', 'books', 'music', 'other']).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  offset: z.string().regex(/^\d+$/).transform(Number).default('0'),
  sortBy: z.enum(['title', 'rating', 'createdAt', 'dueDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

module.exports = {
  ratingSchema,
  updateRatingSchema,
  querySchema
};