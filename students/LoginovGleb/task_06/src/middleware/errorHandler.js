/**
 * Обработчик для несуществующих маршрутов (404)
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Маршрут ${req.originalUrl} не найден`,
  });
};

/**
 * Централизованный обработчик ошибок
 */
const errorHandler = (err, req, res, next) => {
  // Логирование ошибки
  console.error('Error:', err);

  // Определяем код статуса
  const statusCode = err.statusCode || 500;
  const status = statusCode >= 500 ? 'error' : 'fail';

  // Формируем ответ
  const response = {
    status,
    message: err.message || 'Внутренняя ошибка сервера',
  };

  // Добавляем стек ошибки в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Добавляем дополнительную информацию об ошибках валидации
  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
