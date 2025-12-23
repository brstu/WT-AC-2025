import { z } from 'zod';

// Схема валидации для мероприятия
export const eventSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Название мероприятия обязательно' })
    .max(100, { message: 'Название не должно превышать 100 символов' })
    .trim(),
  
  description: z
    .string()
    .min(10, { message: 'Описание должно содержать минимум 10 символов' })
    .max(500, { message: 'Описание не должно превышать 500 символов' })
    .trim(),
  
  date: z
    .string()
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    }, { message: 'Дата должна быть в будущем' }),
  
  location: z
    .string()
    .min(1, { message: 'Место проведения обязательно' })
    .max(200, { message: 'Место проведения не должно превышать 200 символов' })
    .trim(),
  
  category: z
    .string()
    .min(1, { message: 'Выберите категорию' }),
  
  maxParticipants: z
    .number()
    .int({ message: 'Количество участников должно быть целым числом' })
    .min(1, { message: 'Минимум 1 участник' })
    .max(10000, { message: 'Максимум 10000 участников' }),
  
  status: z.enum(['active', 'cancelled', 'completed'], {
    errorMap: () => ({ message: 'Выберите корректный статус' })
  })
});

// Схема валидации для заявки
export const applicationSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Имя должно содержать минимум 2 символа' })
    .max(100, { message: 'Имя не должно превышать 100 символов' })
    .trim(),
  
  email: z
    .string()
    .email({ message: 'Введите корректный email адрес' })
    .trim(),
  
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Введите корректный номер телефона' })
    .optional()
    .or(z.literal('')),
  
  message: z
    .string()
    .max(500, { message: 'Сообщение не должно превышать 500 символов' })
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  
  eventId: z.string().min(1, { message: 'ID мероприятия обязательно' })
});

// Функция для форматирования ошибок валидации
export const formatValidationErrors = (zodError) => {
  const errors = {};
  if (zodError.errors) {
    zodError.errors.forEach((error) => {
      const field = error.path.join('.');
      errors[field] = error.message;
    });
  }
  return errors;
};

// Валидация даты
export const validateEventDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  
  if (isNaN(date.getTime())) {
    return { isValid: false, message: 'Неверный формат даты' };
  }
  
  if (date <= now) {
    return { isValid: false, message: 'Дата должна быть в будущем' };
  }
  
  return { isValid: true };
};

// Валидация участников
export const validateParticipants = (current, max) => {
  if (current > max) {
    return { 
      isValid: false, 
      message: `Текущее количество участников (${current}) не может превышать максимальное (${max})` 
    };
  }
  
  return { isValid: true };
};

// Функция для предварительной проверки формы
export const preValidateEventForm = (data) => {
  const errors = {};
  
  if (!data.title?.trim()) {
    errors.title = 'Название мероприятия обязательно';
  }
  
  if (!data.description?.trim()) {
    errors.description = 'Описание обязательно';
  } else if (data.description.trim().length < 10) {
    errors.description = 'Описание должно содержать минимум 10 символов';
  }
  
  if (!data.date) {
    errors.date = 'Дата проведения обязательна';
  } else {
    const dateValidation = validateEventDate(data.date);
    if (!dateValidation.isValid) {
      errors.date = dateValidation.message;
    }
  }
  
  if (!data.location?.trim()) {
    errors.location = 'Место проведения обязательно';
  }
  
  if (!data.category) {
    errors.category = 'Категория обязательна';
  }
  
  if (!data.maxParticipants || data.maxParticipants < 1) {
    errors.maxParticipants = 'Максимальное количество участников должно быть не менее 1';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Экспорт утилит
export default {
  eventSchema,
  applicationSchema,
  formatValidationErrors,
  validateEventDate,
  validateParticipants,
  preValidateEventForm
};