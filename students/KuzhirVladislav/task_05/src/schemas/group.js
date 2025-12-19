const z = require('zod');

const groupCreateSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  students: z.array(z.string()).optional(),
});

const groupUpdateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  students: z.array(z.string()).optional(),
});

const querySchema = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().positive().optional(),
  offset: z.coerce.number().nonnegative().optional(),
});

module.exports = { groupCreateSchema, groupUpdateSchema, querySchema };

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         students:
 *           type: array
 *           items:
 *             type: string
 *       required:
 *         - id
 *         - name
 *     GroupCreate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         students:
 *           type: array
 *           items:
 *             type: string
 *       required:
 *         - name
 *     GroupUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         students:
 *           type: array
 *           items:
 *             type: string
 */
