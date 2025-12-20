require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const tournamentsRouter = require('./routes/tournaments');
const teamsRouter = require('./routes/teams');

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Middleware
app.use(cors());
app.use(express.json());

// Логирование только если не в тестовом режиме
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Esports API Documentation'
}));

// OpenAPI JSON endpoint
app.get('/api/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Корневой эндпоинт
app.get('/', (req, res) => {
  res.json({
    name: 'Esports API',
    version: '1.0.0',
    description: 'REST API для управления киберспортивными турнирами и командами',
    documentation: '/docs',
    endpoints: {
      tournaments: `/api/${API_VERSION}/tournaments`,
      teams: `/api/${API_VERSION}/teams`
    }
  });
});

// API версионирование
app.use(`/api/${API_VERSION}/tournaments`, tournamentsRouter);
app.use(`/api/${API_VERSION}/teams`, teamsRouter);

// Обработка несуществующих маршрутов
app.use(notFoundHandler);

// Централизованная обработка ошибок
app.use(errorHandler);

// Запуск сервера (только если не в режиме тестирования)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📚 Документация API: http://localhost:${PORT}/docs`);
    console.log(`📋 OpenAPI JSON: http://localhost:${PORT}/api/openapi.json`);
    console.log(`\n🔗 Эндпоинты:`);
    console.log(`   GET    /api/${API_VERSION}/tournaments`);
    console.log(`   POST   /api/${API_VERSION}/tournaments`);
    console.log(`   GET    /api/${API_VERSION}/tournaments/:id`);
    console.log(`   PUT    /api/${API_VERSION}/tournaments/:id`);
    console.log(`   PATCH  /api/${API_VERSION}/tournaments/:id`);
    console.log(`   DELETE /api/${API_VERSION}/tournaments/:id`);
    console.log(`   GET    /api/${API_VERSION}/teams`);
    console.log(`   POST   /api/${API_VERSION}/teams`);
    console.log(`   GET    /api/${API_VERSION}/teams/:id`);
    console.log(`   PUT    /api/${API_VERSION}/teams/:id`);
    console.log(`   PATCH  /api/${API_VERSION}/teams/:id`);
    console.log(`   DELETE /api/${API_VERSION}/teams/:id\n`);
  });
}

module.exports = app;
