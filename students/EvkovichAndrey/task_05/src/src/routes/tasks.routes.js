import { Router } from 'express';
import {
    getTasks, getTaskById, createTask,
    updateTask, deleteTask
} from '../controllers/tasks.controller.js';
import { validate } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema.js';

const router = Router();

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Получить список задач
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Список задач
 */
router.get('/', getTasks);

router.get('/:id', getTaskById);
router.post('/', validate(createTaskSchema), createTask);
router.patch('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;