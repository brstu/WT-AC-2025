const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Middleware для проверки JWT токена
 */
const authenticate = async (req, res, next) => {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'fail',
        message: 'Токен не предоставлен. Используйте заголовок Authorization: Bearer <token>',
      });
    }

    const token = authHeader.substring(7); // Убираем "Bearer "

    // Верифицируем токен
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'fail',
          message: 'Токен истек. Пожалуйста, войдите заново',
        });
      }
      return res.status(401).json({
        status: 'fail',
        message: 'Недействительный токен',
      });
    }

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Пользователь не найден',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: 'fail',
        message: 'Аккаунт деактивирован',
      });
    }

    // Добавляем пользователя в объект запроса
    req.user = user;
    next();
  } catch (error) {
    // Логируем только в development режиме для отладки
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth middleware error:', error.message);
    }
    return res.status(500).json({
      status: 'error',
      message: 'Ошибка аутентификации',
    });
  }
};

/**
 * Middleware для проверки роли пользователя
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Необходима аутентификация',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Недостаточно прав для выполнения этого действия',
      });
    }

    next();
  };
};

/**
 * Middleware для проверки владельца ресурса
 */
const checkOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      // Админы имеют доступ ко всем ресурсам
      if (req.user.role === 'ADMIN') {
        return next();
      }

      const resourceId = req.params.id;

      if (resourceType === 'equipment') {
        const equipment = await prisma.equipment.findUnique({
          where: { id: resourceId },
        });

        if (!equipment) {
          return res.status(404).json({
            status: 'fail',
            message: 'Оборудование не найдено',
          });
        }

        if (equipment.ownerId !== req.user.id) {
          return res.status(403).json({
            status: 'fail',
            message: 'Доступ запрещен. Вы не являетесь владельцем этого ресурса',
          });
        }
      }

      next();
    } catch (error) {
      // Логируем только в development режиме для отладки
      if (process.env.NODE_ENV === 'development') {
        console.error('Ownership check error:', error.message);
      }
      return res.status(500).json({
        status: 'error',
        message: 'Ошибка проверки прав доступа',
      });
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  checkOwnership,
};
