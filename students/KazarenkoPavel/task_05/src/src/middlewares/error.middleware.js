const config = require('../config/config');
const { ApiError } = require('../utils/errors');

/**
 * Централизованный обработчик ошибок
 */
const errorHandler = (err, req, res, next) => {
  // Логирование ошибки
  logError(err, req);

  // Если ошибка - наш кастомный ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: getErrorName(err.statusCode),
      message: err.message,
      statusCode: err.statusCode,
      errors: err.errors || null,
      ...(config.isDevelopment && { stack: err.stack }),
    });
  }

  // Если ошибка валидации Zod
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Ошибка валидации данных',
      statusCode: 400,
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Если ошибка синтаксиса JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Некорректный JSON',
      statusCode: 400,
    });
  }

  // Для ошибки 404 из маршрутизатора Express
  if (err.status === 404) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Ресурс не найден',
      statusCode: 404,
    });
  }

  // Дефолтная ошибка сервера
  const statusCode = err.statusCode || 500;
  const message = config.isProduction && statusCode === 500
    ? 'Внутренняя ошибка сервера'
    : err.message || 'Что-то пошло не так';

  res.status(statusCode).json({
    error: getErrorName(statusCode),
    message,
    statusCode,
    ...(config.isDevelopment && { stack: err.stack }),
  });
};

/**
 * Логирование ошибок
 */
const logError = (err, req) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...(err.statusCode && { statusCode: err.statusCode }),
      ...(err.errors && { errors: err.errors }),
    },
  };

  if (config.isDevelopment) {
    console.error('❌ Ошибка:', logData);
  } else {
    console.error('❌ Ошибка:', {
      timestamp: logData.timestamp,
      method: logData.method,
      url: logData.url,
      statusCode: err.statusCode || 500,
      message: err.message,
    });
  }
};

/**
 * Получение читаемого имени ошибки по статус-коду
 */
const getErrorName = (statusCode) => {
  const errorNames = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    503: 'Service Unavailable',
  };

  return errorNames[statusCode] || 'Error';
};

module.exports = errorHandler;
