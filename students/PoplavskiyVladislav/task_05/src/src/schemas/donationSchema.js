const { z } = require('zod');

// Схема для создания пожертвования
const createDonationSchema = z.object({
  donorName: z.string()
    .min(2, 'Имя жертвователя должно содержать минимум 2 символа')
    .max(100, 'Имя жертвователя должно содержать максимум 100 символов'),
  amount: z.number()
    .positive('Сумма должна быть положительным числом')
    .min(1, 'Минимальная сумма пожертвования - 1')
    .max(1000000, 'Максимальная сумма пожертвования - 1,000,000'),
  currency: z.enum(['USD', 'EUR', 'RUB', 'UAH'], {
    errorMap: () => ({ message: 'Валюта должна быть USD, EUR, RUB или UAH' })
  }),
  projectId: z.string()
    .min(1, 'ID проекта обязателен')
    .max(50, 'ID проекта должен содержать максимум 50 символов'),
  message: z.string()
    .max(500, 'Сообщение должно содержать максимум 500 символов')
    .optional()
    .default(''),
  isAnonymous: z.boolean().default(false),
  donationDate: z.string()
    .datetime('Дата должна быть в формате ISO 8601')
    .optional()
    .default(new Date().toISOString())
});

// Схема для обновления пожертвования
const updateDonationSchema = z.object({
  donorName: z.string()
    .min(2, 'Имя жертвователя должно содержать минимум 2 символа')
    .max(100, 'Имя жертвователя должно содержать максимум 100 символов')
    .optional(),
  amount: z.number()
    .positive('Сумма должна быть положительным числом')
    .min(1, 'Минимальная сумма пожертвования - 1')
    .max(1000000, 'Максимальная сумма пожертвования - 1,000,000')
    .optional(),
  currency: z.enum(['USD', 'EUR', 'RUB', 'UAH'], {
    errorMap: () => ({ message: 'Валюта должна быть USD, EUR, RUB или UAH' })
  }).optional(),
  projectId: z.string()
    .min(1, 'ID проекта обязателен')
    .max(50, 'ID проекта должен содержать максимум 50 символов')
    .optional(),
  message: z.string()
    .max(500, 'Сообщение должно содержать максимум 500 символов')
    .optional(),
  isAnonymous: z.boolean().optional(),
  donationDate: z.string()
    .datetime('Дата должна быть в формате ISO 8601')
    .optional()
}).partial().refine(data => Object.keys(data).length > 0, {
  message: 'Для обновления необходимо передать хотя бы одно поле'
});

// Схема для запроса с пагинацией и фильтрацией
const querySchema = z.object({
  limit: z.string()
    .regex(/^\d+$/, 'Limit должен быть числом')
    .transform(Number)
    .refine(n => n >= 1 && n <= 100, 'Limit должен быть между 1 и 100')
    .optional()
    .default('10'),
  offset: z.string()
    .regex(/^\d+$/, 'Offset должен быть числом')
    .transform(Number)
    .refine(n => n >= 0, 'Offset должен быть неотрицательным')
    .optional()
    .default('0'),
  projectId: z.string().optional(),
  minAmount: z.string()
    .regex(/^\d+$/, 'MinAmount должен быть числом')
    .transform(Number)
    .optional(),
  maxAmount: z.string()
    .regex(/^\d+$/, 'MaxAmount должен быть числом')
    .transform(Number)
    .optional(),
  currency: z.enum(['USD', 'EUR', 'RUB', 'UAH']).optional(),
  sortBy: z.enum(['amount', 'donationDate', 'donorName']).optional().default('donationDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

module.exports = {
  createDonationSchema,
  updateDonationSchema,
  querySchema
};