// Подключение модулей
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Joi = require('joi');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Переменные для хранения данных
var DATA_FILE = './data.json';
var courses = [];
var lessons = [];
var modules = [];
var currentId = 1;

// Функция загрузки данных
function loadData() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    courses = data.courses || [];
    lessons = data.lessons || [];
    modules = data.modules || [];
    if (courses.length > 0) {
      currentId = Math.max(...courses.map(c => c.id)) + 1;
    }
  } catch (err) {
    courses = [];
    lessons = [];
    modules = [];
  }
}

// Функция сохранения данных
function saveData() {
  const data = { courses, lessons, modules };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Загрузка данных при старте
loadData();

// Swagger настройки
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Курсов',
      version: '1.0.0',
      description: 'API для управления курсами и уроками',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Получить список курсов
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
 *         description: Список курсов
 */
app.get('/courses', (req, res) => {
  var q = req.query.q;
  var limit = req.query.limit;
  var offset = req.query.offset;
  
  var result = courses;
  
  // Поиск по тексту
  if (q) {
    result = result.filter(c => {
      return c.title.includes(q) || c.description.includes(q);
    });
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
 * /courses/{id}:
 *   get:
 *     summary: Получить курс по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Курс найден
 *       404:
 *         description: Курс не найден
 */
app.get('/courses/:id', (req, res) => {
  var id = parseInt(req.params.id);
  var course = courses.find(c => c.id === id);
  
  if (!course) {
    return res.status(404).json({ error: 'Курс не найден' });
  }
  
  res.json(course);
});

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Создать новый курс
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Курс создан
 */
app.post('/courses', (req, res) => {
  // Валидация данных
  const schema = Joi.object({
    title: Joi.string().min(1).max(100).required(),
    description: Joi.string(),
    duration: Joi.number(),
    instructor: Joi.string(),
    price: Joi.number()
  });
  
  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  // Создание нового курса
  var newCourse = {
    id: currentId++,
    title: req.body.title,
    description: req.body.description,
    duration: req.body.duration,
    instructor: req.body.instructor,
    price: req.body.price
  };
  
  courses.push(newCourse);
  saveData();
  
  res.status(201).json(newCourse);
});

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Обновить курс
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Курс обновлён
 */
app.put('/courses/:id', (req, res) => {
  var id = parseInt(req.params.id);
  var index = courses.findIndex(c => c.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Курс не найден' });
  }
  
  courses[index] = {
    ...courses[index],
    ...req.body,
    id: id
  };
  
  saveData();
  res.json(courses[index]);
});

/**
 * @swagger
 * /courses/{id}:
 *   patch:
 *     summary: Частично обновить курс
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Курс обновлён
 */
app.patch('/courses/:id', (req, res) => {
  var id = parseInt(req.params.id);
  var index = courses.findIndex(c => c.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Курс не найден' });
  }
  
  courses[index] = {
    ...courses[index],
    ...req.body,
    id: id
  };
  
  saveData();
  res.json(courses[index]);
});

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Удалить курс
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Курс удалён
 */
app.delete('/courses/:id', (req, res) => {
  var id = parseInt(req.params.id);
  var index = courses.findIndex(c => c.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Курс не найден' });
  }
  
  courses.splice(index, 1);
  saveData();
  
  res.status(200).json({ message: 'Курс удалён' });
});

// Эндпоинты для уроков
app.get('/lessons', (req, res) => {
  var courseId = req.query.courseId;
  var result = lessons;
  
  if (courseId) {
    result = result.filter(l => l.courseId == courseId);
  }
  
  res.json(result);
});

app.get('/lessons/:id', (req, res) => {
  var id = parseInt(req.params.id);
  var lesson = lessons.find(l => l.id === id);
  
  if (!lesson) {
    return res.status(404).json({ error: 'Урок не найден' });
  }
  
  res.json(lesson);
});

app.post('/lessons', (req, res) => {
  var newLesson = {
    id: lessons.length + 1,
    courseId: req.body.courseId,
    title: req.body.title,
    content: req.body.content,
    order: req.body.order
  };
  
  lessons.push(newLesson);
  saveData();
  
  res.status(201).json(newLesson);
});

app.delete('/lessons/:id', (req, res) => {
  var id = parseInt(req.params.id);
  var index = lessons.findIndex(l => l.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Урок не найден' });
  }
  
  lessons.splice(index, 1);
  saveData();
  
  res.json({ message: 'Урок удалён' });
});

// Базовый роут
app.get('/', (req, res) => {
  res.send('API Курсов работает!');
});

// Обработка несуществующих роутов
app.use((req, res) => {
  res.status(404).json({ error: 'Роут не найден' });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Документация доступна на http://localhost:${PORT}/docs`);
});
