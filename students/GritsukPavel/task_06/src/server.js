const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

const SECRET = process.env.JWT_SECRET || 'mysecret123';

const db = new Sequelize({
  dialect: 'sqlite',
  storage: 'diary.db',
  logging: false
});

const User = db.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: DataTypes.STRING
});

const Entry = db.define('Entry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  mood: DataTypes.STRING,
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

User.hasMany(Entry, { foreignKey: 'userId' });
Entry.belongsTo(User, { foreignKey: 'userId' });

db.sync();

function auth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) {
    return res.status(401).json({ error: 'Нет токена' });
  }
  const token = header.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Неверный формат токена' });
  }
  try {
    const data = jwt.verify(token, SECRET);
    req.userId = data.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Неверный токен' });
  }
}

app.post('/api/auth/signup', async (req, res) => {
  const { username, password, email } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Нужны username и password' });
  }

  const hash = await bcrypt.hash(password, 10);
  
  try {
    const user = await User.create({
      username: username,
      password: hash,
      email: email
    });
    
    res.json({ 
      message: 'Пользователь создан',
      userId: user.id 
    });
  } catch (e) {
    res.status(400).json({ error: 'Пользователь уже существует' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  const user = await User.findOne({ where: { username: username } });
  
  if (!user) {
    return res.status(401).json({ error: 'Неверные данные' });
  }
  
  const valid = await bcrypt.compare(password, user.password);
  
  if (!valid) {
    return res.status(401).json({ error: 'Неверные данные' });
  }
  
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '24h' });
  
  res.json({ 
    token: token,
    userId: user.id,
    username: user.username
  });
});

app.get('/api/entries', auth, async (req, res) => {
  const entries = await Entry.findAll({
    where: { userId: req.userId },
    order: [['createdAt', 'DESC']]
  });
  
  res.json(entries);
});

app.get('/api/entries/:id', auth, async (req, res) => {
  const id = req.params.id;
  const entry = await Entry.findOne({
    where: { id: id, userId: req.userId }
  });
  
  if (!entry) {
    return res.status(404).json({ error: 'Запись не найдена' });
  }
  
  res.json(entry);
});

app.post('/api/entries', auth, async (req, res) => {
  const { title, content, mood } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Нужны title и content' });
  }
  
  const entry = await Entry.create({
    title: title,
    content: content,
    mood: mood,
    userId: req.userId
  });
  
  res.json(entry);
});

app.put('/api/entries/:id', auth, async (req, res) => {
  const id = req.params.id;
  const { title, content, mood } = req.body;
  
  const entry = await Entry.findOne({
    where: { id: id, userId: req.userId }
  });
  
  if (!entry) {
    return res.status(404).json({ error: 'Запись не найдена' });
  }
  
  if (title) entry.title = title;
  if (content) entry.content = content;
  if (mood) entry.mood = mood;
  
  await entry.save();
  
  res.json(entry);
});

app.delete('/api/entries/:id', auth, async (req, res) => {
  const id = req.params.id;
  
  const entry = await Entry.findOne({
    where: { id: id, userId: req.userId }
  });
  
  if (!entry) {
    return res.status(404).json({ error: 'Запись не найдена' });
  }
  
  await entry.destroy();
  
  res.json({ message: 'Запись удалена' });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
