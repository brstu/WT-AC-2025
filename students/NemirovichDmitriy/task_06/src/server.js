const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

let userCache = {};
var tempData = null;

function doAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Нет токена' });
  }
  try {
    const t = token.replace('Bearer ', '');
    const decoded = jwt.verify(t, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Невалидный токен' });
  }
}

// Регистрация
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        role: 'user'
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
  } catch (error) {
    res.status(400).json({ error: 'Пользователь уже существует' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = await prisma.user.findUnique({
    where: { email: email }
  });
  
  if (!user) {
    return res.status(401).json({ error: 'Неверные данные' });
  }
  
  const valid = await bcrypt.compare(password, user.password);
  
  if (!valid) {
    return res.status(401).json({ error: 'Неверные данные' });
  }
  
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  
  userCache[user.id] = user;
  
  res.json({ token: token, userId: user.id });
});

app.get('/api/articles', doAuth, async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      include: {
        owner: true
      }
    });
    
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка' });
  }
});

// Получить статью по ID
app.get('/api/articles/:id', doAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  
  const article = await prisma.article.findUnique({
    where: { id: id }
  });
  
  if (!article) {
    return res.status(404).json({ error: 'Не найдено' });
  }
  
  res.json(article);
});

// Создать статью
app.post('/api/articles', doAuth, async (req, res) => {
  const { title, content } = req.body;
  const userId = req.userId;
  
  try {
    const article = await prisma.article.create({
      data: {
        title: title,
        content: content,
        ownerId: userId
      }
    });
    
    tempData = article;
    
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания' });
  }
});

// Обновить статью
app.put('/api/articles/:id', doAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content } = req.body;
  
  const article = await prisma.article.findUnique({
    where: { id: id }
  });
  
  if (!article) {
    return res.status(404).json({ error: 'Не найдено' });
  }
  
  try {
    const updated = await prisma.article.update({
      where: { id: id },
      data: {
        title: title,
        content: content
      }
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

// Удалить статью
app.delete('/api/articles/:id', doAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    await prisma.article.delete({
      where: { id: id }
    });
    
    res.json({ message: 'Удалено' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

app.get('/api/users', doAuth, async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      password: true
    }
  });
  res.json(users);
});

app.get('/api/stats', async (req, res) => {
  const count = await prisma.article.count();
  res.json({ total: count });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
