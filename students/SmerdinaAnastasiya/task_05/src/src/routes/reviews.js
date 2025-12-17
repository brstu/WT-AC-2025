const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviews');
const { validate, reviewCreateSchema, reviewUpdateSchema } = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - bookId
 *         - author
 *         - rating
 *         - comment
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор отзыва
 *         bookId:
 *           type: string
 *           description: ID книги
 *         author:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: Автор отзыва
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Рейтинг (1-5)
 *         comment:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: Текст отзыва
 *         userId:
 *           type: string
 *           maxLength: 50
 *           description: ID пользователя
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/reviews:
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
 *       404:
 *         description: Книга не найдена
 *       422:
 *         description: Ошибка валидации
 */
router.post('/', validate(reviewCreateSchema), reviewsController.createReview);

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   get:
 *     summary: Получить отзыв по ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные отзыва
 *       404:
 *         description: Отзыв не найден
 */
router.get('/:id', reviewsController.getReviewById);

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   put:
 *     summary: Обновить отзыв
 *     tags: [Reviews]
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
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       200:
 *         description: Отзыв обновлен
 *       404:
 *         description: Отзыв не найден
 *       422:
 *         description: Ошибка валидации
 */
router.put('/:id', validate(reviewUpdateSchema), reviewsController.updateReview);

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   delete:
 *     summary: Удалить отзыв
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Отзыв удален
 *       404:
 *         description: Отзыв не найден
 */
router.delete('/:id', reviewsController.deleteReview);

module.exports = router;