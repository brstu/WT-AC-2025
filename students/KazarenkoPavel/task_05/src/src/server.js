const app = require('./app');
const config = require('./config/config');

/**
 * Запуск сервера
 */
const startServer = () => {
  try {
    const server = app.listen(config.port, () => {
      console.log(`
        🚀 Сервер запущен!

        📍 Режим: ${config.env}
        🔌 Порт: ${config.port}
        📚 Документация: http://localhost:${config.port}/api/${config.apiVersion}/docs
        🍽️  API: http://localhost:${config.port}/api/${config.apiVersion}/recipes
      `);
    });

    // Обработка ошибок при запуске сервера
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Порт ${config.port} уже занят!`);
        process.exit(1);
      } else {
        console.error('❌ Ошибка запуска сервера:', error);
        process.exit(1);
      }
    });

    // Обработка сигналов завершения
    process.on('SIGTERM', () => {
      console.log('🛑 Получен SIGTERM, завершение работы...');
      server.close(() => {
        console.log('✅ Сервер остановлен');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 Получен SIGINT, завершение работы...');
      server.close(() => {
        console.log('✅ Сервер остановлен');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Не удалось запустить сервер:', error);
    process.exit(1);
  }
};

// Проверка на прямой запуск файла
if (require.main === module) {
  startServer();
}

module.exports = startServer;
