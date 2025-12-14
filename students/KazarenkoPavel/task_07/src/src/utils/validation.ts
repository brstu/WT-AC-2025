import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов')
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  password: z.string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
    .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')
})

export const adSchema = z.object({
  title: z.string()
    .min(5, 'Заголовок должен содержать минимум 5 символов')
    .max(100, 'Заголовок не должен превышать 100 символов'),
  description: z.string()
    .min(20, 'Описание должно содержать минимум 20 символов')
    .max(2000, 'Описание не должно превышать 2000 символов'),
  price: z.number()
    .min(0, 'Цена не может быть отрицательной')
    .max(1000000000, 'Цена слишком большая'),
  categoryId: z.string().min(1, 'Выберите категорию'),
  location: z.string().min(2, 'Укажите местоположение'),
  images: z.array(z.instanceof(File))
    .min(1, 'Добавьте хотя бы одно изображение')
    .max(10, 'Максимум 10 изображений')
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type AdFormData = z.infer<typeof adSchema>
