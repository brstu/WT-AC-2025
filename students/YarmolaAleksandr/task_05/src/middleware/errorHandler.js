const { AppError } = require('../utils/errors');

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 409);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
    error = new AppError('Validation Error', 422);
    error.details = details;
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    const details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code
    }));
    error = new AppError('Validation Error', 422);
    error.details = details;
  }

  // JSON parsing error
  if (err.type === 'entity.parse.failed') {
    error = new AppError('Invalid JSON format', 400);
  }

  // Default to 500 server error
  if (!error.statusCode) {
    error = new AppError('Internal Server Error', 500);
  }

  const response = {
    success: false,
    error: error.message
  };

  // Add details for validation errors
  if (error.details) {
    response.details = error.details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && error.statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(error.statusCode || 500).json(response);
};

/**
 * Async Error Wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };