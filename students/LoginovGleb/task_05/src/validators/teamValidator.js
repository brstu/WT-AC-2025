const { z } = require('zod');

/**
 * Схема валидации для создания команды
 */
const createTeamSchema = z.object({
  name: z.string()
    .min(1, 'Название команды обязательно')
    .max(100, 'Название команды не должно превышать 100 символов'),
  
  tag: z.string()
    .min(2, 'Тег команды должен содержать минимум 2 символа')
    .max(10, 'Тег команды не должен превышать 10 символов')
    .regex(/^[A-Za-z0-9]+$/, 'Тег может содержать только буквы и цифры'),
  
  country: z.string()
    .min(2, 'Код страны должен содержать минимум 2 символа')
    .max(50, 'Название страны не должно превышать 50 символов'),
  
  game: z.string()
    .min(1, 'Название игры обязательно')
    .max(50, 'Название игры не должно превышать 50 символов'),
  
  foundedDate: z.string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Дата основания должна быть в формате ISO 8601 (например, 2020-01-15)'
    })
    .optional(),
  
  logoUrl: z.union([
    z.string().url('Некорректный URL логотипа'),
    z.literal('')
  ])
    .optional()
    .default(''),
  
  rating: z.number()
    .min(0, 'Рейтинг не может быть отрицательным')
    .max(10000, 'Рейтинг не может превышать 10000')
    .optional()
    .default(1000),
  
  isActive: z.boolean()
    .optional()
    .default(true),
  
  description: z.string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional()
    .default('')
});

/**
 * Схема валидации для обновления команды
 */
const updateTeamSchema = z.object({
  name: z.string()
    .min(1, 'Название команды обязательно')
    .max(100, 'Название команды не должно превышать 100 символов')
    .optional(),
  
  tag: z.string()
    .min(2, 'Тег команды должен содержать минимум 2 символа')
    .max(10, 'Тег команды не должен превышать 10 символов')
    .regex(/^[A-Za-z0-9]+$/, 'Тег может содержать только буквы и цифры')
    .optional(),
  
  country: z.string()
    .min(2, 'Код страны должен содержать минимум 2 символа')
    .max(50, 'Название страны не должно превышать 50 символов')
    .optional(),
  
  game: z.string()
    .min(1, 'Название игры обязательно')
    .max(50, 'Название игры не должно превышать 50 символов')
    .optional(),
  
  foundedDate: z.string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Дата основания должна быть в формате ISO 8601'
    })
    .optional(),
  
  logoUrl: z.union([
    z.string().url('Некорректный URL логотипа'),
    z.literal('')
  ]).optional(),
  
  rating: z.number()
    .min(0, 'Рейтинг не может быть отрицательным')
    .max(10000, 'Рейтинг не может превышать 10000')
    .optional(),
  
  isActive: z.boolean()
    .optional(),
  
  description: z.string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Необходимо указать хотя бы одно поле для обновления'
});

/**
 * Схема валидации query параметров для списка команд
 */
const getTeamsQuerySchema = z.object({
  q: z.string().optional(),
  game: z.string().optional(),
  country: z.string().optional(),
  isActive: z.string()
    .refine(val => val === 'true' || val === 'false', {
      message: 'isActive должен быть true или false'
    })
    .transform(val => val === 'true')
    .optional(),
  limit: z.string()
    .transform(val => parseInt(val, 10))
    .refine(val => !isNaN(val) && val >= 1 && val <= 100, {
      message: 'limit должен быть числом от 1 до 100'
    })
    .optional()
    .default('10'),
  offset: z.string()
    .transform(val => parseInt(val, 10))
    .refine(val => !isNaN(val) && val >= 0, {
      message: 'offset должен быть неотрицательным числом'
    })
    .optional()
    .default('0'),
  sortBy: z.enum(['name', 'rating', 'foundedDate', 'createdAt'])
    .optional()
    .default('createdAt'),
  order: z.enum(['asc', 'desc'])
    .optional()
    .default('desc')
});

module.exports = {
  createTeamSchema,
  updateTeamSchema,
  getTeamsQuerySchema
};
