import { ZodError } from 'zod';
import { ApiError } from './errorHandler.js';

// Middleware для валидации с помощью Zod
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Валидируем тело запроса
      const validated = schema.parse(req.body);
      // Заменяем req.body на валидированные данные
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Форматируем ошибки Zod в понятный вид
        const details = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        throw ApiError.unprocessableEntity('Ошибка валидации данных', details);
      }
      next(error);
    }
  };
};
