const { z } = require('zod');

const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const reviewSchema = z.object({
  placeName: z.string()
    .min(1, 'Place name is required')
    .max(100, 'Place name is too long'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description is too long'),
  rating: z.number()
    .min(0.5, 'Rating must be at least 0.5')
    .max(5, 'Rating must be at most 5'),
  location: z.string()
    .max(200, 'Location is too long')
    .optional()
    .nullable(),
  imageUrl: z.string()
    .url('Invalid URL format')
    .optional()
    .nullable(),
  tags: z.array(z.string())
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([])
});

const updateReviewSchema = reviewSchema.partial().refine(
  data => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' }
);

const moderationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string()
    .max(500, 'Rejection reason is too long')
    .optional()
    .nullable()
});

const querySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  userOnly: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  offset: z.string().regex(/^\d+$/).transform(Number).default('0'),
  search: z.string().optional()
});

module.exports = {
  signupSchema,
  loginSchema,
  reviewSchema,
  updateReviewSchema,
  moderationSchema,
  querySchema
};