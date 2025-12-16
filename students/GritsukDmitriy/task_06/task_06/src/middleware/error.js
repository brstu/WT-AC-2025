const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Запись уже существует' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Запись не найдена' });
    }
  }

  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
};

module.exports = errorHandler;