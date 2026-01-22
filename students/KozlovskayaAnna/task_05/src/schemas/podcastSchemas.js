import { z } from 'zod';

// Схема для создания нового подкаста
export const createPodcastSchema = z.object({
  title: z.string()
    .min(1, 'Название подкаста обязательно')
    .max(100, 'Название не может быть длиннее 100 символов'),
  author: z.string()
    .min(1, 'Автор обязателен')
    .max(80, 'Имя автора не может быть длиннее 80 символов'),
  description: z.string()
    .min(1, 'Описание обязательно'),
  coverUrl: z.string()
    .url('Некорректный URL обложки'),
  category: z.string()
    .min(1, 'Категория обязательна')
});

// Схема для обновления подкаста (все поля опциональны)
export const updatePodcastSchema = z.object({
  title: z.string()
    .min(1, 'Название не может быть пустым')
    .max(100, 'Название не может быть длиннее 100 символов')
    .optional(),
  author: z.string()
    .min(1, 'Имя автора не может быть пустым')
    .max(80, 'Имя автора не может быть длиннее 80 символов')
    .optional(),
  description: z.string()
    .min(1, 'Описание не может быть пустым')
    .optional(),
  coverUrl: z.string()
    .url('Некорректный URL обложки')
    .optional(),
  category: z.string()
    .min(1, 'Категория не может быть пустой')
    .optional()
});
