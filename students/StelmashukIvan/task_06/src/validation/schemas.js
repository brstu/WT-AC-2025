const { z } = require('zod');

// Auth Schemas
const authRegister = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  name: z.string().min(1, 'Имя обязательно').max(100, 'Имя слишком длинное').optional(),
});

const authLogin = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Пароль обязателен'),
});

// Task Schemas
const taskCreate = z.object({
  title: z.string().min(1, 'Название обязательно').max(200, 'Название слишком длинное'),
  description: z.string().max(1000, 'Описание слишком длинное').optional(),
  dueDate: z.string().datetime('Некорректная дата').optional(),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  tags: z.array(z.string()).optional().default([]),
});

const taskUpdate = taskCreate.partial();

// Query parameters validation
const queryParams = z.object({
  q: z.string().optional(),
  status: z.enum(['all', 'completed', 'active']).optional().default('all'),
  priority: z.enum(['all', 'low', 'medium', 'high']).optional().default('all'),
  limit: z.string().regex(/^\d+$/, 'Лимит должен быть числом').transform(Number).optional().default('10'),
  offset: z.string().regex(/^\d+$/, 'Смещение должно быть числом').transform(Number).optional().default('0'),
});

module.exports = {
  authRegister,
  authLogin,
  taskCreate,
  taskUpdate,
  queryParams,
};