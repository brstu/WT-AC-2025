const config = require('../config');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Логирование ошибки
  logger.error({
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Отправка ответа
  if (config.nodeEnv === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // В production не показываем стектрейс
    res.status(err.statusCode).json({
      status: err.status,
      message: err.isOperational ? err.message : 'Внутренняя ошибка сервера'
    });
  }
};

module.exports = errorHandler;