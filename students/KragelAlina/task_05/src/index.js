require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const teamsRouter = require('./routes/teams');
const tournamentsRouter = require('./routes/tournaments');

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Arts & Galleries API Documentation'
}));

app.get('/api/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get('/', (req, res) => {
  res.json({
    name: 'Arts & Galleries API',
    version: '1.0.0',
    description: 'REST API для управления артами и галереями с лайками',
    documentation: '/docs',
    endpoints: {
      arts: `/api/${API_VERSION}/teams`,
      galleries: `/api/${API_VERSION}/tournaments`
    }
  });
});

app.use(`/api/${API_VERSION}/teams`, teamsRouter);
app.use(`/api/${API_VERSION}/tournaments`, tournamentsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📚 Документация API: http://localhost:${PORT}/docs`);
    console.log(`📋 OpenAPI JSON: http://localhost:${PORT}/api/openapi.json`);
    console.log(`\n🔗 Эндпоинты:`);
    console.log(`   GET    /api/${API_VERSION}/teams`);
    console.log(`   POST   /api/${API_VERSION}/teams`);
    console.log(`   GET    /api/${API_VERSION}/teams/:id`);
    console.log(`   PUT    /api/${API_VERSION}/teams/:id`);
    console.log(`   PATCH  /api/${API_VERSION}/teams/:id`);
    console.log(`   DELETE /api/${API_VERSION}/teams/:id`);
    console.log(`   POST   /api/${API_VERSION}/teams/:id/like`);
    console.log(`   GET    /api/${API_VERSION}/tournaments`);
    console.log(`   POST   /api/${API_VERSION}/tournaments`);
    console.log(`   GET    /api/${API_VERSION}/tournaments/:id`);
    console.log(`   PUT    /api/${API_VERSION}/tournaments/:id`);
    console.log(`   PATCH  /api/${API_VERSION}/tournaments/:id`);
    console.log(`   DELETE /api/${API_VERSION}/tournaments/:id`);
    console.log(`   POST   /api/${API_VERSION}/tournaments/:id/like\n`);
  });
}

module.exports = app;