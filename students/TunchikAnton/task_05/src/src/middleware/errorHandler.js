const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Handle Zod errors
  if (err.name === 'ZodError') {
    return res.status(422).json({
      status: 'error',
      statusCode: 422,
      message: 'Validation error',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      })),
      timestamp: new Date().toISOString()
    });
  }
  if (err.status === 404) {
    return res.status(404).json({
      status: 'error',
      statusCode: 404,
      message: 'Resource not found',
      timestamp: new Date().toISOString()
    });
  }
  res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;