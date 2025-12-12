const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');
const validate = require('../middleware/validate');
const { createMediaSchema, updateMediaSchema, querySchema } = require('../schemas/media.schema');

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: Управление каталогом фильмов и сериалов
 */

/**
 * @swagger
 * /media:
 *   get:
 *     summary: Получить список всех фильмов/сериалов с фильтрацией
 *     description: Возвращает список медиа-контента с поддержкой поиска, фильтрации по жанру/типу и пагинации
 *     tags: [Media]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Поиск по названию или описанию
 *         example: "матрица"
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Фильтрация по жанру
 *         example: "фантастика"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [movie, series]
 *         description: Тип контента
 *         example: "movie"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Количество записей на странице
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Смещение (для пагинации)
 *     responses:
 *       200:
 *         description: Успешный ответ со списком медиа
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Media'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Общее количество записей
 *                     limit:
 *                       type: integer
 *                       description: Количество записей на странице
 *                     offset:
 *                       type: integer
 *                       description: Смещение
 *                     hasMore:
 *                       type: boolean
 *                       description: Есть ли еще записи
 *       400:
 *         description: Неверные параметры запроса
 *       422:
 *         description: Ошибка валидации параметров
 */
router.get('/', validate(querySchema, 'query'), mediaController.getAllMedia);

/**
 * @swagger
 * /media/stats:
 *   get:
 *     summary: Получить статистику по каталогу
 *     description: Возвращает статистическую информацию о содержимом каталога
 *     tags: [Media]
 *     responses:
 *       200:
 *         description: Статистика успешно получена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Общее количество записей
 *                 movies:
 *                   type: integer
 *                   description: Количество фильмов
 *                 series:
 *                   type: integer
 *                   description: Количество сериалов
 *                 averageRating:
 *                   type: number
 *                   format: float
 *                   description: Средний рейтинг
 *                 byGenre:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   description: Количество записей по жанрам
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get('/stats', mediaController.getStats);

/**
 * @swagger
 * /media/genres:
 *   get:
 *     summary: Получить список всех уникальных жанров
 *     description: Возвращает массив всех жанров, представленных в каталоге
 *     tags: [Media]
 *     responses:
 *       200:
 *         description: Список жанров успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["фантастика", "драма", "комедия", "боевик"]
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get('/genres', mediaController.getGenres);

/**
 * @swagger
 * /media/{id}:
 *   get:
 *     summary: Получить фильм/сериал по ID
 *     description: Возвращает полную информацию о конкретном медиа-контенте
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID записи
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Запись успешно найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Media'
 *       404:
 *         description: Запись с указанным ID не найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Неверный формат ID
 */
router.get('/:id', mediaController.getMediaById);

/**
 * @swagger
 * /media:
 *   post:
 *     summary: Создать новую запись о фильме/сериале
 *     description: Добавляет новый медиа-контент в каталог
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       description: Данные для создания новой записи
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - year
 *               - genre
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: Название
 *                 example: "Интерстеллар"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Описание
 *                 example: "Фильм о космических путешествиях"
 *               year:
 *                 type: integer
 *                 minimum: 1900
 *                 maximum: текущий год
 *                 description: Год выпуска
 *                 example: 2014
 *               genre:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 description: Массив жанров
 *                 example: ["фантастика", "драма"]
 *               type:
 *                 type: string
 *                 enum: [movie, series]
 *                 description: Тип контента
 *                 example: "movie"
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *                 description: Рейтинг
 *                 example: 8.6
 *               duration:
 *                 type: integer
 *                 description: Продолжительность в минутах (обязательно для фильмов)
 *                 example: 169
 *               seasons:
 *                 type: integer
 *                 description: Количество сезонов (обязательно для сериалов)
 *                 example: 3
 *     responses:
 *       201:
 *         description: Запись успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Media'
 *       422:
 *         description: Ошибка валидации данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Неверный формат данных
 */
router.post('/', validate(createMediaSchema), mediaController.createMedia);

/**
 * @swagger
 * /media/{id}:
 *   patch:
 *     summary: Частично обновить запись о фильме/сериале
 *     description: Обновляет указанные поля существующей записи
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID записи для обновления
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       description: Поля для обновления (все поля опциональны, но минимум одно должно быть указано)
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: Название
 *                 example: "Новое название"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Описание
 *                 example: "Обновленное описание"
 *               year:
 *                 type: integer
 *                 minimum: 1900
 *                 maximum: текущий год
 *                 description: Год выпуска
 *                 example: 2023
 *               genre:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 description: Массив жанров
 *                 example: ["комедия", "драма"]
 *               type:
 *                 type: string
 *                 enum: [movie, series]
 *                 description: Тип контента
 *                 example: "movie"
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *                 description: Рейтинг
 *                 example: 9.0
 *               duration:
 *                 type: integer
 *                 description: Продолжительность в минутах
 *                 example: 120
 *               seasons:
 *                 type: integer
 *                 description: Количество сезонов
 *                 example: 5
 *     responses:
 *       200:
 *         description: Запись успешно обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Media'
 *       404:
 *         description: Запись с указанным ID не найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Ошибка валидации данных
 *       400:
 *         description: Неверный формат данных или ID
 */
router.patch('/:id', validate(updateMediaSchema), mediaController.updateMedia);

/**
 * @swagger
 * /media/{id}:
 *   delete:
 *     summary: Удалить запись о фильме/сериале
 *     description: Удаляет медиа-контент из каталога по ID
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID записи для удаления
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       204:
 *         description: Запись успешно удалена (нет содержимого в ответе)
 *       404:
 *         description: Запись с указанным ID не найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Неверный формат ID
 */
router.delete('/:id', mediaController.deleteMedia);

module.exports = router;