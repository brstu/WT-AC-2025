class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation Error') {
    super(message, 422);
  }
}

const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = process.env.NODE_ENV === 'production' ? undefined : err.stack;

  console.error(err);

  res.status(status).json({
    error: message,
    details,
  });
};

module.exports = { errorHandler, NotFoundError, ValidationError, AppError };
