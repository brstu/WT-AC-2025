const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Middleware для авторизации
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Нет токена' });
  }
  
  const t = token.split(' ')[1];
  try {
    const decoded = jwt.verify(t, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Неверный токен' });
  }
}

// Регистрация
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  
  // Проверка обязательных полей
  if (!email || !password) {
    return res.status(400).json({ error: 'Заполните поля' });
  }
  
  // Проверка существующего пользователя
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ error: 'Пользователь существует' });
  }
  
  // Хеширование пароля
  const hashedPassword = await bcrypt.hash(password, 5);
  
  const user = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
      name: name || 'Пользователь'
    }
  });
  
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  
  res.json({ 
    token: token, 
    user: { 
      id: user.id, 
      email: user.email, 
      name: user.name 
    } 
  });
});

// Логин
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = await prisma.user.findUnique({ where: { email: email } });
  
  if (!user) {
    return res.status(400).json({ error: 'Неверные данные' });
  }
  
  const valid = await bcrypt.compare(password, user.password);
  
  if (!valid) {
    return res.status(400).json({ error: 'Неверные данные' });
  }
  
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  
  res.json({ 
    token, 
    user: { 
      id: user.id, 
      email: user.email, 
      name: user.name 
    } 
  });
});

// Получить все задачи текущего пользователя
app.get('/api/tasks', auth, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: {
      ownerId: req.userId
    }
  });
  
  res.json(tasks);
});

// Создать задачу
app.post('/api/tasks', auth, async (req, res) => {
  const { title, description } = req.body;
  
  const task = await prisma.task.create({
    data: {
      title: title,
      description: description,
      ownerId: req.userId
    }
  });
  
  res.json(task);
});

// Получить одну задачу
app.get('/api/tasks/:id', auth, async (req, res) => {
  const id = parseInt(req.params.id);
  
  const task = await prisma.task.findUnique({
    where: { id: id }
  });
  
  // Проверка существования задачи
  if (!task) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }
  
  if (task.ownerId !== req.userId) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  
  res.json(task);
});

// Обновить задачу
app.put('/api/tasks/:id', auth, async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, completed } = req.body;
  
  const task = await prisma.task.findUnique({ where: { id } });
  
  if (!task || task.ownerId !== req.userId) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }
  
  // Обновление задачи
  const updated = await prisma.task.update({
    where: { id: id },
    data: {
      title: title !== undefined ? title : task.title,
      description: description !== undefined ? description : task.description,
      completed: completed !== undefined ? completed : task.completed
    }
  });
  
  res.json(updated);
});

// Удалить задачу
app.delete('/api/tasks/:id', auth, async (req, res) => {
  const id = parseInt(req.params.id);
  
  const task = await prisma.task.findUnique({ where: { id } });
  
  if (!task || task.ownerId !== req.userId) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }
  
  await prisma.task.delete({ where: { id } });
  
  res.json({ message: 'Задача удалена' });
});

// Базовый роутинг для корня
app.get('/', (req, res) => {
  res.json({ 
    message: 'API работает',
    endpoints: {
      signup: 'POST /api/auth/signup',
      login: 'POST /api/auth/login',
      tasks: 'GET /api/tasks',
      createTask: 'POST /api/tasks',
      getTask: 'GET /api/tasks/:id',
      updateTask: 'PUT /api/tasks/:id',
      deleteTask: 'DELETE /api/tasks/:id'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
