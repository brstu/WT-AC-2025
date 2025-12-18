import { z } from 'zod';

export const createTaskSchema = z.object({
    title: z.string()
        .min(1, 'Название обязательно')
        .max(100, 'Максимум 100 символов'),
    done: z.boolean().default(false),
    dueDate: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Формат YYYY-MM-DD')
        .optional()
        .or(z.literal('')).transform(val => val || null)
});

export const updateTaskSchema = createTaskSchema.partial();