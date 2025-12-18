const { ValidationError } = require('../utils/errors');

module.exports = (err, req, res, next) => {
  console.error(err); // лог в консоль, в проде — в логгер

  if (err instanceof ValidationError) {
    return res.status(err.status).json({
      error: err.message,
      details: err.details,
    });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;

  res.status(status).json({ error: message });
};