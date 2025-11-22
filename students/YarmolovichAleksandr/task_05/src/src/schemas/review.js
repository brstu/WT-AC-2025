const { z } = require('zod');

// Схема для создания отзыва
const createReviewSchema = z.object({
  placeName: z.string().min(1).max(100),
  author: z.string().min(1).max(50),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(500).optional(),
  visitedAt: z.string().datetime(), // ISO 8601
});

// Схема для обновления отзыва
const updateReviewSchema = z.object({
  placeName: z.string().min(1).max(100).optional(),
  author: z.string().min(1).max(50).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(1).max(500).optional().nullable(),
  visitedAt: z.string().datetime().optional(),
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
};