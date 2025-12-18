const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Development mode: полная информация
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR 💥:', err);
    
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  }
  
  // Production mode: только нужная информация
  // Joi validation error
  if (err.message === 'Validation Error') {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      details: err.details || []
    });
  }
  
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  
  // Programming or other unknown error: don't leak error details
  console.error('ERROR 💥:', err);
  
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
};

module.exports = errorHandler;