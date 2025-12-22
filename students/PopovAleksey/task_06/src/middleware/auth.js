const jwt = require('jsonwebtoken');
const { User } = require('../models');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

async function auth(req, res, next) {
  const h = req.headers['authorization'];
  if (!h) return res.status(401).json({ error: 'Нет авторизации' });
  const parts = h.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Неверный формат' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ error: 'Пользователь не найден' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Токен неверен' });
  }
}

module.exports = auth;
