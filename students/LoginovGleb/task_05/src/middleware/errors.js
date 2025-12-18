/**
 * Базовый класс для кастомных ошибок API
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Ошибка 400 - Некорректный запрос
 */
class BadRequestError extends ApiError {
  constructor(message = 'Некорректный запрос') {
    super(message, 400);
  }
}

/**
 * Ошибка 404 - Ресурс не найден
 */
class NotFoundError extends ApiError {
  constructor(message = 'Ресурс не найден') {
    super(message, 404);
  }
}

/**
 * Ошибка 422 - Ошибка валидации
 */
class ValidationError extends ApiError {
  constructor(message = 'Ошибка валидации', errors = []) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * Ошибка 500 - Внутренняя ошибка сервера
 */
class InternalServerError extends ApiError {
  constructor(message = 'Внутренняя ошибка сервера') {
    super(message, 500);
  }
}

/**
 * Ошибка 409 - Конфликт
 */
class ConflictError extends ApiError {
  constructor(message = 'Конфликт данных') {
    super(message, 409);
  }
}

module.exports = {
  ApiError,
  BadRequestError,
  NotFoundError,
  ValidationError,
  InternalServerError,
  ConflictError
};
