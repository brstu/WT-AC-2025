import { Router } from 'express';
import {
  getAllAds,
  getAdById,
  createAd,
  updateAd,
  deleteAd
} from '../controllers/ads.controller.js';

import { validate } from '../middlewares/validate.middleware.js';
import { createAdSchema, updateAdSchema } from '../schemas/ads.schema.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Ad:
 *       type: object
 *       required:
 *         - title
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "Продам ноутбук"
 *         description:
 *           type: string
 *           example: "В хорошем состоянии"
 *         price:
 *           type: number
 *           example: 25000
 *         published:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-11-10T12:00:00.000Z"
 */

/**
 * @swagger
 * tags:
 *   name: Ads
 *   description: Управление объявлениями
 */

/**
 * @swagger
 * /api/ads:
 *   get:
 *     summary: Получить список объявлений
 *     tags: [Ads]
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ad'
 */
router.get('/', getAllAds);

/**
 * @swagger
 * /api/ads/{id}:
 *   get:
 *     summary: Получить объявление по ID
 *     tags: [Ads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID объявления
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ad'
 *       404:
 *         description: Объявление не найдено
 */
router.get('/:id', getAdById);

/**
 * @swagger
 * /api/ads:
 *   post:
 *     summary: Создать новое объявление
 *     tags: [Ads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ad'
 *     responses:
 *       201:
 *         description: Объявление создано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ad'
 *       422:
 *         description: Ошибка валидации
 */
router.post('/', validate(createAdSchema), createAd);

/**
 * @swagger
 * /api/ads/{id}:
 *   put:
 *     summary: Обновить объявление
 *     tags: [Ads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID объявления
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ad'
 *     responses:
 *       200:
 *         description: Объявление обновлено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ad'
 *       404:
 *         description: Объявление не найдено
 *       422:
 *         description: Ошибка валидации
 */
router.put('/:id', validate(updateAdSchema), updateAd);

/**
 * @swagger
 * /api/ads/{id}:
 *   delete:
 *     summary: Удалить объявление
 *     tags: [Ads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID объявления
 *     responses:
 *       204:
 *         description: Объявление удалено
 *       404:
 *         description: Объявление не найдено
 */
router.delete('/:id', deleteAd);

export default router;
