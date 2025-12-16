const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

const prisma = new PrismaClient();

const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Проверка существующего пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await hashPassword(password);

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Генерация токенов
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Убираем пароль из ответа
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'Регистрация успешна',
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Проверка пароля
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Генерация токенов
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Убираем пароль из ответа
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Вход выполнен успешно',
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Refresh token отсутствует' });
    }

    // Валидация refresh токена
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET;

    const payload = jwt.verify(token, JWT_SECRET);

    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    // Генерация нового access токена
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Ошибка обновления токена:', error);
    res.status(401).json({ error: 'Неверный refresh token' });
  }
};

module.exports = {
  signup,
  login,
  refreshToken,
};