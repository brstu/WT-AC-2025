const { prisma } = require('../models');
const Helpers = require('../utils/helpers');

class AuthController {
  // Регистрация
  static async register(req, res) {
    try {
      const { email, username, password } = req.body;

      // Проверяем, существует ли пользователь
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Пользователь с таким email или именем уже существует'
        });
      }

      // Хешируем пароль
      const hashedPassword = await Helpers.hashPassword(password);

      // Создаем пользователя
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword
        },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true
        }
      });

      // Генерируем токен
      const token = Helpers.generateToken(user.id);

      res.status(201).json({
        success: true,
        data: {
          user,
          token
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при регистрации'
      });
    }
  }

  // Логин
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Ищем пользователя
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          password: true
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Неверный email или пароль'
        });
      }

      // Проверяем пароль
      const isValidPassword = await Helpers.comparePassword(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Неверный email или пароль'
        });
      }

      // Генерируем токен
      const token = Helpers.generateToken(user.id);

      // Убираем пароль из ответа
      delete user.password;

      res.json({
        success: true,
        data: {
          user,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при входе'
      });
    }
  }

  // Получение текущего пользователя
  static async getMe(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
          _count: {
            select: {
              words: true,
              notes: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении данных пользователя'
      });
    }
  }
}

module.exports = AuthController;