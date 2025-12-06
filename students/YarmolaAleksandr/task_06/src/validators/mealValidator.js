const Joi = require('joi');

/**
 * Create meal validation schema
 */
const createMealSchema = Joi.object({
  name: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Meal name cannot be empty',
    'string.max': 'Meal name must be less than 200 characters',
    'any.required': 'Meal name is required',
  }),
  description: Joi.string().max(1000).allow(null, '').messages({
    'string.max': 'Description must be less than 1000 characters',
  }),
  mealType: Joi.string()
    .valid('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK')
    .required()
    .messages({
      'any.only': 'Meal type must be one of: BREAKFAST, LUNCH, DINNER, SNACK',
      'any.required': 'Meal type is required',
    }),
  date: Joi.date().iso().required().messages({
    'date.base': 'Please provide a valid date',
    'any.required': 'Date is required',
  }),
  calories: Joi.number().integer().min(0).max(10000).required().messages({
    'number.base': 'Calories must be a number',
    'number.min': 'Calories cannot be negative',
    'number.max': 'Calories must be less than 10000',
    'any.required': 'Calories is required',
  }),
  protein: Joi.number().min(0).max(1000).default(0).messages({
    'number.min': 'Protein cannot be negative',
    'number.max': 'Protein must be less than 1000g',
  }),
  carbs: Joi.number().min(0).max(1000).default(0).messages({
    'number.min': 'Carbs cannot be negative',
    'number.max': 'Carbs must be less than 1000g',
  }),
  fat: Joi.number().min(0).max(1000).default(0).messages({
    'number.min': 'Fat cannot be negative',
    'number.max': 'Fat must be less than 1000g',
  }),
  notes: Joi.string().max(500).allow(null, '').messages({
    'string.max': 'Notes must be less than 500 characters',
  }),
  isPrivate: Joi.boolean().default(true),
});

/**
 * Update meal validation schema (all fields optional)
 */
const updateMealSchema = Joi.object({
  name: Joi.string().min(1).max(200).messages({
    'string.empty': 'Meal name cannot be empty',
    'string.max': 'Meal name must be less than 200 characters',
  }),
  description: Joi.string().max(1000).allow(null, '').messages({
    'string.max': 'Description must be less than 1000 characters',
  }),
  mealType: Joi.string()
    .valid('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK')
    .messages({
      'any.only': 'Meal type must be one of: BREAKFAST, LUNCH, DINNER, SNACK',
    }),
  date: Joi.date().iso().messages({
    'date.base': 'Please provide a valid date',
  }),
  calories: Joi.number().integer().min(0).max(10000).messages({
    'number.base': 'Calories must be a number',
    'number.min': 'Calories cannot be negative',
    'number.max': 'Calories must be less than 10000',
  }),
  protein: Joi.number().min(0).max(1000).messages({
    'number.min': 'Protein cannot be negative',
    'number.max': 'Protein must be less than 1000g',
  }),
  carbs: Joi.number().min(0).max(1000).messages({
    'number.min': 'Carbs cannot be negative',
    'number.max': 'Carbs must be less than 1000g',
  }),
  fat: Joi.number().min(0).max(1000).messages({
    'number.min': 'Fat cannot be negative',
    'number.max': 'Fat must be less than 1000g',
  }),
  notes: Joi.string().max(500).allow(null, '').messages({
    'string.max': 'Notes must be less than 500 characters',
  }),
  isPrivate: Joi.boolean(),
}).min(1);

/**
 * Query parameters validation
 */
const queryParamsSchema = Joi.object({
  mealType: Joi.string().valid('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  limit: Joi.number().integer().min(1).max(100).default(20),
  page: Joi.number().integer().min(1).default(1),
  sortBy: Joi.string().valid('date', 'calories', 'name', 'createdAt').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = {
  createMealSchema,
  updateMealSchema,
  queryParamsSchema,
};
