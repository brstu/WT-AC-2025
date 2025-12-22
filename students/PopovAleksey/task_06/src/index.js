const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sequelize, User, Task } = require('./models');
const auth = require('./middleware/auth');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50kb' }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

app.get('/', (req, res) => res.json({ ok: true, msg: 'Events Hub API' }));

app.post('/api/auth/signup', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Нет данных' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash: hash });
    return res.json({ id: user.id, username: user.username });
  } catch (e) {
    return res.status(400).json({ error: 'Не удалось создать пользователя' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Нет данных' });
  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(400).json({ error: 'Неверные данные' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Неверные данные' });
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
  return res.json({ token });
});

app.get('/api/tasks', auth, async (req, res) => {
  const tasks = await Task.findAll({ where: { ownerId: req.user.id } });
  res.json(tasks);
});

app.post('/api/tasks', auth, async (req, res) => {
  const { title, description } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Нет заголовка' });
  const t = await Task.create({ title, description, ownerId: req.user.id });
  res.json(t);
});

app.get('/api/tasks/:id', auth, async (req, res) => {
  const t = await Task.findByPk(req.params.id);
  if (!t || t.ownerId !== req.user.id) return res.status(404).json({ error: 'Не найдено' });
  res.json(t);
});

app.put('/api/tasks/:id', auth, async (req, res) => {
  const t = await Task.findByPk(req.params.id);
  if (!t || t.ownerId !== req.user.id) return res.status(404).json({ error: 'Не найдено' });
  t.title = req.body.title || t.title;
  t.description = req.body.description || t.description;
  await t.save();
  res.json(t);
});

app.delete('/api/tasks/:id', auth, async (req, res) => {
  const t = await Task.findByPk(req.params.id);
  if (!t || t.ownerId !== req.user.id) return res.status(404).json({ error: 'Не найдено' });
  await t.destroy();
  res.json({ ok: true });
});

async function start() {
  await sequelize.sync();
  app.listen(PORT, () => console.log('Server started on port', PORT));
}

start();
