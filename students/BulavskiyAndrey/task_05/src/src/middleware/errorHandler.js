class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ZodError') {
    return res.status(422).json({
      message: 'Validation failed',
      details: err.errors
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      message: err.message,
      details: err.details
    });
  }

  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
module.exports.ApiError = ApiError;