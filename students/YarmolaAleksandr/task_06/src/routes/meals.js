const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { AppError, NotFoundError, ForbiddenError } = require('../utils/errors');
const { createMealSchema, updateMealSchema, queryParamsSchema } = require('../validators/mealValidator');

const prisma = new PrismaClient();

/**
 * @swagger
 * /meals:
 *   get:
 *     summary: Get all meals for authenticated user
 *     tags: [Meals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mealType
 *         schema:
 *           type: string
 *           enum: [BREAKFAST, LUNCH, DINNER, SNACK]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, calories, name, createdAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of meals
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    // Validate query params
    const { error, value } = queryParamsSchema.validate(req.query);
    if (error) {
      throw new AppError(error.message, 422);
    }

    const {
      mealType,
      startDate,
      endDate,
      limit = 20,
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = value;

    // Build where clause
    const where = {
      userId: req.user.id,
    };

    if (mealType) {
      where.mealType = mealType;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get meals with pagination
    const [meals, total] = await Promise.all([
      prisma.meal.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.meal.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        meals,
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
 * /meals/{id}:
 *   get:
 *     summary: Get meal by ID
 *     tags: [Meals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meal details
 *       404:
 *         description: Meal not found
 *       403:
 *         description: Access denied
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const meal = await prisma.meal.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!meal) {
      throw new NotFoundError('Meal not found');
    }

    // Check ownership
    if (meal.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to access this meal');
    }

    res.json({
      success: true,
      data: { meal },
    });
  })
);

/**
 * @swagger
 * /meals:
 *   post:
 *     summary: Create new meal
 *     tags: [Meals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - mealType
 *               - date
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               mealType:
 *                 type: string
 *                 enum: [BREAKFAST, LUNCH, DINNER, SNACK]
 *               date:
 *                 type: string
 *                 format: date-time
 *               calories:
 *                 type: number
 *               protein:
 *                 type: number
 *               carbs:
 *                 type: number
 *               fat:
 *                 type: number
 *               notes:
 *                 type: string
 *               isPrivate:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Meal created successfully
 *       422:
 *         description: Validation error
 */
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    // Validate input
    const { error, value } = createMealSchema.validate(req.body);
    if (error) {
      throw new AppError(error.message, 422);
    }

    // Create meal
    const meal = await prisma.meal.create({
      data: {
        ...value,
        date: new Date(value.date),
        userId: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: { meal },
      message: 'Meal created successfully',
    });
  })
);

/**
 * @swagger
 * /meals/{id}:
 *   patch:
 *     summary: Update meal
 *     tags: [Meals]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               mealType:
 *                 type: string
 *               date:
 *                 type: string
 *               calories:
 *                 type: number
 *               protein:
 *                 type: number
 *               carbs:
 *                 type: number
 *               fat:
 *                 type: number
 *               notes:
 *                 type: string
 *               isPrivate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Meal updated successfully
 *       404:
 *         description: Meal not found
 *       403:
 *         description: Access denied
 */
router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    // Validate input
    const { error, value } = updateMealSchema.validate(req.body);
    if (error) {
      throw new AppError(error.message, 422);
    }

    // Check if meal exists
    const existingMeal = await prisma.meal.findUnique({
      where: { id: req.params.id },
    });

    if (!existingMeal) {
      throw new NotFoundError('Meal not found');
    }

    // Check ownership
    if (existingMeal.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to update this meal');
    }

    // Update meal
    const updateData = { ...value };
    if (value.date) {
      updateData.date = new Date(value.date);
    }

    const meal = await prisma.meal.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: { meal },
      message: 'Meal updated successfully',
    });
  })
);

/**
 * @swagger
 * /meals/{id}:
 *   delete:
 *     summary: Delete meal
 *     tags: [Meals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meal deleted successfully
 *       404:
 *         description: Meal not found
 *       403:
 *         description: Access denied
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    // Check if meal exists
    const meal = await prisma.meal.findUnique({
      where: { id: req.params.id },
    });

    if (!meal) {
      throw new NotFoundError('Meal not found');
    }

    // Check ownership
    if (meal.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to delete this meal');
    }

    // Delete meal
    await prisma.meal.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: 'Meal deleted successfully',
    });
  })
);

module.exports = router;
