import express from 'express';
import {
  getAllEpisodes,
  getEpisodeById,
  createEpisode,
  updateEpisode,
  deleteEpisode
} from '../controllers/episodeController.js';
import { validate } from '../middleware/validate.js';
import { createEpisodeSchema, updateEpisodeSchema } from '../schemas/episodeSchemas.js';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Episodes
 *   description: API для управления эпизодами подкастов
 */

/**
 * @swagger
 * /api/v1/podcasts/{podcastId}/episodes:
 *   get:
 *     summary: Получить список эпизодов подкаста
 *     tags: [Episodes]
 *     parameters:
 *       - in: path
 *         name: podcastId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID подкаста
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Поиск по названию эпизода
 *       - in: query
 *         name: season
 *         schema:
 *           type: integer
 *         description: Фильтр по номеру сезона
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
 *         description: Список эпизодов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Episode'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *       404:
 *         description: Подкаст не найден
 */
router.get('/', getAllEpisodes);

/**
 * @swagger
 * /api/v1/podcasts/{podcastId}/episodes:
 *   post:
 *     summary: Создать новый эпизод
 *     tags: [Episodes]
 *     parameters:
 *       - in: path
 *         name: podcastId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID подкаста
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EpisodeCreate'
 *     responses:
 *       201:
 *         description: Эпизод успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Episode'
 *       404:
 *         description: Подкаст не найден
 *       422:
 *         description: Ошибка валидации
 */
router.post('/', validate(createEpisodeSchema), createEpisode);

/**
 * @swagger
 * /api/v1/podcasts/{podcastId}/episodes/{episodeId}:
 *   get:
 *     summary: Получить эпизод по ID
 *     tags: [Episodes]
 *     parameters:
 *       - in: path
 *         name: podcastId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID подкаста
 *       - in: path
 *         name: episodeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID эпизода
 *     responses:
 *       200:
 *         description: Детали эпизода
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Episode'
 *       404:
 *         description: Подкаст или эпизод не найден
 */
router.get('/:episodeId', getEpisodeById);

/**
 * @swagger
 * /api/v1/podcasts/{podcastId}/episodes/{episodeId}:
 *   patch:
 *     summary: Обновить эпизод
 *     tags: [Episodes]
 *     parameters:
 *       - in: path
 *         name: podcastId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID подкаста
 *       - in: path
 *         name: episodeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID эпизода
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EpisodeUpdate'
 *     responses:
 *       200:
 *         description: Эпизод успешно обновлён
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Episode'
 *       404:
 *         description: Подкаст или эпизод не найден
 *       422:
 *         description: Ошибка валидации
 */
router.patch('/:episodeId', validate(updateEpisodeSchema), updateEpisode);

/**
 * @swagger
 * /api/v1/podcasts/{podcastId}/episodes/{episodeId}:
 *   delete:
 *     summary: Удалить эпизод
 *     tags: [Episodes]
 *     parameters:
 *       - in: path
 *         name: podcastId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID подкаста
 *       - in: path
 *         name: episodeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID эпизода
 *     responses:
 *       204:
 *         description: Эпизод успешно удалён
 *       404:
 *         description: Подкаст или эпизод не найден
 */
router.delete('/:episodeId', deleteEpisode);

export default router;
