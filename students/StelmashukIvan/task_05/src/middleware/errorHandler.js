const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const status = err.status || 500;
  const body = { 
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    path: req.path
  };

  if (err.details) {
    body.details = err.details;
  }

  if (err.name === 'ValidationError') {
    body.message = 'Validation failed';
    body.details = err.details || err.errors;
  }

  if (err.status === 404) {
    body.message = 'Resource not found';
  }

  res.status(status).json(body);
};

module.exports = errorHandler;