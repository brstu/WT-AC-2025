// src/middleware/errors.js

class AppError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    if (details) this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, 404, details);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation error', details = null) {
    super(message, 422, details);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request', details = null) {
    super(message, 400, details);
  }
}

export { AppError, NotFoundError, ValidationError, BadRequestError };
