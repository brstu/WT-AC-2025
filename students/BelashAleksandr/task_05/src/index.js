require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Joi = require('joi');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Хранилище данных в памяти
let polls = [
  {
    id: 1,
    title: 'Какой язык программирования лучше?',
    description: 'Выберите ваш любимый язык',
    options: ['JavaScript', 'Python', 'Java', 'C++'],
    votes: [0, 0, 0, 0],
    createdAt: new Date().toISOString()
  }
];

let pollIdCounter = 2;

// Схемы валидации
const createPollSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string(),
  options: Joi.array().items(Joi.string()).min(2).required()
});

// Swagger конфигурация
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API опросов',
      version: '1.0.0',
      description: 'REST API для управления опросами и голосованиями'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`
      }
    ]
  },
  apis: ['./index.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /polls:
 *   get:
 *     summary: Получить список всех опросов
 *     responses:
 *       200:
 *         description: Список опросов
 */
app.get('/polls', (req, res) => {
  const q = req.query.q;
  const limit = req.query.limit;
  const offset = req.query.offset;
  
  let result = polls;
  
  if (q) {
    result = polls.filter(p => p.title.includes(q));
  }
  
  // Пагинация
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
 * /polls/{id}:
 *   get:
 *     summary: Получить опрос по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Опрос найден
 *       404:
 *         description: Опрос не найден
 */
app.get('/polls/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const poll = polls.find(p => p.id === id);
  
  if (!poll) {
    res.status(404).json({ error: 'Poll not found' });
    return;
  }
  
  res.json(poll);
});

/**
 * @swagger
 * /polls:
 *   post:
 *     summary: Создать новый опрос
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Опрос создан
 */
app.post('/polls', (req, res) => {
  const { error } = createPollSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  
  const newPoll = {
    id: pollIdCounter++,
    title: req.body.title,
    description: req.body.description || '',
    options: req.body.options,
    votes: new Array(req.body.options.length).fill(0),
    createdAt: new Date().toISOString()
  };
  
  polls.push(newPoll);
  res.status(201).json(newPoll);
});

/**
 * @swagger
 * /polls/{id}:
 *   delete:
 *     summary: Удалить опрос
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Опрос удален
 */
app.delete('/polls/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = polls.findIndex(p => p.id === id);
  
  if (index === -1) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  
  polls.splice(index, 1);
  res.status(204).send();
});

/**
 * @swagger
 * /polls/{id}/vote:
 *   post:
 *     summary: Проголосовать в опросе
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               optionIndex:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Голос учтен
 */
app.post('/polls/:id/vote', (req, res) => {
  const id = parseInt(req.params.id);
  const poll = polls.find(p => p.id === id);
  
  if (!poll) {
    return res.status(404).json({ error: 'Poll not found' });
  }
  
  const optionIndex = req.body.optionIndex;
  
  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    return res.status(400).json({ error: 'Invalid option' });
  }
  
  poll.votes[optionIndex]++;
  
  res.json({ message: 'Vote recorded', poll });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/docs`);
});
