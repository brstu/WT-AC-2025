const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Кастомная ошибка для ненайденного отзыва
  if (err.message === 'Review not found') {
    return res.status(404).json({ error: 'Review not found' });
  }

  // Ошибка валидации Zod
  if (err.name === 'ZodError') {
    return res.status(422).json({
      error: 'Validation failed',
      details: err.errors,
    });
  }

  // По умолчанию: 500 Internal Server Error
  res.status(500).json({ error: 'Something went wrong!' });
};

module.exports = errorHandler;