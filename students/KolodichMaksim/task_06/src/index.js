require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Безопасность
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100,
});
app.use(limiter);

// Middleware авторизации
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
};

// === Аутентификация ===
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    res.status(201).json({ message: 'Пользователь создан', userId: user.id });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email уже используется' });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.json({ token });
});

// === Альбомы ===
app.post('/api/albums', authenticate, async (req, res) => {
  const { title } = req.body;
  const album = await prisma.album.create({
    data: { title, ownerId: req.user.id },
  });
  res.status(201).json(album);
});

app.get('/api/albums', authenticate, async (req, res) => {
  const albums = await prisma.album.findMany({
    where: { ownerId: req.user.id },
    include: { photos: true },
  });
  res.json(albums);
});

app.get('/api/albums/:id', authenticate, async (req, res) => {
  const album = await prisma.album.findUnique({
    where: { id: Number(req.params.id) },
    include: { photos: true },
  });

  if (!album || album.ownerId !== req.user.id) {
    return res.status(404).json({ error: 'Альбом не найден или недоступен' });
  }

  res.json(album);
});

app.put('/api/albums/:id', authenticate, async (req, res) => {
  const { title } = req.body;
  const album = await prisma.album.update({
    where: { id: Number(req.params.id) },
    data: { title },
  });

  if (album.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }

  res.json(album);
});

app.delete('/api/albums/:id', authenticate, async (req, res) => {
  const album = await prisma.album.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!album || album.ownerId !== req.user.id) {
    return res.status(404).json({ error: 'Альбом не найден или недоступен' });
  }

  await prisma.album.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Альбом удалён' });
});

// === Фото ===
app.post('/api/albums/:albumId/photos', authenticate, async (req, res) => {
  const { url, description } = req.body;
  const albumId = Number(req.params.albumId);

  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album || album.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Доступ к альбому запрещён' });
  }

  const photo = await prisma.photo.create({
    data: { url, description, albumId },
  });

  res.status(201).json(photo);
});

app.delete('/api/photos/:id', authenticate, async (req, res) => {
  const photo = await prisma.photo.findUnique({
    where: { id: Number(req.params.id) },
    include: { album: true },
  });

  if (!photo || photo.album.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }

  await prisma.photo.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Фото удалено' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});