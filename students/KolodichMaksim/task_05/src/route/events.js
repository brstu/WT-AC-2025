const express = require('express');
const router = express.Router();
const {
  events,
  addEvent,
  findEventById,
  updateEvent,
  deleteEvent,
} = require('../data/storage');
const validate = require('../middleware/validate');
const { eventCreateSchema, eventUpdateSchema } = require('../schemas/eventSchemas');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         title: { type: string }
 *         description: { type: string }
 *         date: { type: string, format: date-time }
 *         location: { type: string }
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Получить список событий (с пагинацией и поиском)
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Поиск по title/description
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Список событий
 */
router.get('/events', (req, res) => {
  let data = events();
  const { q, limit = 10, offset = 0 } = req.query;

  if (q) {
    const search = q.toLowerCase();
    data = data.filter((e) => e.title.toLowerCase().includes(search) || (e.description && e.description.toLowerCase().includes(search)));
  }

  const total = data.length;
  data = data.slice(Number(offset), Number(offset) + Number(limit));

  res.json({
    data,
    meta: {
      total,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: offset + limit < total,
    },
  });
});

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Получить событие по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Событие
 *       404:
 *         description: Не найдено
 */
router.get('/events/:id', (req, res, next) => {
  const event = findEventById(req.params.id);
  if (!event) return next(new NotFoundError('Event not found'));
  res.json(event);
});

router.post('/events', validate(eventCreateSchema), (req, res) => {
  const event = addEvent(req.body);
  res.status(201).json(event);
});

router.patch('/events/:id', validate(eventUpdateSchema), (req, res, next) => {
  const updated = updateEvent(req.params.id, req.body);
  if (!updated) return next(new NotFoundError());
  res.json(updated);
});

router.delete('/events/:id', (req, res, next) => {
  const event = findEventById(req.params.id);
  if (!event) return next(new NotFoundError());
  deleteEvent(req.params.id);
  res.status(204).send();
});

module.exports = router;