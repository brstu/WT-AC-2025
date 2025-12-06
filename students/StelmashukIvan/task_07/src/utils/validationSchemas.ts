import { z } from 'zod'

export const bookSchema = z.object({
  title: z.string()
    .min(1, 'Название обязательно')
    .max(100, 'Название не должно превышать 100 символов'),
  author: z.string()
    .min(1, 'Автор обязателен')
    .max(50, 'Имя автора не должно превышать 50 символов'),
  description: z.string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(500, 'Описание не должно превышать 500 символов'),
  publishedYear: z.number()
    .min(1000, 'Год должен быть не меньше 1000')
    .max(new Date().getFullYear(), 'Год не может быть в будущем'),
  genre: z.string()
    .min(1, 'Жанр обязателен')
    .max(30, 'Жанр не должен превышать 30 символов'),
  coverImageUrl: z.string().url('Неверный URL').optional().or(z.literal('')),
})

export const reviewSchema = z.object({
  author: z.string()
    .min(1, 'Имя обязательно')
    .max(50, 'Имя не должно превышать 50 символов'),
  content: z.string()
    .min(10, 'Отзыв должен содержать минимум 10 символов')
    .max(500, 'Отзыв не должен превышать 500 символов'),
  rating: z.number()
    .min(1, 'Рейтинг должен быть от 1 до 5')
    .max(5, 'Рейтинг должен быть от 1 до 5'),
})