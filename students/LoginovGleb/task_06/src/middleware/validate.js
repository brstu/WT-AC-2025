const { ValidationError } = require('./errors');

/**
 * Middleware для валидации тела запроса с использованием Zod
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(new ValidationError('Ошибка валидации данных', errors));
      }
      next(error);
    }
  };
};

/**
 * Middleware для валидации параметров запроса (query string)
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(new ValidationError('Ошибка валидации параметров', errors));
      }
      next(error);
    }
  };
};

/**
 * Middleware для валидации параметров пути (params)
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(new ValidationError('Ошибка валидации параметров пути', errors));
      }
      next(error);
    }
  };
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
};
