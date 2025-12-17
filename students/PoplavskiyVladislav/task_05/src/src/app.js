const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');
const errorHandler = require('./middlewares/errorHandler');
const donationRoutes = require('./routes/donationRoutes');
const swaggerSpecs = require('../docs/swagger');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger документация
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Charity Donations API Docs'
}));

// Маршрут для получения спецификации OpenAPI в JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecs);
});

// Главная страница
app.get('/', (req, res) => {
  res.json({
    message: 'Добро пожаловать в API благотворительных пожертвований',
    documentation: '/api-docs',
    endpoints: {
      donations: '/api/v1/donations',
      stats: '/api/v1/donations/stats/summary'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API маршруты
app.use(`/api/${config.apiVersion}/donations`, donationRoutes);

// Обработка 404
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Маршрут ${req.originalUrl} не найден`
  });
});

// Глобальный обработчик ошибок
app.use(errorHandler);

// Запуск сервера
const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`Сервер запущен на порту ${PORT}`);
  logger.info(`Документация доступна по адресу: http://localhost:${PORT}/api-docs`);
  logger.info(`API доступен по базовому адресу: http://localhost:${PORT}/api/${config.apiVersion}`);
});

// Обработка завершения работы
process.on('SIGTERM', () => {
  logger.info('SIGTERM получен, завершение работы...');
  server.close(() => {
    logger.info('Сервер завершил работу');
  });
});

module.exports = app;