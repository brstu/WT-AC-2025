const AppError = require('../utils/AppError');
const { ZodError } = require('zod');

function sendErrorDev(err, res) {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message,
    stack: err.stack,
    ...(err.details ? { details: err.details } : {})
  });
}

function sendErrorProd(err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.details ? { details: err.details } : {})
    });
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err instanceof ZodError) {
    const details = err.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message
    }));
    err = new AppError('Validation error', 422);
    err.details = details;
  }

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};
