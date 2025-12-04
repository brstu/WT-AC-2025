const { Prisma } = require('@prisma/client');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          message: 'Конфликт: запись уже существует',
          details: `Поле ${err.meta?.target?.join(', ')} должно быть уникальным`,
          code: 'UNIQUE_CONSTRAINT_VIOLATION'
        });
      case 'P2025':
        return res.status(404).json({
          message: 'Запись не найдена',
          code: 'RECORD_NOT_FOUND'
        });
      case 'P2003':
        return res.status(400).json({
          message: 'Ошибка внешнего ключа',
          details: 'Связанная запись не существует',
          code: 'FOREIGN_KEY_CONSTRAINT'
        });
      default:
        return res.status(400).json({
          message: 'Ошибка базы данных',
          code: err.code
        });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      message: 'Ошибка валидации данных',
      details: 'Проверьте правильность передаваемых данных',
      code: 'VALIDATION_ERROR'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Невалидный токен',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Токен истек',
      code: 'TOKEN_EXPIRED'
    });
  }

  const status = err.status || 500;
  const body = { 
    message: err.message || 'Внутренняя ошибка сервера',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    path: req.path
  };

  if (err.details) {
    body.details = err.details;
  }

  if (err.status === 422) {
    body.code = 'VALIDATION_ERROR';
  }

  if (err.status === 404) {
    body.code = 'NOT_FOUND';
  }

  if (process.env.NODE_ENV === 'production' && status === 500) {
    body.message = 'Внутренняя ошибка сервера';
    delete body.details;
  }

  res.status(status).json(body);
};

module.exports = errorHandler;