const z = require('zod');

const reviewCreateSchema = z.object({
  museumId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1).max(1000),
  author: z.string().min(1).max(100).optional(),
});

const reviewUpdateSchema = z.object({
  museumId: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  text: z.string().min(1).max(1000).optional(),
  author: z.string().min(1).max(100).optional(),
});

const querySchema = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().positive().optional(),
  offset: z.coerce.number().nonnegative().optional(),
  museumId: z.string().optional(),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier
 *         museumId:
 *           type: string
 *           description: ID of the museum being reviewed
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         text:
 *           type: string
 *           minLength: 1
 *           maxLength: 1000
 *         author:
 *           type: string
 *           maxLength: 100
 *         createdAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - museumId
 *         - rating
 *         - text
 */

module.exports = { reviewCreateSchema, reviewUpdateSchema, querySchema };
