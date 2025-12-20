/**
 * Базовый класс для кастомных ошибок API
 */
class ApiError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Ошибка валидации (400)
 */
class ValidationError extends ApiError {
  constructor(message = 'Ошибка валидации данных', errors = null) {
    super(message, 400, errors);
  }
}

/**
 * Ошибка "Не найдено" (404)
 */
class NotFoundError extends ApiError {
  constructor(resource = 'Ресурс') {
    super(`${resource} не найден`, 404);
  }
}

/**
 * Ошибка конфликта (409)
 */
class ConflictError extends ApiError {
  constructor(message = 'Конфликт данных') {
    super(message, 409);
  }
}

/**
 * Ошибка авторизации (401)
 */
class UnauthorizedError extends ApiError {
  constructor(message = 'Требуется авторизация') {
    super(message, 401);
  }
}

/**
 * Ошибка доступа (403)
 */
class ForbiddenError extends ApiError {
  constructor(message = 'Доступ запрещен') {
    super(message, 403);
  }
}

/**
 * Внутренняя ошибка сервера (500)
 */
class InternalServerError extends ApiError {
  constructor(message = 'Внутренняя ошибка сервера') {
    super(message, 500);
  }
}

module.exports = {
  ApiError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
};
