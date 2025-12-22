const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { recipes, nextId } = require('../data');
let currentNextId = nextId;
const { NotFoundError, ValidationError } = require('../errors');

// Схемы валидации
const ingredientSchema = z.object({
    name: z.string().min(1).max(100),
    amount: z.string().min(1).max(50)
});

const createRecipeSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500).optional(),
    category: z.string().min(1).max(50),
    cookingTime: z.number().int().positive(),
    ingredients: z.array(ingredientSchema).min(1),
    instructions: z.string().min(10)
});

const updateRecipeSchema = createRecipeSchema.partial();

/**
 * @swagger
 * /recipes:
 *   get:
 *     summary: Получить список рецептов
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Поиск по названию или описанию
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Фильтр по категории
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Список рецептов
 */
router.get('/', (req, res) => {
    let result = recipes;
    const { q, category, limit = 10, offset = 0 } = req.query;

    if (q) {
        const lowerQ = q.toLowerCase();
        result = result.filter(r =>
            r.title.toLowerCase().includes(lowerQ) ||
            (r.description && r.description.toLowerCase().includes(lowerQ))
        );
    }

    if (category) {
        result = result.filter(r => r.category.toLowerCase() === category.toLowerCase());
    }

    const paginated = result.slice(+offset, +offset + +limit);
    res.status(200).json(paginated);
});

/**
 * @swagger
 * /recipes/{id}:
 *   get:
 *     summary: Получить рецепт по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Рецепт
 *       404:
 *         description: Не найден
 */
router.get('/:id', (req, res, next) => {
    const recipe = recipes.find(r => r.id === +req.params.id);
    if (!recipe) return next(new NotFoundError());
    res.status(200).json(recipe);
});

/**
 * @swagger
 * /recipes:
 *   post:
 *     summary: Создать новый рецепт
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - cookingTime
 *               - ingredients
 *               - instructions
 *             properties:
 *               title: { type: string, maxLength: 100 }
 *               description: { type: string }
 *               category: { type: string }
 *               cookingTime: { type: integer, minimum: 1 }
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name: { type: string }
 *                     amount: { type: string }
 *               instructions: { type: string }
 *     responses:
 *       201:
 *         description: Созданный рецепт
 */
router.post('/', (req, res, next) => {
    try {
        const data = createRecipeSchema.parse(req.body);
        const newRecipe = { id: currentNextId++, ...data };
        recipes.push(newRecipe);
        res.status(201).json(newRecipe);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return next(new ValidationError("Ошибка валидации", err.errors));
        }
        next(err);
    }
});

/**
 * @swagger
 * /recipes/{id}:
 *   patch:
 *     summary: Частично обновить рецепт
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *               cookingTime: { type: integer }
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name: { type: string }
 *                     amount: { type: string }
 *               instructions: { type: string }
 *     responses:
 *       200:
 *         description: Обновлённый рецепт
 *       404:
 *         description: Не найден
 */
router.patch('/:id', (req, res, next) => {
    const recipe = recipes.find(r => r.id === +req.params.id);
    if (!recipe) return next(new NotFoundError());

    try {
        const data = updateRecipeSchema.parse(req.body);
        Object.assign(recipe, data);
        res.status(200).json(recipe);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return next(new ValidationError("Ошибка валидации", err.errors));
        }
        next(err);
    }
});

/**
 * @swagger
 * /recipes/{id}:
 *   delete:
 *     summary: Удалить рецепт
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Успешно удалено
 *       404:
 *         description: Не найден
 */
router.delete('/:id', (req, res, next) => {
    const index = recipes.findIndex(r => r.id === +req.params.id);
    if (index === -1) return next(new NotFoundError());
    recipes.splice(index, 1);
    res.status(204).send();
});

module.exports = router;