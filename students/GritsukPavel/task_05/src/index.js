const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Joi = require('joi');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Хранилище данных в памяти
let books = [
  {
    id: 1,
    title: "Война и мир",
    author: "Лев Толстой",
    year: 1869,
    isbn: "978-5-17-098345-1",
    available: true
  },
  {
    id: 2,
    title: "Преступление и наказание",
    author: "Федор Достоевский",
    year: 1866,
    isbn: "978-5-17-098346-2",
    available: true
  }
];

let reviews = [];
let bookIdCounter = 3;
let reviewIdCounter = 1;

// Swagger конфигурация
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library API',
      version: '1.0.0',
      description: 'API для управления библиотекой книг',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Получить список всех книг
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
 *         description: Количество книг
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Смещение
 *     responses:
 *       200:
 *         description: Список книг
 */
app.get('/books', (req, res) => {
  let result = books;
  
  // Поиск
  if (req.query.q) {
    const query = req.query.q.toLowerCase();
    result = result.filter(book => 
      book.title.toLowerCase().includes(query) || 
      book.author.toLowerCase().includes(query)
    );
  }
  
  // Пагинация
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  
  result = result.slice(offset, offset + limit);
  
  res.json(result);
});

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Получить книгу по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Книга найдена
 *       404:
 *         description: Книга не найдена
 */
app.get('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);
  
  if (!book) {
    return res.status(404).json({ error: 'Книга не найдена' });
  }
  
  res.json(book);
});

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Создать новую книгу
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               year:
 *                 type: integer
 *               isbn:
 *                 type: string
 *     responses:
 *       201:
 *         description: Книга создана
 */
app.post('/books', (req, res) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(200).required(),
    author: Joi.string().min(1).max(100).required(),
    year: Joi.number().integer().min(1000).max(2100),
    isbn: Joi.string(),
    available: Joi.boolean()
  });
  
  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  const newBook = {
    id: bookIdCounter++,
    title: req.body.title,
    author: req.body.author,
    year: req.body.year,
    isbn: req.body.isbn || '',
    available: req.body.available !== undefined ? req.body.available : true
  };
  
  books.push(newBook);
  
  res.status(201).json(newBook);
});

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Обновить книгу
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
 *     responses:
 *       200:
 *         description: Книга обновлена
 */
app.put('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = books.findIndex(b => b.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Книга не найдена' });
  }
  
  // Минимальная валидация
  if (req.body.title && req.body.title.length < 1) {
    return res.status(400).json({ error: 'Название слишком короткое' });
  }
  
  books[index] = {
    ...books[index],
    ...req.body,
    id: id
  };
  
  res.json(books[index]);
});

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Удалить книгу
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Книга удалена
 */
app.delete('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = books.findIndex(b => b.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Книга не найдена' });
  }
  
  books.splice(index, 1);
  
  res.status(204).send();
});

// Отзывы - только базовая реализация
app.get('/reviews', (req, res) => {
  res.json(reviews);
});

app.post('/reviews', (req, res) => {
  const newReview = {
    id: reviewIdCounter++,
    bookId: req.body.bookId,
    text: req.body.text,
    rating: req.body.rating
  };
  
  reviews.push(newReview);
  res.status(201).json(newReview);
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`Документация доступна на http://localhost:${PORT}/docs`);
});
