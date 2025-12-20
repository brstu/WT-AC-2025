const { z } = require('zod');
const config = require('../config/config');

/**
 * Схема валидации для ингредиента
 */
const ingredientSchema = z.object({
  name: z.string()
    .min(1, 'Название ингредиента обязательно')
    .max(100, 'Название ингредиента не должно превышать 100 символов'),
  amount: z.string()
    .min(1, 'Количество ингредиента обязательно')
    .max(50, 'Количество не должно превышать 50 символов'),
  unit: z.string()
    .max(20, 'Единица измерения не должна превышать 20 символов')
    .optional(),
});

/**
 * Схема валидации для рецепта (создание)
 */
const createRecipeSchema = z.object({
  title: z.string()
    .min(1, 'Название рецепта обязательно')
    .max(config.validation.maxTitleLength, `Название не должно превышать ${config.validation.maxTitleLength} символов`),

  description: z.string()
    .min(1, 'Описание рецепта обязательно')
    .max(config.validation.maxDescriptionLength, `Описание не должно превышать ${config.validation.maxDescriptionLength} символов`),

  category: z.string()
    .min(1, 'Категория обязательна')
    .max(50, 'Категория не должна превышать 50 символов'),

  difficulty: z.enum(['легко', 'средне', 'сложно'], {
    errorMap: () => ({ message: 'Сложность должна быть: легко, средне или сложно' }),
  }).default('средне'),

  time: z.number()
    .int('Время должно быть целым числом')
    .positive('Время должно быть положительным числом')
    .max(1440, 'Время не должно превышать 1440 минут (24 часа)')
    .default(30),

  servings: z.number()
    .int('Количество порций должно быть целым числом')
    .positive('Количество порций должно быть положительным числом')
    .max(100, 'Количество порций не должно превышать 100')
    .default(2),

  image: z.string()
    .url('URL изображения должен быть корректным')
    .optional()
    .or(z.literal('')),

  ingredients: z.array(ingredientSchema)
    .min(1, 'Добавьте хотя бы один ингредиент')
    .max(config.validation.maxIngredients, `Не более ${config.validation.maxIngredients} ингредиентов`),

  steps: z.array(
    z.string()
      .min(5, 'Шаг приготовления должен содержать минимум 5 символов')
      .max(500, 'Шаг приготовления не должен превышать 500 символов')
  )
    .min(1, 'Добавьте хотя бы один шаг приготовления')
    .max(config.validation.maxSteps, `Не более ${config.validation.maxSteps} шагов`),

  notes: z.string()
    .max(1000, 'Примечания не должны превышать 1000 символов')
    .optional()
    .or(z.literal('')),

  tags: z.array(z.string().max(50))
    .max(10, 'Не более 10 тегов')
    .optional()
    .default([]),
}).strict();

/**
 * Схема валидации для рецепта (обновление)
 */
const updateRecipeSchema = createRecipeSchema.partial();

/**
 * Схема валидации для категории
 */
const categorySchema = z.object({
  name: z.string()
    .min(1, 'Название категории обязательно')
    .max(50, 'Название категории не должно превышать 50 символов'),
  description: z.string()
    .max(200, 'Описание категории не должно превышать 200 символов')
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Цвет должен быть в формате HEX (#RRGGBB)')
    .optional(),
}).strict();

/**
 * Схема валидации для пагинации и фильтрации
 */
const querySchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Номер страницы должен быть числом')
    .transform(Number)
    .optional()
    .default('1'),

  limit: z.string()
    .regex(/^\d+$/, 'Лимит должен быть числом')
    .transform(Number)
    .refine(val => val <= config.pagination.maxLimit, {
      message: `Лимит не должен превышать ${config.pagination.maxLimit}`,
    })
    .optional()
    .default(config.pagination.defaultLimit.toString()),

  search: z.string()
    .max(100, 'Поисковый запрос не должен превышать 100 символов')
    .optional(),

  category: z.string()
    .max(50, 'Категория не должна превышать 50 символов')
    .optional(),

  difficulty: z.enum(['легко', 'средне', 'сложно'])
    .optional(),

  minTime: z.string()
    .regex(/^\d+$/, 'Минимальное время должно быть числом')
    .transform(Number)
    .optional(),

  maxTime: z.string()
    .regex(/^\d+$/, 'Максимальное время должно быть числом')
    .transform(Number)
    .optional(),

  sortBy: z.enum(['title', 'time', 'difficulty', 'createdAt', 'updatedAt'])
    .optional()
    .default('createdAt'),

  sortOrder: z.enum(['asc', 'desc'])
    .optional()
    .default('desc'),
}).strict();

/**
 * Валидация данных с обработкой ошибок
 */
const validate = (schema) => (req, res, next) => {
  try {
    // Валидация в зависимости от типа запроса
    if (req.method === 'GET') {
      req.query = schema.parse(req.query);
    } else {
      req.body = schema.parse(req.body);
    }
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      next(new ValidationError('Ошибка валидации данных', errors));
    } else {
      next(error);
    }
  }
};

module.exports = {
  createRecipeSchema,
  updateRecipeSchema,
  categorySchema,
  querySchema,
  validate,
};
