class HttpError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

class BadRequestError extends HttpError {
  constructor(message = 'Bad Request', details = null) {
    super(400, message, details);
    this.name = 'BadRequestError';
  }
}

class NotFoundError extends HttpError {
  constructor(message = 'Not Found', details = null) {
    super(404, message, details);
    this.name = 'NotFoundError';
  }
}

class ValidationError extends HttpError {
  constructor(message = 'Validation Error', details = null) {
    super(422, message, details);
    this.name = 'ValidationError';
  }
}

module.exports = {
  HttpError,
  BadRequestError,
  NotFoundError,
  ValidationError
};
