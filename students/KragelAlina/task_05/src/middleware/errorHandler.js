const { ApiError } = require('./errors');

const notFoundHandler = (req, res, next) => {
  const error = new ApiError(`Маршрут ${req.originalUrl} не найден`, 404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Внутренняя ошибка сервера';
  let errors = err.errors || [];

  if (err.name === 'ZodError') {
    statusCode = 422;
    message = 'Ошибка валидации данных';
    errors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Некорректный JSON в теле запроса';
  }

  const response = {
    status: statusCode >= 500 ? 'error' : 'fail',
    message
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler
};