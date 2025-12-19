const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const port = 3000;

app.use(cors());
app.use(express.json());

var secret = process.env.JWT_SECRET || "super-secret-123";

// Регистрация
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Заполните все поля' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: name || 'Пользователь'
      }
    });
    
    res.json({ 
      message: 'Пользователь создан',
      user: {
        id: user.id,
        email: user.email,
        password: hashedPassword
      }
    });
  } catch (e) {
    res.status(400).json({ error: 'Ошибка' });
  }
});

// Логин
app.post('/api/auth/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Неверные данные' });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      return res.status(400).json({ message: 'Неверные данные' });
    }
    
    const token = jwt.sign({ userId: user.id }, secret);
    
    res.json({ 
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Middleware авторизации
function auth(req, res, next) {
  const header = req.headers.authorization;
  
  if (!header) {
    return res.status(401).json({ message: 'Нет токена' });
  }
  
  const token = header.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.userId;
    next();
  } catch (e) {
    res.status(401).json({ message: 'Невалидный токен' });
  }
}

// CRUD для записей здоровья

// Получить все записи
app.get('/api/records', auth, async (req, res) => {
  try {
    const records = await prisma.healthRecord.findMany({
      where: {
        ownerId: req.userId
      }
    });
    
    res.json(records);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка' });
  }
});

// Создать запись
app.post('/api/records', auth, async (req, res) => {
  const { type, value, date, goal, notes } = req.body;
  
  if (!type || !value) {
    return res.status(400).json({ message: 'Заполните поля' });
  }
  
  try {
    const record = await prisma.healthRecord.create({
      data: {
        type: type,
        value: value,
        date: new Date(date || Date.now()),
        goal: goal,
        notes: notes,
        ownerId: req.userId
      }
    });
    
    res.json(record);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка создания' });
  }
});

// Получить одну запись
app.get('/api/records/:id', auth, async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    const record = await prisma.healthRecord.findUnique({
      where: { id: id }
    });
    
    if (!record) {
      return res.status(404).json({ message: 'Не найдено' });
    }
    
    res.json(record);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка' });
  }
});

// Обновить запись
app.put('/api/records/:id', auth, async (req, res) => {
  const id = parseInt(req.params.id);
  const { type, value, date, goal, notes } = req.body;
  
  try {
    const existing = await prisma.healthRecord.findFirst({
      where: {
        id: id,
        ownerId: req.userId
      }
    });
    
    if (!existing) {
      return res.status(404).json({ message: 'Не найдено' });
    }
    
    const record = await prisma.healthRecord.update({
      where: { id: id },
      data: {
        type: type || existing.type,
        value: value || existing.value,
        date: date ? new Date(date) : existing.date,
        goal: goal,
        notes: notes
      }
    });
    
    res.json(record);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

// Удалить запись
app.delete('/api/records/:id', auth, async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    await prisma.healthRecord.delete({
      where: { id: id }
    });
    
    res.json({ message: 'Удалено' });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

// Тестовый эндпоинт
app.get('/api/test', (req, res) => {
  res.json({ message: 'Сервер работает!' });
});

app.listen(port, () => {
  console.log('Сервер запущен на порту ' + port);
});
