const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { AppError, NotFoundError, ForbiddenError } = require('../utils/errors');
const {
  createTaskSchema,
  updateTaskSchema,
  queryParamsSchema,
} = require('../validators/taskValidator');

const prisma = new PrismaClient();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management
 */

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks for authenticated user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           example: desc
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { error, value } = queryParamsSchema.validate(req.query);
    if (error) {
      throw new AppError(error.message, 422);
    }

    const { limit = 20, page = 1, sortBy = 'createdAt', sortOrder = 'desc' } = value;

    const where =
      req.user.role === 'ADMIN'
        ? {}
        : { ownerId: req.user.id };

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  })
);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!task) throw new NotFoundError('Task not found');

    if (task.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to access this task');
    }

    res.json({ success: true, data: { task } });
  })
);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Finish coursework
 *               description:
 *                 type: string
 *                 example: Backend lab
 */
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { error, value } = createTaskSchema.validate(req.body);
    if (error) throw new AppError(error.message, 422);

    const task = await prisma.task.create({
      data: {
        ...value,
        ownerId: req.user.id,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: { task },
      message: 'Task created successfully',
    });
  })
);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Update task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 */
router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { error, value } = updateTaskSchema.validate(req.body);
    if (error) throw new AppError(error.message, 422);

    const existingTask = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!existingTask) throw new NotFoundError('Task not found');

    if (existingTask.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to update this task');
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: value,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({
      success: true,
      data: { task },
      message: 'Task updated successfully',
    });
  })
);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!task) throw new NotFoundError('Task not found');

    if (task.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to delete this task');
    }

    await prisma.task.delete({ where: { id: req.params.id } });

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  })
);

module.exports = router;
