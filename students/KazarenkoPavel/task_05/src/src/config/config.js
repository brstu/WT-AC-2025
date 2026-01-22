require('dotenv').config();

const config = {
  // Настройки сервера
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiVersion: process.env.API_VERSION || 'v1',

  // Логирование
  logLevel: process.env.LOG_LEVEL || 'info',
  logFormat: process.env.LOG_FORMAT || 'combined',

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // Пагинация
  pagination: {
    defaultLimit: parseInt(process.env.DEFAULT_LIMIT, 10) || 10,
    maxLimit: parseInt(process.env.MAX_LIMIT, 10) || 100,
  },

  // Валидация
  validation: {
    maxTitleLength: parseInt(process.env.MAX_TITLE_LENGTH, 10) || 100,
    maxDescriptionLength: parseInt(process.env.MAX_DESCRIPTION_LENGTH, 10) || 1000,
    maxIngredients: parseInt(process.env.MAX_INGREDIENTS, 10) || 50,
    maxSteps: parseInt(process.env.MAX_STEPS, 10) || 50,
  },

  // Проверка режима
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

module.exports = config;
