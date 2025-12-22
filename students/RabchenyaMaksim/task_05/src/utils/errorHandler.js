const AppError = require('./AppError');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    const messages = err.errors.map(e => e.message).join(', ');
    return res.status(422).json({ error: messages });
  }

  // Default
  res.status(500).json({ error: 'Internal Server Error' });
};

module.exports = errorHandler;