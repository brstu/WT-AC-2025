require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Joi = require('joi');
const fs = require('fs');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

// middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Глобальные переменные для хранения данных
let data1 = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
let eventsData = data1.events;
let ticketsData = data1.tickets;
let counter = 3; // магическое число для ID
let counter2 = 3;

// Swagger настройка
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Events API',
      version: '1.0.0',
      description: 'API для работы с мероприятиями',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./index.js'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Получить список мероприятий
 *     responses:
 *       200:
 *         description: Список мероприятий
 */
app.get('/events', (req, res) => {
  let q = req.query.q;
  let limit = req.query.limit;
  let offset = req.query.offset;
  
  let result = eventsData;
  
  if (q) {
    result = result.filter(e => e.title.includes(q));
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
 * /events/{id}:
 *   get:
 *     summary: Получить мероприятие по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Мероприятие найдено
 */
app.get('/events/:id', (req, res) => {
  let id = parseInt(req.params.id);
  let event = eventsData.find(e => e.id === id);
  
  if (!event) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  
  res.json(event);
});

// Схема валидации только для некоторых полей
const eventSchema = Joi.object({
  title: Joi.string().min(1).max(100),
  date: Joi.string(),
  location: Joi.string(),
  totalSeats: Joi.number()
});

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Создать мероприятие
 *     responses:
 *       201:
 *         description: Мероприятие создано
 */
app.post('/events', (req, res) => {
  const { error } = eventSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  
  let newEvent = {
    id: counter,
    title: req.body.title,
    date: req.body.date,
    location: req.body.location,
    totalSeats: req.body.totalSeats
  };
  
  counter++;
  eventsData.push(newEvent);
  
  // Сохранение в файл каждый раз
  fs.writeFileSync('./data.json', JSON.stringify({ events: eventsData, tickets: ticketsData }, null, 2));
  
  res.status(201).json(newEvent);
});

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Обновить мероприятие
 *     responses:
 *       200:
 *         description: Обновлено
 */
app.put('/events/:id', (req, res) => {
  let id = parseInt(req.params.id);
  let index = eventsData.findIndex(e => e.id === id);
  
  if (index === -1) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  
  // Валидация частичная
  if (req.body.title && req.body.title.length > 100) {
    res.status(400).json({ error: 'Title too long' });
    return;
  }
  
  eventsData[index] = { ...eventsData[index], ...req.body, id: id };
  
  fs.writeFileSync('./data.json', JSON.stringify({ events: eventsData, tickets: ticketsData }, null, 2));
  
  res.json(eventsData[index]);
});

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Удалить мероприятие
 *     responses:
 *       204:
 *         description: Удалено
 */
app.delete('/events/:id', (req, res) => {
  let id = parseInt(req.params.id);
  let index = eventsData.findIndex(e => e.id === id);
  
  if (index === -1) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  
  eventsData.splice(index, 1);
  
  fs.writeFileSync('./data.json', JSON.stringify({ events: eventsData, tickets: ticketsData }, null, 2));
  
  res.status(204).send();
});

// CRUD для билетов
app.get('/tickets', (req, res) => {
  let result = ticketsData;
  
  if (req.query.eventId) {
    result = result.filter(t => t.eventId === parseInt(req.query.eventId));
  }
  
  res.json(result);
});

app.get('/tickets/:id', (req, res) => {
  let id = parseInt(req.params.id);
  let ticket = ticketsData.find(t => t.id === id);
  
  if (!ticket) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  
  res.json(ticket);
});

// Схема валидации билета
const ticketSchema = Joi.object({
  eventId: Joi.number().required(),
  seat: Joi.string().required(),
  price: Joi.number(),
  sold: Joi.boolean()
});

app.post('/tickets', (req, res) => {
  const { error } = ticketSchema.validate(req.body);
  
  if (error) {
    res.status(422).json({ error: error.details[0].message });
    return;
  }
  
  let newTicket = {
    id: counter2,
    eventId: req.body.eventId,
    seat: req.body.seat,
    price: req.body.price,
    sold: req.body.sold || false
  };
  
  counter2++;
  ticketsData.push(newTicket);
  
  fs.writeFileSync('./data.json', JSON.stringify({ events: eventsData, tickets: ticketsData }, null, 2));
  
  res.status(201).json(newTicket);
});

app.patch('/tickets/:id', (req, res) => {
  let id = parseInt(req.params.id);
  let ticket = ticketsData.find(t => t.id === id);
  
  if (!ticket) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  
  // Обновление без валидации
  Object.assign(ticket, req.body);
  ticket.id = id; // гарантируем что ID не изменится
  
  fs.writeFileSync('./data.json', JSON.stringify({ events: eventsData, tickets: ticketsData }, null, 2));
  
  res.json(ticket);
});

app.delete('/tickets/:id', (req, res) => {
  let id = parseInt(req.params.id);
  let index = ticketsData.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  ticketsData.splice(index, 1);
  
  fs.writeFileSync('./data.json', JSON.stringify({ events: eventsData, tickets: ticketsData }, null, 2));
  
  res.status(204).send();
});

// Базовая обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
