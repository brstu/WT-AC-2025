const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

const config = require('./config/config');
const errorHandler = require('./middlewares/error.middleware');
const recipesRoutes = require('./routes/recipes.routes');
const categoriesRoutes = require('./routes/categories.routes');

/**
 * Создание и настройка приложения Express
 */
const createApp = () => {
  const app = express();

  // Безопасность
  app.use(helmet());

  // CORS
  app.use(cors(config.cors));

  // Логирование
  if (config.env !== 'test') {
    app.use(morgan(config.logFormat));
  }

  // Сжатие ответов
  app.use(compression());

  // Парсинг JSON
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Документация Swagger
  app.use(`/api/${config.apiVersion}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Маршруты
  app.use(`/api/${config.apiVersion}/recipes`, recipesRoutes);
  app.use(`/api/${config.apiVersion}/categories`, categoriesRoutes);

  // Корневой маршрут
  app.get('/', (req, res) => {
    res.json({
      message: '🍳 API рецептов',
      version: config.apiVersion,
      documentation: `/api/${config.apiVersion}/docs`,
      endpoints: {
        recipes: `/api/${config.apiVersion}/recipes`,
        categories: `/api/${config.apiVersion}/categories`,
      },
    });
  });

  // 404 - Не найден
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Путь ${req.originalUrl} не найден`,
      statusCode: 404,
    });
  });

  // Централизованный обработчик ошибок
  app.use(errorHandler);

  return app;
};

module.exports = createApp();
