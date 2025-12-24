const Helpers = require('../utils/helpers');

const authMiddleware = async (req, res, next) => {
  try {
    // Получаем токен из заголовка
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Требуется авторизация'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Верифицируем токен
    const decoded = Helpers.verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Недействительный токен'
      });
    }

    // Получаем пользователя из БД
    const { prisma } = require('../models');
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, username: true }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Добавляем пользователя в запрос
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

module.exports = authMiddleware;