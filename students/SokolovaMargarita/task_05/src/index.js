require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { z } = require('zod');

// Хранение данных в памяти
let columns = [
  { id: 1, name: 'To Do' },
  { id: 2, name: 'In Progress' },
  { id: 3, name: 'Done' }
];
let tasks = [];
let nextTaskId = 1;
let nextColumnId = 4;

// Схемы Zod
const columnSchema = z.object({
  name: z.string().min(1).max(50)
});

const taskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  columnId: z.number().int().positive(),
  dueDate: z.string().datetime().optional()
});

const taskUpdateSchema = taskSchema.partial();

// Пользовательский класс ошибки
class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Настройка Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kanban API',
      version: '1.0.0',
      description: 'API для задач и колонок Kanban'
    },
    servers: [{ url: `http://localhost:${process.env.PORT}/api/v1` }]
  },
  apis: ['./index.js'] // Для комментариев JSDoc
};
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Версионированный API
const api = express.Router();
app.use('/api/v1', api);

/**
 * @openapi
 * /columns:
 *   get:
 *     summary: Получить все колонки
 *     responses:
 *       200:
 *         description: Список колонок
 */
api.get('/columns', (req, res) => {
  res.json(columns);
});

/**
 * @openapi
 * /columns/{id}:
 *   get:
 *     summary: Получить колонку по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Детали колонки
 *       404:
 *         description: Колонка не найдена
 */
api.get('/columns/:id', (req, res, next) => {
  const id = parseInt(req.params.id);
  const column = columns.find(c => c.id === id);
  if (!column) return next(new ApiError(404, 'Колонка не найдена'));
  res.json(column);
});

/**
 * @openapi
 * /columns:
 *   post:
 *     summary: Создать новую колонку
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Созданная колонка
 *       422:
 *         description: Ошибка валидации
 */
api.post('/columns', (req, res, next) => {
  try {
    const data = columnSchema.parse(req.body);
    const newColumn = { id: nextColumnId++, ...data };
    columns.push(newColumn);
    res.status(201).json(newColumn);
  } catch (err) {
    next(new ApiError(422, 'Ошибка валидации', err.errors));
  }
});

/**
 * @openapi
 * /columns/{id}:
 *   patch:
 *     summary: Обновить колонку
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
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Обновленная колонка
 *       404:
 *         description: Колонка не найдена
 *       422:
 *         description: Ошибка валидации
 */
api.patch('/columns/:id', (req, res, next) => {
  const id = parseInt(req.params.id);
  const index = columns.findIndex(c => c.id === id);
  if (index === -1) return next(new ApiError(404, 'Колонка не найдена'));
  try {
    const data = columnSchema.partial().parse(req.body);
    columns[index] = { ...columns[index], ...data };
    res.json(columns[index]);
  } catch (err) {
    next(new ApiError(422, 'Ошибка валидации', err.errors));
  }
});

/**
 * @openapi
 * /columns/{id}:
 *   delete:
 *     summary: Удалить колонку
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Удалено
 *       404:
 *         description: Колонка не найдена
 */
api.delete('/columns/:id', (req, res, next) => {
  const id = parseInt(req.params.id);
  const index = columns.findIndex(c => c.id === id);
  if (index === -1) return next(new ApiError(404, 'Колонка не найдена'));
  columns.splice(index, 1);
  // Удалить задачи в этой колонке (каскадное удаление для простоты)
  tasks = tasks.filter(t => t.columnId !== id);
  res.status(204).send();
});

/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: Получить задачи с пагинацией, поиском, фильтром, сортировкой
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
 *       - in: query
 *         name: columnId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, dueDate]
 *     responses:
 *       200:
 *         description: Список задач с метаданными
 */
api.get('/tasks', (req, res) => {
  let filteredTasks = [...tasks];
  const { q, columnId, sortBy, limit = 10, offset = 0 } = req.query;

  if (q) {
    const search = q.toLowerCase();
    filteredTasks = filteredTasks.filter(t => t.title.toLowerCase().includes(search) || (t.description && t.description.toLowerCase().includes(search)));
  }
  if (columnId) {
    filteredTasks = filteredTasks.filter(t => t.columnId === parseInt(columnId));
  }
  if (sortBy === 'title') {
    filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'dueDate') {
    filteredTasks.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
  }

  const total = filteredTasks.length;
  const paginated = filteredTasks.slice(offset, offset + parseInt(limit));

  res.json({
    data: paginated,
    meta: { total, limit: parseInt(limit), offset: parseInt(offset) }
  });
});

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     summary: Получить задачу по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Детали задачи
 *       404:
 *         description: Задача не найдена
 */
api.get('/tasks/:id', (req, res, next) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (!task) return next(new ApiError(404, 'Задача не найдена'));
  res.json(task);
});

/**
 * @openapi
 * /tasks:
 *   post:
 *     summary: Создать новую задачу
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
 *               columnId:
 *                 type: integer
 *               dueDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Созданная задача
 *       400:
 *         description: Некорректная колонка
 *       422:
 *         description: Ошибка валидации
 */
api.post('/tasks', (req, res, next) => {
  try {
    const data = taskSchema.parse(req.body);
    if (!columns.find(c => c.id === data.columnId)) {
      return next(new ApiError(400, 'Некорректный columnId'));
    }
    const newTask = { id: nextTaskId++, ...data };
    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (err) {
    next(new ApiError(422, 'Ошибка валидации', err.errors));
  }
});

/**
 * @openapi
 * /tasks/{id}:
 *   patch:
 *     summary: Обновить задачу
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               columnId:
 *                 type: integer
 *               dueDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Обновленная задача
 *       400:
 *         description: Некорректная колонка
 *       404:
 *         description: Задача не найдена
 *       422:
 *         description: Ошибка валидации
 */
api.patch('/tasks/:id', (req, res, next) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return next(new ApiError(404, 'Задача не найдена'));
  try {
    const data = taskUpdateSchema.parse(req.body);
    if (data.columnId && !columns.find(c => c.id === data.columnId)) {
      return next(new ApiError(400, 'Некорректный columnId'));
    }
    tasks[index] = { ...tasks[index], ...data };
    res.json(tasks[index]);
  } catch (err) {
    next(new ApiError(422, 'Ошибка валидации', err.errors));
  }
});

/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     summary: Удалить задачу
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Удалено
 *       404:
 *         description: Задача не найдена
 */
api.delete('/tasks/:id', (req, res, next) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return next(new ApiError(404, 'Задача не найдена'));
  tasks.splice(index, 1);
  res.status(204).send();
});

// Централизованный обработчик ошибок
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const body = { message: err.message || 'Внутренняя ошибка сервера' };
  if (err.details) body.details = err.details;
  if (process.env.NODE_ENV !== 'production') body.stack = err.stack; // Без стека в продакшене
  res.status(status).json(body);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});