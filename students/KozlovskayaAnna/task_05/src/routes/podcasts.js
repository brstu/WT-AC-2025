import express from 'express';
import {
  getAllPodcasts,
  getPodcastById,
  createPodcast,
  updatePodcast,
  deletePodcast
} from '../controllers/podcastController.js';
import { validate } from '../middleware/validate.js';
import { createPodcastSchema, updatePodcastSchema } from '../schemas/podcastSchemas.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Podcasts
 *   description: API для управления подкастами
 */

/**
 * @swagger
 * /api/v1/podcasts:
 *   get:
 *     summary: Получить список всех подкастов
 *     tags: [Podcasts]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Поиск по названию или автору
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Количество элементов на странице
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Смещение для пагинации
 *     responses:
 *       200:
 *         description: Список подкастов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Podcast'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 */
router.get('/', getAllPodcasts);

/**
 * @swagger
 * /api/v1/podcasts:
 *   post:
 *     summary: Создать новый подкаст
 *     tags: [Podcasts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PodcastCreate'
 *     responses:
 *       201:
 *         description: Подкаст успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Podcast'
 *       422:
 *         description: Ошибка валидации
 */
router.post('/', validate(createPodcastSchema), createPodcast);

/**
 * @swagger
 * /api/v1/podcasts/{id}:
 *   get:
 *     summary: Получить подкаст по ID
 *     tags: [Podcasts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID подкаста
 *     responses:
 *       200:
 *         description: Детали подкаста
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Podcast'
 *       404:
 *         description: Подкаст не найден
 */
router.get('/:id', getPodcastById);

/**
 * @swagger
 * /api/v1/podcasts/{id}:
 *   patch:
 *     summary: Обновить подкаст
 *     tags: [Podcasts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID подкаста
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PodcastUpdate'
 *     responses:
 *       200:
 *         description: Подкаст успешно обновлён
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Podcast'
 *       404:
 *         description: Подкаст не найден
 *       422:
 *         description: Ошибка валидации
 */
router.patch('/:id', validate(updatePodcastSchema), updatePodcast);

/**
 * @swagger
 * /api/v1/podcasts/{id}:
 *   delete:
 *     summary: Удалить подкаст и все его эпизоды
 *     tags: [Podcasts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID подкаста
 *     responses:
 *       204:
 *         description: Подкаст успешно удалён
 *       404:
 *         description: Подкаст не найден
 */
router.delete('/:id', deletePodcast);

export default router;
