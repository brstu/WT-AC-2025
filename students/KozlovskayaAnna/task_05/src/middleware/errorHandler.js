// Кастомный класс ошибки API
export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = 'ApiError';
  }

  static badRequest(message, details = null) {
    return new ApiError(400, message, details);
  }

  static notFound(message = 'Ресурс не найден') {
    return new ApiError(404, message);
  }

  static unprocessableEntity(message, details = null) {
    return new ApiError(422, message, details);
  }
}

// Централизованный обработчик ошибок
export const errorHandler = (err, req, res, next) => {
  // Логируем ошибку в консоль для отладки
  console.error('Error:', err);

  // Если это наша кастомная ошибка
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      message: err.message,
      ...(err.details && { details: err.details })
    });
  }

  // Непредвиденные ошибки - не показываем стек-трейс
  res.status(500).json({
    message: 'Внутренняя ошибка сервера'
  });
};
