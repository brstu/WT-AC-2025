const Joi = require('joi');

/**
 * Create task validation schema
 */
const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Task title cannot be empty',
    'string.max': 'Task title must be less than 200 characters',
    'any.required': 'Task title is required',
  }),
  description: Joi.string().max(1000).allow(null, '').messages({
    'string.max': 'Description must be less than 1000 characters',
  }),
  completed: Joi.boolean().default(false),
  isPrivate: Joi.boolean().default(true),
});

/**
 * Update task validation schema (all fields optional)
 */
const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).messages({
    'string.empty': 'Task title cannot be empty',
    'string.max': 'Task title must be less than 200 characters',
  }),
  description: Joi.string().max(1000).allow(null, '').messages({
    'string.max': 'Description must be less than 1000 characters',
  }),
  completed: Joi.boolean(),
  isPrivate: Joi.boolean(),
}).min(1);

/**
 * Query parameters validation
 */
const queryParamsSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  page: Joi.number().integer().min(1).default(1),
  sortBy: Joi.string()
    .valid('title', 'completed', 'createdAt') // ← ВАЖНО
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  queryParamsSchema,
};
