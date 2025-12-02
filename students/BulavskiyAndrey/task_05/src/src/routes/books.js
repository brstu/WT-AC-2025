const express = require('express');
const router = express.Router();
const booksController = require('../controllers/books');
const { validate, bookCreateSchema, bookUpdateSchema } = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - year
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор книги
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           description: Название книги
 *         author:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Автор книги
 *         year:
 *           type: integer
 *           minimum: 1000
 *           description: Год издания
 *         genre:
 *           type: string
 *           maxLength: 50
 *           description: Жанр книги
 *         isbn:
 *           type: string
 *           minLength: 10
 *           maxLength: 13
 *           description: ISBN книги
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: Описание книги
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/books:
 *   get:
 *     summary: Получить список книг
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Поиск по названию и автору
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Лимит записей
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Смещение
 *     responses:
 *       200:
 *         description: Список книг
 */
router.get('/', booksController.getAllBooks);

/**
 * @swagger
 * /api/v1/books/{id}:
 *   get:
 *     summary: Получить книгу по ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные книги
 *       404:
 *         description: Книга не найдена
 */
router.get('/:id', booksController.getBookById);

/**
 * @swagger
 * /api/v1/books:
 *   post:
 *     summary: Создать новую книгу
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Книга создана
 *       422:
 *         description: Ошибка валидации
 */
router.post('/', validate(bookCreateSchema), booksController.createBook);

/**
 * @swagger
 * /api/v1/books/{id}:
 *   put:
 *     summary: Обновить книгу
 *     tags: [Books]
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
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Книга обновлена
 *       404:
 *         description: Книга не найдена
 *       422:
 *         description: Ошибка валидации
 */
router.put('/:id', validate(bookUpdateSchema), booksController.updateBook);

/**
 * @swagger
 * /api/v1/books/{id}:
 *   delete:
 *     summary: Удалить книгу
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Книга удалена
 *       404:
 *         description: Книга не найдена
 */
router.delete('/:id', booksController.deleteBook);

module.exports = router;