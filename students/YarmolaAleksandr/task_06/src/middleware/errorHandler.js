const { AppError } = require('../utils/errors');

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Prisma errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    error = new AppError(`${field} already exists`, 409);
  }

  if (err.code === 'P2025') {
    error = new AppError('Resource not found', 404);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }

  // Validation errors (Joi)
  if (err.name === 'ValidationError' || err.isJoi) {
    const details = err.details?.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    error = new AppError('Validation Error', 422);
    error.details = details;
  }

  // JSON parsing error
  if (err.type === 'entity.parse.failed') {
    error = new AppError('Invalid JSON format', 400);
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  const response = {
    success: false,
    error: {
      statusCode: statusCode,
      message: message,
    },
  };

  // Add details for validation errors
  if (error.details) {
    response.error.details = error.details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Async Error Wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
