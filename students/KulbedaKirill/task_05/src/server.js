require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Joi = require('joi');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Глобальные переменные для хранения данных
var places = [];
var reviews = [];
var id = 1;
var revId = 1;

// Swagger настройка
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API мест путешествий',
      version: '1.0.0',
      description: 'REST API для управления местами путешествий и отзывами',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /places:
 *   get:
 *     summary: Получить список мест
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Список мест
 */
app.get('/places', (req, res) => {
  var q = req.query.q;
  var limit = req.query.limit;
  var offset = req.query.offset;
  
  var result = places;
  
  if (q) {
    result = result.filter(p => p.name.includes(q) || p.description.includes(q));
  }
  
  if (offset) {
    result = result.slice(parseInt(offset));
  }
  
  if (limit) {
    result = result.slice(0, parseInt(limit));
  }
  
  res.json(result);
});

/**
 * @swagger
 * /places/{id}:
 *   get:
 *     summary: Получить место по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Место найдено
 *       404:
 *         description: Место не найдено
 */
app.get('/places/:id', (req, res) => {
  var placeId = req.params.id;
  var place = places.find(p => p.id == placeId);
  
  if (!place) {
    res.status(404).json({ error: 'Место не найдено' });
    return;
  }
  
  res.json(place);
});

/**
 * @swagger
 * /places:
 *   post:
 *     summary: Создать новое место
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               country:
 *                 type: string
 *               rating:
 *                 type: number
 *     responses:
 *       201:
 *         description: Место создано
 */
app.post('/places', (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().min(1).max(500),
    country: Joi.string().required(),
    rating: Joi.number().min(0).max(5)
  });
  
  const { error } = schema.validate(req.body);
  
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  
  var newPlace = {
    id: id++,
    name: req.body.name,
    description: req.body.description,
    country: req.body.country,
    rating: req.body.rating || 0,
    createdAt: new Date().toISOString()
  };
  
  places.push(newPlace);
  res.status(201).json(newPlace);
});

/**
 * @swagger
 * /places/{id}:
 *   put:
 *     summary: Обновить место
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Место обновлено
 */
app.put('/places/:id', (req, res) => {
  var placeId = req.params.id;
  var placeIndex = places.findIndex(p => p.id == placeId);
  
  if (placeIndex === -1) {
    res.status(404).json({ error: 'Не найдено' });
    return;
  }
  
  places[placeIndex] = {
    ...places[placeIndex],
    ...req.body,
    id: parseInt(placeId)
  };
  
  res.json(places[placeIndex]);
});

/**
 * @swagger
 * /places/{id}:
 *   delete:
 *     summary: Удалить место
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Место удалено
 */
app.delete('/places/:id', (req, res) => {
  var placeId = req.params.id;
  var placeIndex = places.findIndex(p => p.id == placeId);
  
  if (placeIndex === -1) {
    res.status(404).json({ error: 'Не найдено' });
    return;
  }
  
  places.splice(placeIndex, 1);
  res.status(204).send();
});

/**
 * @swagger
 * /places/{placeId}/reviews:
 *   get:
 *     summary: Получить отзывы места
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Список отзывов
 */
app.get('/places/:placeId/reviews', (req, res) => {
  var placeId = req.params.placeId;
  var placeReviews = reviews.filter(r => r.placeId == placeId);
  res.json(placeReviews);
});

/**
 * @swagger
 * /places/{placeId}/reviews:
 *   post:
 *     summary: Создать отзыв
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Отзыв создан
 */
app.post('/places/:placeId/reviews', (req, res) => {
  var placeId = req.params.placeId;
  var place = places.find(p => p.id == placeId);
  
  if (!place) {
    res.status(404).json({ error: 'Место не найдено' });
    return;
  }
  
  const schema = Joi.object({
    author: Joi.string().min(1).max(50).required(),
    text: Joi.string().min(1).max(500).required(),
    rating: Joi.number().min(1).max(5).required()
  });
  
  const { error } = schema.validate(req.body);
  
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  
  var newReview = {
    id: revId++,
    placeId: parseInt(placeId),
    author: req.body.author,
    text: req.body.text,
    rating: req.body.rating,
    createdAt: new Date().toISOString()
  };
  
  reviews.push(newReview);
  res.status(201).json(newReview);
});

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Удалить отзыв
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Отзыв удален
 */
app.delete('/reviews/:id', (req, res) => {
  var reviewId = req.params.id;
  var reviewIndex = reviews.findIndex(r => r.id == reviewId);
  
  if (reviewIndex === -1) {
    res.status(404).json({ error: 'Отзыв не найден' });
    return;
  }
  
  reviews.splice(reviewIndex, 1);
  res.status(204).send();
});

// Начальные данные
places.push({
  id: id++,
  name: 'Эйфелева башня',
  description: 'Знаменитая башня в Париже',
  country: 'Франция',
  rating: 4.8,
  createdAt: new Date().toISOString()
});

places.push({
  id: id++,
  name: 'Колизей',
  description: 'Древний амфитеатр в Риме',
  country: 'Италия',
  rating: 4.7,
  createdAt: new Date().toISOString()
});

reviews.push({
  id: revId++,
  placeId: 1,
  author: 'Иван',
  text: 'Отличное место!',
  rating: 5,
  createdAt: new Date().toISOString()
});

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Документация доступна на http://localhost:${PORT}/docs`);
});
