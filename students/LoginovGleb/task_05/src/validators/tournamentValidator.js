const { z } = require('zod');

/**
 * Схема валидации для создания турнира
 */
const createTournamentSchema = z.object({
  name: z.string()
    .min(1, 'Название турнира обязательно')
    .max(100, 'Название турнира не должно превышать 100 символов'),
  
  game: z.string()
    .min(1, 'Название игры обязательно')
    .max(50, 'Название игры не должно превышать 50 символов'),
  
  startDate: z.string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Дата начала должна быть в формате ISO 8601 (например, 2025-01-15T10:00:00Z)'
    }),
  
  endDate: z.string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Дата окончания должна быть в формате ISO 8601 (например, 2025-01-20T18:00:00Z)'
    }),
  
  prizePool: z.number()
    .min(0, 'Призовой фонд не может быть отрицательным')
    .optional()
    .default(0),
  
  maxTeams: z.number()
    .int('Максимальное количество команд должно быть целым числом')
    .min(2, 'Минимум 2 команды')
    .max(128, 'Максимум 128 команд')
    .optional()
    .default(16),
  
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled'])
    .optional()
    .default('upcoming'),
  
  description: z.string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional()
    .default('')
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'Дата окончания должна быть позже или равна дате начала',
  path: ['endDate']
});

/**
 * Схема валидации для обновления турнира
 */
const updateTournamentSchema = z.object({
  name: z.string()
    .min(1, 'Название турнира обязательно')
    .max(100, 'Название турнира не должно превышать 100 символов')
    .optional(),
  
  game: z.string()
    .min(1, 'Название игры обязательно')
    .max(50, 'Название игры не должно превышать 50 символов')
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
  
  prizePool: z.number()
    .min(0, 'Призовой фонд не может быть отрицательным')
    .optional(),
  
  maxTeams: z.number()
    .int('Максимальное количество команд должно быть целым числом')
    .min(2, 'Минимум 2 команды')
    .max(128, 'Максимум 128 команд')
    .optional(),
  
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled'])
    .optional(),
  
  description: z.string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Необходимо указать хотя бы одно поле для обновления'
}).refine(data => {
  // Если указаны обе даты, проверяем что endDate >= startDate
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: 'Дата окончания должна быть позже или равна дате начала',
  path: ['endDate']
});

/**
 * Схема валидации query параметров для списка турниров
 */
const getTournamentsQuerySchema = z.object({
  q: z.string().optional(),
  game: z.string().optional(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
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
  sortBy: z.enum(['name', 'startDate', 'endDate', 'prizePool', 'createdAt'])
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
