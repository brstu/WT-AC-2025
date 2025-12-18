const Joi = require('joi');
const currentYear = new Date().getFullYear();

const createMediaSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 1 character long',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  year: Joi.number()
    .integer()
    .min(1900)
    .max(currentYear)
    .required()
    .messages({
      'number.base': 'Year must be a number',
      'number.min': `Year cannot be earlier than 1900`,
      'number.max': `Year cannot be later than ${currentYear}`,
      'any.required': 'Year is required'
    }),
  
  genre: Joi.array()
    .items(Joi.string().min(1))
    .min(1)
    .required()
    .messages({
      'array.base': 'Genre must be an array',
      'array.min': 'At least one genre is required',
      'any.required': 'Genre is required'
    }),
  
  type: Joi.string()
    .valid('movie', 'series')
    .required()
    .messages({
      'any.only': 'Type must be either "movie" or "series"',
      'any.required': 'Type is required'
    }),
  
  rating: Joi.number()
    .min(0)
    .max(10)
    .default(0)
    .messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating cannot be less than 0',
      'number.max': 'Rating cannot exceed 10'
    }),
  
  duration: Joi.when('type', {
    is: 'movie',
    then: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Duration must be a number',
        'number.positive': 'Duration must be positive',
        'any.required': 'Duration is required for movies'
      }),
    otherwise: Joi.number()
      .integer()
      .positive()
      .optional()
      .allow(null)
  }),
  
  seasons: Joi.when('type', {
    is: 'series',
    then: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Seasons must be a number',
        'number.positive': 'Seasons must be positive',
        'any.required': 'Seasons are required for series'
      }),
    otherwise: Joi.number()
      .integer()
      .positive()
      .optional()
      .allow(null)
  })
}).custom((value, helpers) => {
  // Дополнительная валидация: для movie не должно быть seasons, для series не должно быть duration
  if (value.type === 'movie' && value.seasons) {
    return helpers.error('any.invalid', {
      message: 'Movies cannot have seasons field'
    });
  }
  
  if (value.type === 'series' && value.duration) {
    return helpers.error('any.invalid', {
      message: 'Series cannot have duration field'
    });
  }
  
  return value;
});

const updateMediaSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .optional(),
  
  description: Joi.string()
    .max(1000)
    .optional()
    .allow(''),
  
  year: Joi.number()
    .integer()
    .min(1900)
    .max(currentYear)
    .optional(),
  
  genre: Joi.array()
    .items(Joi.string().min(1))
    .min(1)
    .optional(),
  
  type: Joi.string()
    .valid('movie', 'series')
    .optional(),
  
  rating: Joi.number()
    .min(0)
    .max(10)
    .optional(),
  
  duration: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  
  seasons: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const querySchema = Joi.object({
  q: Joi.string().optional(),
  genre: Joi.string().optional(),
  type: Joi.string().valid('movie', 'series').optional(),
  limit: Joi.number().integer().min(1).max(100).default(10),
  offset: Joi.number().integer().min(0).default(0)
});

module.exports = {
  createMediaSchema,
  updateMediaSchema,
  querySchema
};