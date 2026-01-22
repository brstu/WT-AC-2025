/**
 * Базовый класс для кастомных ошибок
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? 'error' : 'fail';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Ошибка валидации (422)
 */
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * Ошибка "Не найдено" (404)
 */
class NotFoundError extends AppError {
  constructor(message = 'Ресурс не найден') {
    super(message, 404);
  }
}

/**
 * Ошибка авторизации (401)
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Необходима аутентификация') {
    super(message, 401);
  }
}

/**
 * Ошибка доступа (403)
 */
class ForbiddenError extends AppError {
  constructor(message = 'Доступ запрещен') {
    super(message, 403);
  }
}

/**
 * Ошибка конфликта (409)
 */
class ConflictError extends AppError {
  constructor(message = 'Конфликт данных') {
    super(message, 409);
  }
}

/**
 * Ошибка неверного запроса (400)
 */
class BadRequestError extends AppError {
  constructor(message = 'Неверный запрос') {
    super(message, 400);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
};
