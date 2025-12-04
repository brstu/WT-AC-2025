const { ValidationError } = require('./errors');

/**
 * Middleware для валидации body запроса
 * @param {import('zod').ZodSchema} schema - Zod схема для валидации
 */
const validateBody = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware для валидации query параметров
 * @param {import('zod').ZodSchema} schema - Zod схема для валидации
 */
const validateQuery = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse(req.query);
    req.query = validated;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware для валидации params
 * @param {import('zod').ZodSchema} schema - Zod схема для валидации
 */
const validateParams = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse(req.params);
    req.params = validated;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams
};
