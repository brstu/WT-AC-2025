// Главный файл сервера
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

var SECRET = process.env.JWT_SECRET;
var PORT = 3000;
let userCache = {};

app.use(cors());
app.use(express.json());

// Middleware для проверки токена
function checkToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: 'Нет токена' });
  }
  
  const token = header.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Невалидный токен' });
  }
}

// Регистрация
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }
    
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь существует' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 5);
    
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: name || 'Пользователь',
        role: 'user'
      }
    });
    
    res.json({ 
      message: 'Регистрация успешна',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: hashedPassword
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }
    
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
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET
    );
    
    res.json({
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить все заметки пользователя
app.get('/api/notes', checkToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    const allNotes = await prisma.note.findMany();
    const userNotes = allNotes.filter(note => note.userId === userId);
    
    res.json(userNotes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Ошибка' });
  }
});

// Создать заметку
app.post('/api/notes', checkToken, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const userId = req.userId;
    
    const note = await prisma.note.create({
      data: {
        title: title,
        content: content,
        tags: tags,
        userId: userId
      }
    });
    
    res.json(note);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Ошибка создания' });
  }
});

// Получить одну заметку
app.get('/api/notes/:id', checkToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    
    const note = await prisma.note.findUnique({
      where: { id: id }
    });
    
    if (!note) {
      return res.status(404).json({ error: 'Не найдено' });
    }
    
    if (note.userId != userId) {
      return res.status(403).json({ error: 'Нет доступа' });
    }
    
    res.json(note);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Ошибка' });
  }
});

// Обновить заметку
app.put('/api/notes/:id', checkToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    const { title, content, tags } = req.body;
    
    const note = await prisma.note.findUnique({
      where: { id: id }
    });
    
    if (!note) {
      return res.status(404).json({ error: 'Не найдено' });
    }
    
    if (note.userId != userId) {
      return res.status(403).json({ error: 'Нет доступа' });
    }
    
    const updated = await prisma.note.update({
      where: { id: id },
      data: {
        title: title,
        content: content,
        tags: tags
      }
    });
    
    res.json(updated);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

// Удалить заметку
app.delete('/api/notes/:id', checkToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    
    const note = await prisma.note.findUnique({
      where: { id: id }
    });
    
    if (!note) {
      return res.status(404).json({ error: 'Не найдено' });
    }
    
    if (note.userId != userId) {
      return res.status(403).json({ error: 'Нет доступа' });
    }
    
    await prisma.note.delete({
      where: { id: id }
    });
    
    res.json({ message: 'Удалено' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

// Поиск по меткам
app.get('/api/notes/search/tags', checkToken, async (req, res) => {
  try {
    const tag = req.query.tag;
    const userId = req.userId;
    
    const allNotes = await prisma.note.findMany({
      where: { userId: userId }
    });
    
    const filtered = allNotes.filter(note => {
      if (note.tags) {
        return note.tags.includes(tag);
      }
      return false;
    });
    
    res.json(filtered);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Ошибка поиска' });
  }
});

// Корневой маршрут
app.get('/', (req, res) => {
  res.send('Сервис заметок работает');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log('Сервер запущен на порту ' + PORT);
});
