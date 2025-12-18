const { z } = require('zod');

const createTeamSchema = z.object({
  name: z.string()
    .min(1, 'Название арта обязательно')
    .max(100, 'Название арта не должно превышать 100 символов'),
  
  style: z.string()
    .min(2, 'Стиль (тег) должен содержать минимум 2 символа')
    .max(10, 'Стиль (тег) не должен превышать 10 символов')
    .regex(/^[A-Za-z0-9]+$/, 'Стиль может содержать только буквы и цифры'),
  
  origin: z.string()
    .min(2, 'Происхождение (страна) должно содержать минимум 2 символа')
    .max(50, 'Происхождение не должно превышать 50 символов'),
  
  artType: z.string()
    .min(1, 'Тип арта обязателен')
    .max(50, 'Тип арта не должен превышать 50 символов'),
  
  createdYear: z.string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Год создания должен быть в формате ISO 8601 (например, 2020-01-15)'
    })
    .optional(),
  
  imageUrl: z.union([
    z.string().url('Некорректный URL изображения'),
    z.literal('')
  ])
    .optional()
    .default(''),
  
  likes: z.number()
    .min(0, 'Количество лайков не может быть отрицательным')
    .max(1000000, 'Количество лайков не может превышать 1000000')
    .optional()
    .default(0),
  
  isFeatured: z.boolean()
    .optional()
    .default(true),
  
  description: z.string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional()
    .default('')
});

const updateTeamSchema = z.object({
  name: z.string()
    .min(1, 'Название арта обязательно')
    .max(100, 'Название арта не должно превышать 100 символов')
    .optional(),
  
  style: z.string()
    .min(2, 'Стиль (тег) должен содержать минимум 2 символа')
    .max(10, 'Стиль (тег) не должен превышать 10 символов')
    .regex(/^[A-Za-z0-9]+$/, 'Стиль может содержать только буквы и цифры')
    .optional(),
  
  origin: z.string()
    .min(2, 'Происхождение (страна) должно содержать минимум 2 символа')
    .max(50, 'Происхождение не должно превышать 50 символов')
    .optional(),
  
  artType: z.string()
    .min(1, 'Тип арта обязателен')
    .max(50, 'Тип арта не должен превышать 50 символов')
    .optional(),
  
  createdYear: z.string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Год создания должен быть в формате ISO 8601'
    })
    .optional(),
  
  imageUrl: z.union([
    z.string().url('Некорректный URL изображения'),
    z.literal('')
  ]).optional(),
  
  likes: z.number()
    .min(0, 'Количество лайков не может быть отрицательным')
    .max(1000000, 'Количество лайков не может превышать 1000000')
    .optional(),
  
  isFeatured: z.boolean()
    .optional(),
  
  description: z.string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Необходимо указать хотя бы одно поле для обновления'
});

const getTeamsQuerySchema = z.object({
  q: z.string().optional(),
  artType: z.string().optional(),
  origin: z.string().optional(),
  isFeatured: z.string()
    .refine(val => val === 'true' || val === 'false', {
      message: 'isFeatured должен быть true или false'
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
  sortBy: z.enum(['name', 'likes', 'createdYear', 'createdAt'])
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