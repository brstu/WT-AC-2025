const z = require('zod');

const taskCreateSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid ISO date' }),
  done: z.boolean().optional(),
  groupId: z.string(),
});

const taskUpdateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  dueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid ISO date' })
    .optional(),
  done: z.boolean().optional(),
  groupId: z.string().optional(),
});

const querySchema = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().positive().optional(),
  offset: z.coerce.number().nonnegative().optional(),
});

module.exports = { taskCreateSchema, taskUpdateSchema, querySchema };

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date-time
 *         done:
 *           type: boolean
 *         groupId:
 *           type: string
 *       required:
 *         - id
 *         - title
 *     TaskCreate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date-time
 *         done:
 *           type: boolean
 *         groupId:
 *           type: string
 *       required:
 *         - title
 *     TaskUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         dueDate:
 *           type: string
 *         done:
 *           type: boolean
 *         groupId:
 *           type: string
 */
