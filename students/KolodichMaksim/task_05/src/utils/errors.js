class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation error', details) {
    super(422, message);
    this.details = details;
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(400, message);
  }
}

module.exports = { AppError, NotFoundError, ValidationError, BadRequestError };