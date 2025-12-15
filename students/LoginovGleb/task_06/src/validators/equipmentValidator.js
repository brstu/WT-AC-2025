const { z } = require('zod');

const equipmentTypes = [
  'COMPUTER',
  'LAPTOP',
  'MONITOR',
  'PRINTER',
  'SCANNER',
  'NETWORK',
  'PHONE',
  'SERVER',
  'STORAGE',
  'OTHER',
];

const equipmentStatuses = ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'BROKEN'];

/**
 * Схема валидации для создания оборудования
 */
const createEquipmentSchema = z.object({
  name: z
    .string({ required_error: 'Название обязательно' })
    .min(1, 'Название не может быть пустым')
    .max(100, 'Название не может быть длиннее 100 символов'),
  type: z.enum(equipmentTypes, {
    required_error: 'Тип обязателен',
    invalid_type_error: `Тип должен быть одним из: ${equipmentTypes.join(', ')}`,
  }),
  serialNumber: z
    .string({ required_error: 'Серийный номер обязателен' })
    .min(1, 'Серийный номер не может быть пустым')
    .max(50, 'Серийный номер не может быть длиннее 50 символов'),
  manufacturer: z
    .string({ required_error: 'Производитель обязателен' })
    .min(1, 'Производитель не может быть пустым')
    .max(50, 'Производитель не может быть длиннее 50 символов'),
  model: z
    .string({ required_error: 'Модель обязательна' })
    .min(1, 'Модель не может быть пустой')
    .max(50, 'Модель не может быть длиннее 50 символов'),
  purchaseDate: z
    .string({ required_error: 'Дата покупки обязательна' })
    .datetime('Неверный формат даты. Используйте ISO 8601')
    // Принимаем datetime для совместимости с БД, хотя время обычно не важно
    .transform(val => new Date(val).toISOString()),
  warrantyEnd: z
    .string()
    .datetime('Неверный формат даты. Используйте ISO 8601')
    .optional()
    .nullable(),
  status: z
    .enum(equipmentStatuses, {
      invalid_type_error: `Статус должен быть одним из: ${equipmentStatuses.join(', ')}`,
    })
    .default('AVAILABLE'),
  location: z
    .string({ required_error: 'Местоположение обязательно' })
    .min(1, 'Местоположение не может быть пустым')
    .max(100, 'Местоположение не может быть длиннее 100 символов'),
  notes: z
    .string()
    .max(500, 'Примечания не могут быть длиннее 500 символов')
    .optional()
    .nullable(),
});

/**
 * Схема валидации для обновления оборудования
 */
const updateEquipmentSchema = z.object({
  name: z
    .string()
    .min(1, 'Название не может быть пустым')
    .max(100, 'Название не может быть длиннее 100 символов')
    .optional(),
  type: z
    .enum(equipmentTypes, {
      invalid_type_error: `Тип должен быть одним из: ${equipmentTypes.join(', ')}`,
    })
    .optional(),
  serialNumber: z
    .string()
    .min(1, 'Серийный номер не может быть пустым')
    .max(50, 'Серийный номер не может быть длиннее 50 символов')
    .optional(),
  manufacturer: z
    .string()
    .min(1, 'Производитель не может быть пустым')
    .max(50, 'Производитель не может быть длиннее 50 символов')
    .optional(),
  model: z
    .string()
    .min(1, 'Модель не может быть пустой')
    .max(50, 'Модель не может быть длиннее 50 символов')
    .optional(),
  purchaseDate: z
    .string()
    .datetime('Неверный формат даты. Используйте ISO 8601')
    .transform(val => new Date(val).toISOString())
    .optional(),
  warrantyEnd: z
    .string()
    .datetime('Неверный формат даты. Используйте ISO 8601')
    .optional()
    .nullable(),
  status: z
    .enum(equipmentStatuses, {
      invalid_type_error: `Статус должен быть одним из: ${equipmentStatuses.join(', ')}`,
    })
    .optional(),
  location: z
    .string()
    .min(1, 'Местоположение не может быть пустым')
    .max(100, 'Местоположение не может быть длиннее 100 символов')
    .optional(),
  notes: z
    .string()
    .max(500, 'Примечания не могут быть длиннее 500 символов')
    .optional()
    .nullable(),
});

/**
 * Схема валидации параметров запроса для получения списка оборудования
 */
const getEquipmentQuerySchema = z.object({
  q: z.string().optional(),
  type: z.enum(equipmentTypes).optional(),
  status: z.enum(equipmentStatuses).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
  sortBy: z.enum(['name', 'purchaseDate', 'createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

module.exports = {
  createEquipmentSchema,
  updateEquipmentSchema,
  getEquipmentQuerySchema,
};
