require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

// Проверка обязательных переменных окружения
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Ошибка: ${envVar} не установлен в .env файле`);
    process.exit(1);
  }
});

// Запуск сервера
const server = app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Режим: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM получен, завершение работы...');
  server.close(() => {
    console.log('Сервер остановлен');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT получен, завершение работы...');
  server.close(() => {
    console.log('Сервер остановлен');
    process.exit(0);
  });
});

// Обработка необработанных ошибок
process.on('unhandledRejection', (reason, promise) => {
  console.error('Необработанное отклонение промиса:', promise, 'причина:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Необработанное исключение:', error);
  process.exit(1);
});