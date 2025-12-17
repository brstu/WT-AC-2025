const z = require('zod');

const gradeCreateSchema = z.object({
  studentId: z.string(),
  taskId: z.string(),
  score: z.number().min(0).max(100),
  comment: z.string().optional(),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid ISO date' })
    .optional(),
});

const gradeUpdateSchema = z.object({
  studentId: z.string().optional(),
  taskId: z.string().optional(),
  score: z.number().min(0).max(100).optional(),
  comment: z.string().optional(),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid ISO date' })
    .optional(),
});

const querySchema = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().positive().optional(),
  offset: z.coerce.number().nonnegative().optional(),
});

module.exports = { gradeCreateSchema, gradeUpdateSchema, querySchema };

/**
 * @swagger
 * components:
 *   schemas:
 *     Grade:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         studentId:
 *           type: string
 *         taskId:
 *           type: string
 *         value:
 *           type: number
 *       required:
 *         - id
 *         - studentId
 *         - taskId
 *         - value
 *     GradeCreate:
 *       type: object
 *       properties:
 *         studentId:
 *           type: string
 *         taskId:
 *           type: string
 *         value:
 *           type: number
 *       required:
 *         - studentId
 *         - taskId
 *         - value
 *     GradeUpdate:
 *       type: object
 *       properties:
 *         value:
 *           type: number
 */
