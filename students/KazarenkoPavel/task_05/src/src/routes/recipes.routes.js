const express = require('express');
const router = express.Router();
const recipesController = require('../controllers/recipes.controller');
const {
  validateCreateRecipe,
  validateUpdateRecipe,
  validateQuery,
  validateId,
} = require('../middlewares/validation.middleware');

/**
 * @swagger
 * tags:
 *   name: Recipes
 *   description: Управление рецептами
 */

/**
 * @swagger
 * /recipes:
 *   get:
 *     summary: Получить список рецептов
 *     tags: [Recipes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Количество рецептов на странице
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Поиск по названию и описанию
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Фильтр по категории
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [легко, средне, сложно]
 *         description: Фильтр по сложности
 *       - in: query
 *         name: minTime
 *         schema:
 *           type: integer
 *         description: Минимальное время приготовления
 *       - in: query
 *         name: maxTime
 *         schema:
 *           type: integer
 *         description: Максимальное время приготовления
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, time, difficulty, createdAt, updatedAt]
 *           default: createdAt
 *         description: Поле для сортировки
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Порядок сортировки
 *     responses:
 *       200:
 *         description: Список рецептов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', validateQuery, recipesController.getAllRecipes);

/**
 * @swagger
 * /recipes/search:
 *   get:
 *     summary: Поиск рецептов
 *     tags: [Recipes]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Поисковый запрос
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Лимит результатов
 *     responses:
 *       200:
 *         description: Результаты поиска
 */
router.get('/search', recipesController.searchRecipes);

/**
 * @swagger
 * /recipes/stats:
 *   get:
 *     summary: Статистика рецептов
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: Статистика
 */
router.get('/stats', recipesController.getStats);

/**
 * @swagger
 * /recipes/health:
 *   get:
 *     summary: Health check
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: Состояние сервиса
 */
router.get('/health', recipesController.healthCheck);

/**
 * @swagger
 * /recipes:
 *   post:
 *     summary: Создать новый рецепт
 *     tags: [Recipes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRecipe'
 *     responses:
 *       201:
 *         description: Рецепт создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Recipe'
 */
router.post('/', validateCreateRecipe, recipesController.createRecipe);

/**
 * @swagger
 * /recipes/{id}:
 *   get:
 *     summary: Получить рецепт по ID
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID рецепта
 *     responses:
 *       200:
 *         description: Детали рецепта
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Recipe'
 *       404:
 *         description: Рецепт не найден
 */
router.get('/:id', validateId, recipesController.getRecipeById);

/**
 * @swagger
 * /recipes/{id}:
 *   put:
 *     summary: Обновить рецепт
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID рецепта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRecipe'
 *     responses:
 *       200:
 *         description: Рецепт обновлен
 *       404:
 *         description: Рецепт не найден
 */
router.put('/:id', validateId, validateUpdateRecipe, recipesController.updateRecipe);

/**
 * @swagger
 * /recipes/{id}:
 *   patch:
 *     summary: Частично обновить рецепт
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID рецепта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRecipe'
 *     responses:
 *       200:
 *         description: Рецепт обновлен
 *       404:
 *         description: Рецепт не найден
 */
router.patch('/:id', validateId, validateUpdateRecipe, recipesController.updateRecipe);

/**
 * @swagger
 * /recipes/{id}:
 *   delete:
 *     summary: Удалить рецепт
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID рецепта
 *     responses:
 *       200:
 *         description: Рецепт удален
 *       404:
 *         description: Рецепт не найден
 */
router.delete('/:id', validateId, recipesController.deleteRecipe);

/**
 * @swagger
 * /recipes/category/{categoryId}:
 *   get:
 *     summary: Получить рецепты по категории
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID категории
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Количество рецептов на странице
 *     responses:
 *       200:
 *         description: Список рецептов категории
 *       404:
 *         description: Категория не найдена
 */
router.get('/category/:categoryId', recipesController.getRecipesByCategory);

module.exports = router;
