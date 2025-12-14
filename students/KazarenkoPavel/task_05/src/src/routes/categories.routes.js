const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');
const {
  validateCategory,
  validateId,
} = require('../middlewares/validation.middleware');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Управление категориями рецептов
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Получить все категории
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Список категорий
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
 *                     $ref: '#/components/schemas/Category'
 */
router.get('/', categoriesController.getAllCategories);

/**
 * @swagger
 * /categories/popular:
 *   get:
 *     summary: Получить популярные категории
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Лимит категорий
 *     responses:
 *       200:
 *         description: Популярные категории
 */
router.get('/popular', categoriesController.getPopularCategories);

/**
 * @swagger
 * /categories/health:
 *   get:
 *     summary: Health check
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Состояние сервиса
 */
router.get('/health', categoriesController.healthCheck);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Создать новую категорию
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategory'
 *     responses:
 *       201:
 *         description: Категория создана
 *       400:
 *         description: Ошибка валидации
 */
router.post('/', validateCategory, categoriesController.createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Получить категорию по ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID категории
 *     responses:
 *       200:
 *         description: Детали категории
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CategoryWithRecipes'
 *       404:
 *         description: Категория не найдена
 */
router.get('/:id', validateId, categoriesController.getCategoryById);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Обновить категорию
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID категории
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategory'
 *     responses:
 *       200:
 *         description: Категория обновлена
 *       404:
 *         description: Категория не найдена
 */
router.put('/:id', validateId, validateCategory, categoriesController.updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Частично обновить категорию
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID категории
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategory'
 *     responses:
 *       200:
 *         description: Категория обновлена
 *       404:
 *         description: Категория не найдена
 */
router.patch('/:id', validateId, validateCategory, categoriesController.updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Удалить категорию
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID категории
 *     responses:
 *       200:
 *         description: Категория удалена
 *       404:
 *         description: Категория не найдена
 *       409:
 *         description: В категории есть рецепты
 */
router.delete('/:id', validateId, categoriesController.deleteCategory);

module.exports = router;
