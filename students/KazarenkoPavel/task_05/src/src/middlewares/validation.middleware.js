const { validate, createRecipeSchema, updateRecipeSchema, categorySchema, querySchema } = require('../utils/validators');

/**
 * Middleware для валидации создания рецепта
 */
const validateCreateRecipe = validate(createRecipeSchema);

/**
 * Middleware для валидации обновления рецепта
 */
const validateUpdateRecipe = validate(updateRecipeSchema);

/**
 * Middleware для валидации категории
 */
const validateCategory = validate(categorySchema);

/**
 * Middleware для валидации query параметров
 */
const validateQuery = validate(querySchema);

/**
 * Проверка ID (валидация MongoDB/ObjectId формата)
 */
const validateId = (req, res, next) => {
  const { id } = req.params;

  // Простая валидация ID (можно расширить для MongoDB ObjectId)
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Некорректный ID',
      statusCode: 400,
    });
  }

  // Проверка длины ID (минимальная логика)
  if (id.length < 1 || id.length > 100) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'ID должен быть от 1 до 100 символов',
      statusCode: 400,
    });
  }

  next();
};

module.exports = {
  validateCreateRecipe,
  validateUpdateRecipe,
  validateCategory,
  validateQuery,
  validateId,
};
