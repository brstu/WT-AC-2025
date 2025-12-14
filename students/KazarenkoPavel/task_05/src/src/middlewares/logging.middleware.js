const morgan = require('morgan');
const config = require('../config/config');

/**
 * Формат логов для разработки
 */
const developmentFormat = ':method :url :status :response-time ms - :res[content-length]';

/**
 * Формат логов для продакшена
 */
const productionFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

/**
 * Настройка логирования в зависимости от окружения
 */
const setupLogging = () => {
  if (config.env === 'test') {
    return (req, res, next) => next(); // Без логирования в тестах
  }

  return morgan(config.env === 'production' ? productionFormat : developmentFormat, {
    skip: (req, res) => {
      // Пропускаем health-check запросы
      return req.originalUrl === '/health';
    },
    stream: {
      write: (message) => {
        if (config.env === 'production') {
          // В продакшене можно писать в файл или сервис логирования
          console.log(message.trim());
        } else {
          console.log(message.trim());
        }
      },
    },
  });
};

/**
 * Middleware для логирования запросов
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Логирование начала запроса (только в development)
  if (config.isDevelopment) {
    console.log(`➡️  ${req.method} ${req.originalUrl}`, {
      query: req.query,
      body: req.body,
      headers: req.headers,
    });
  }

  // Логирование окончания запроса
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';

    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0,
      userAgent: req.get('user-agent'),
      ip: req.ip,
    };

    if (logLevel === 'error') {
      console.error('❌ Запрос завершен с ошибкой:', logData);
    } else if (config.isDevelopment) {
      console.log('✅ Запрос успешно обработан:', logData);
    }
  });

  next();
};

module.exports = {
  setupLogging,
  requestLogger,
};
