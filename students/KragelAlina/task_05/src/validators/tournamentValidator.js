const { z } = require('zod');

const createTournamentSchema = z.object({
  name: z.string()
    .min(1, 'Название галереи обязательно')
    .max(100, 'Название галереи не должно превышать 100 символов'),
  
  artType: z.string()
    .min(1, 'Тип искусства обязателен')
    .max(50, 'Тип искусства не должен превышать 50 символов'),
  
  startDate: z.string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Дата начала должна быть в формате ISO 8601 (например, 2025-01-15T10:00:00Z)'
    }),
  
  endDate: z.string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Дата окончания должна быть в формате ISO 8601'
    }),
  
  likes: z.number()
    .min(0, 'Количество лайков не может быть отрицательным')
    .optional()
    .default(0),
  
  maxArts: z.number()
    .int('Максимальное количество артов должно быть целым числом')
    .min(2, 'Минимум 2 арта')
    .max(128, 'Максимум 128 артов')
    .optional()
    .default(16),
  
  category: z.enum(['modern', 'abstract', 'digital', 'classical'])
    .optional()
    .default('modern'),
  
  description: z.string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional()
    .default('')
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'Дата окончания должна быть не раньше даты начала',
  path: ['endDate']
});

const updateTournamentSchema = z.object({
  name: z.string()
    .min(1, 'Название галереи обязательно')
    .max(100, 'Название галереи не должно превышать 100 символов')
    .optional(),
  
  artType: z.string()
    .min(1, 'Тип искусства обязателен')
    .max(50, 'Тип искусства не должен превышать 50 символов')
    .optional(),
  
  startDate: z.string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Дата начала должна быть в формате ISO 8601'
    })
    .optional(),
  
  endDate: z.string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Дата окончания должна быть в формате ISO 8601'
    })
    .optional(),
  
  likes: z.number()
    .min(0, 'Количество лайков не может быть отрицательным')
    .optional(),
  
  maxArts: z.number()
    .int('Максимальное количество артов должно быть целым числом')
    .min(2, 'Минимум 2 арта')
    .max(128, 'Максимум 128 артов')
    .optional(),
  
  category: z.enum(['modern', 'abstract', 'digital', 'classical'])
    .optional(),
  
  description: z.string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Необходимо указать хотя бы одно поле для обновления'
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: 'Дата окончания должна быть не раньше даты начала',
  path: ['endDate']
});

const getTournamentsQuerySchema = z.object({
  q: z.string().optional(),
  artType: z.string().optional(),
  category: z.enum(['modern', 'abstract', 'digital', 'classical']).optional(),
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
  sortBy: z.enum(['name', 'startDate', 'endDate', 'likes', 'createdAt'])
    .optional()
    .default('createdAt'),
  order: z.enum(['asc', 'desc'])
    .optional()
    .default('desc')
});

module.exports = {
  createTournamentSchema,
  updateTournamentSchema,
  getTournamentsQuerySchema
};