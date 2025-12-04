const express = require('express');
const { taskCreate, taskUpdate, queryParams } = require('../validation/schemas');
const { validate, validateQuery } = require('../middleware/validate');
const { auth, admin } = require('../middleware/auth');
const prisma = require('../config/database');

const router = express.Router();

router.use(auth);

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *           example: "Завершить проект"
 *         description:
 *           type: string
 *         completed:
 *           type: boolean
 *         dueDate:
 *           type: string
 *           format: date-time
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         ownerId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Получить список задач
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Поиск по названию и описанию
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, completed, active]
 *           default: all
 *         description: Фильтр по статусу
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [all, low, medium, high]
 *           default: all
 *         description: Фильтр по приоритету
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Лимит задач
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Смещение
 *     responses:
 *       200:
 *         description: Список задач
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 */
router.get('/', validateQuery(queryParams), async (req, res, next) => {
  try {
    const { q, status, priority, limit, offset } = req.query;
    
    let where = {};
    
    if (req.user.role !== 'admin') {
      where.ownerId = req.user.userId;
    }
    
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (status !== 'all') {
      where.completed = status === 'completed';
    }

    if (priority !== 'all') {
      where.priority = priority;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    const total = await prisma.task.count({ where });

    res.json({
      message: 'Задачи успешно получены',
      data: tasks,
      total,
      limit,
      offset,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Получить задачу по ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Данные задачи
 *       404:
 *         description: Задача не найдена
 */
router.get('/:id', async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ 
        message: 'Задача не найдена',
        code: 'TASK_NOT_FOUND'
      });
    }

    if (req.user.role !== 'admin' && task.ownerId !== req.user.userId) {
      return res.status(403).json({ 
        message: 'Нет доступа к этой задаче',
        code: 'ACCESS_DENIED'
      });
    }

    res.json({ 
      message: 'Задача успешно получена',
      data: task 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Создать новую задачу
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Задача создана
 */
router.post('/', validate(taskCreate), async (req, res, next) => {
  try {
    const taskData = {
      ...req.body,
      ownerId: req.user.userId,
    };

    if (taskData.dueDate) {
      taskData.dueDate = new Date(taskData.dueDate);
    }
    if (taskData.tags && Array.isArray(taskData.tags)) {
      taskData.tags = JSON.stringify(taskData.tags);
    }

    const task = await prisma.task.create({
      data: taskData,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (task.tags) {
      task.tags = JSON.parse(task.tags);
    }

    res.status(201).json({ 
      message: 'Задача успешно создана',
      data: task 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     summary: Обновить задачу
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Задача обновлена
 *       404:
 *         description: Задача не найдена
 */
router.patch('/:id', validate(taskUpdate), async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return res.status(404).json({ 
        message: 'Задача не найдена',
        code: 'TASK_NOT_FOUND'
      });
    }

    if (req.user.role !== 'admin' && existingTask.ownerId !== req.user.userId) {
      return res.status(403).json({ 
        message: 'Нет доступа к этой задаче',
        code: 'ACCESS_DENIED'
      });
    }

    const updateData = { ...req.body };
    
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }
    if (updateData.tags && Array.isArray(updateData.tags)) {
      updateData.tags = JSON.stringify(updateData.tags);
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (task.tags) {
      task.tags = JSON.parse(task.tags);
    }

    res.json({ 
      message: 'Задача успешно обновлена',
      data: task 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Удалить задачу
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Задача удалена
 *       404:
 *         description: Задача не найдена
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return res.status(404).json({ 
        message: 'Задача не найдена',
        code: 'TASK_NOT_FOUND'
      });
    }

    if (req.user.role !== 'admin' && existingTask.ownerId !== req.user.userId) {
      return res.status(403).json({ 
        message: 'Нет доступа к этой задаче',
        code: 'ACCESS_DENIED'
      });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tasks/{id}/complete:
 *   patch:
 *     summary: Отметить задачу как выполненную
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Задача отмечена как выполненная
 */
router.patch('/:id/complete', async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return res.status(404).json({ 
        message: 'Задача не найдена',
        code: 'TASK_NOT_FOUND'
      });
    }

    if (req.user.role !== 'admin' && existingTask.ownerId !== req.user.userId) {
      return res.status(403).json({ 
        message: 'Нет доступа к этой задаче',
        code: 'ACCESS_DENIED'
      });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { completed: true },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (task.tags) {
      task.tags = JSON.parse(task.tags);
    }

    res.json({ 
      message: 'Задача отмечена как выполненная',
      data: task 
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;