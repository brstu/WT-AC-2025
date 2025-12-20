const z = require('zod');

const museumCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  location: z.string().min(1).max(200),
  hours: z.string().optional(),
  website: z.string().url().optional(),
});

const museumUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  location: z.string().min(1).max(200).optional(),
  hours: z.string().optional(),
  website: z.string().url().optional(),
});

const querySchema = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().positive().optional(),
  offset: z.coerce.number().nonnegative().optional(),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Museum:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description:
 *           type: string
 *           maxLength: 1000
 *         location:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *         hours:
 *           type: string
 *         website:
 *           type: string
 *           format: uri
 *       required:
 *         - id
 *         - name
 *         - location
 */

module.exports = { museumCreateSchema, museumUpdateSchema, querySchema };
