import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  username: z
    .string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(30, 'Имя пользователя должно содержать максимум 30 символов')
    .regex(/^[a-zA-Z0-9_]+$/, 'Разрешены только буквы, цифры и нижнее подчеркивание'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Пароль обязателен'),
});

export const gameSchema = z.object({
  title: z
    .string()
    .min(1, 'Название обязательно')
    .max(200, 'Название слишком длинное'),
  description: z.string().max(1000, 'Описание слишком длинное').optional(),
  genre: z
    .string()
    .min(1, 'Жанр обязателен')
    .max(50, 'Название жанра слишком длинное'),
  platform: z
    .string()
    .min(1, 'Платформа обязательна')
    .max(50, 'Название платформы слишком длинное'),
  releaseYear: z
    .number()
    .int('Год должен быть целым числом')
    .min(1970, 'Год должен быть не раньше 1970')
    .max(new Date().getFullYear(), 'Год не может быть в будущем'),
  rating: z
    .number()
    .min(0, 'Рейтинг не может быть меньше 0')
    .max(10, 'Рейтинг не может быть больше 10')
    .optional(),
  imageUrl: z.string().url('Некорректный URL').optional(),
});