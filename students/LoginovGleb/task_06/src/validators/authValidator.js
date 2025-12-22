const { z } = require('zod');

/**
 * Схема валидации для регистрации пользователя
 */
const signupSchema = z.object({
  email: z
    .string({ required_error: 'Email обязателен' })
    .email('Неверный формат email')
    .max(100, 'Email не может быть длиннее 100 символов'),
  password: z
    .string({ required_error: 'Пароль обязателен' })
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .max(100, 'Пароль не может быть длиннее 100 символов'),
  firstName: z
    .string({ required_error: 'Имя обязательно' })
    .min(1, 'Имя не может быть пустым')
    .max(50, 'Имя не может быть длиннее 50 символов'),
  lastName: z
    .string({ required_error: 'Фамилия обязательна' })
    .min(1, 'Фамилия не может быть пустой')
    .max(50, 'Фамилия не может быть длиннее 50 символов'),
});

/**
 * Схема валидации для входа пользователя
 */
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email обязателен' })
    .email('Неверный формат email'),
  password: z.string({ required_error: 'Пароль обязателен' }),
});

/**
 * Схема валидации для обновления токена
 */
const refreshTokenSchema = z.object({
  refreshToken: z.string({ required_error: 'Refresh token обязателен' }),
});

/**
 * Схема валидации для запроса сброса пароля
 */
const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email обязателен' })
    .email('Неверный формат email'),
});

/**
 * Схема валидации для сброса пароля
 */
const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'Токен обязателен' }),
  newPassword: z
    .string({ required_error: 'Новый пароль обязателен' })
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .max(100, 'Пароль не может быть длиннее 100 символов'),
});

module.exports = {
  signupSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
