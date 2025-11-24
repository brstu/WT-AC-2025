const express = require('express');
const router = express.Router();
const {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewsController');
const validate = require('../middleware/validate');
const { createReviewSchema, updateReviewSchema } = require('../schemas/review');

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - placeName
 *         - author
 *         - rating
 *         - visitedAt
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор отзыва
 *         placeName:
 *           type: string
 *           maxLength: 100
 *           description: Название места
 *         author:
 *           type: string
 *           maxLength: 50
 *           description: Автор отзыва
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Оценка (1-5 звёзд)
 *         comment:
 *           type: string
 *           maxLength: 500
 *           description: Текст отзыва
 *         visitedAt:
 *           type: string
 *           format: date-time
 *           description: Дата посещения в формате ISO 8601
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата создания отзыва
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Дата последнего обновления
 *       example:
 *         id: 1
 *         placeName: "Кофейня 'Уют'"
 *         author: "Анна"
 *         rating: 5
 *         comment: "Очень вкусный кофе и дружелюбный персонал!"
 *         visitedAt: "2024-10-15T14:30:00.000Z"
 *         createdAt: "2024-10-20T10:00:00.000Z"
 *         updatedAt: "2024-10-20T10:00:00.000Z"
 */

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Управление отзывами о местах
 */

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Получить список отзывов
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 */
router.get('/', getAllReviews);

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Получить отзыв по ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID отзыва
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       404:
 *         description: Отзыв не найден
 */
router.get('/:id', getReviewById);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Создать новый отзыв
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       201:
 *         description: Отзыв создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       422:
 *         description: Ошибка валидации
 */
router.post('/', validate(createReviewSchema), createReview);

/**
 * @swagger
 * /reviews/{id}:
 *   patch:
 *     summary: Обновить отзыв
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID отзыва
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       200:
 *         description: Отзыв обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       404:
 *         description: Отзыв не найден
 *       422:
 *         description: Ошибка валидации
 */
router.patch('/:id', validate(updateReviewSchema), updateReview);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Удалить отзыв
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID отзыва
 *     responses:
 *       204:
 *         description: Отзыв удален
 *       404:
 *         description: Отзыв не найден
 */
router.delete('/:id', deleteReview);

module.exports = router;