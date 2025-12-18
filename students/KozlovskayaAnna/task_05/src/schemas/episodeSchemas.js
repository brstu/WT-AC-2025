import { z } from 'zod';

// Схема для создания нового эпизода
export const createEpisodeSchema = z.object({
  title: z.string()
    .min(1, 'Название эпизода обязательно')
    .max(150, 'Название не может быть длиннее 150 символов'),
  description: z.string()
    .min(1, 'Описание обязательно'),
  duration: z.number()
    .int('Длительность должна быть целым числом')
    .positive('Длительность должна быть положительной')
    .optional(),
  audioUrl: z.string()
    .url('Некорректный URL аудиофайла'),
  season: z.number()
    .int('Номер сезона должен быть целым числом')
    .positive('Номер сезона должен быть положительным')
    .optional(),
  episodeNumber: z.number()
    .int('Номер эпизода должен быть целым числом')
    .positive('Номер эпизода должен быть положительным')
    .optional()
});

// Схема для обновления эпизода (все поля опциональны)
export const updateEpisodeSchema = z.object({
  title: z.string()
    .min(1, 'Название не может быть пустым')
    .max(150, 'Название не может быть длиннее 150 символов')
    .optional(),
  description: z.string()
    .min(1, 'Описание не может быть пустым')
    .optional(),
  duration: z.number()
    .int('Длительность должна быть целым числом')
    .positive('Длительность должна быть положительной')
    .optional(),
  audioUrl: z.string()
    .url('Некорректный URL аудиофайла')
    .optional(),
  season: z.number()
    .int('Номер сезона должен быть целым числом')
    .positive('Номер сезона должен быть положительным')
    .optional(),
  episodeNumber: z.number()
    .int('Номер эпизода должен быть целым числом')
    .positive('Номер эпизода должен быть положительным')
    .optional()
});
