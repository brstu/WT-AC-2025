require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const authRouter = require('./routes/auth');
const equipmentRouter = require('./routes/equipment');

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 минут
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // макс 100 запросов
  message: 'Слишком много запросов с этого IP, попробуйте позже',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware с ограничением размера
app.use(express.json({ limit: process.env.BODY_LIMIT || '10kb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.BODY_LIMIT || '10kb' }));

// Логирование (только не в тестовом режиме)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Equipment Inventory API Documentation',
}));

// OpenAPI JSON endpoint
app.get('/api/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Корневой эндпоинт
app.get('/', (req, res) => {
  res.json({
    name: 'Equipment Inventory API',
    version: '1.0.0',
    description: 'REST API для учета инвентаря/оборудования с авторизацией и управлением ролями',
    documentation: '/docs',
    endpoints: {
      authentication: `/api/${API_VERSION}/auth`,
      equipment: `/api/${API_VERSION}/equipment`,
    },
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use(`/api/${API_VERSION}/auth`, authRouter);
app.use(`/api/${API_VERSION}/equipment`, equipmentRouter);

// Обработка несуществующих маршрутов
app.use(notFoundHandler);

// Централизованная обработка ошибок
app.use(errorHandler);

// Запуск сервера (только если не в режиме тестирования)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    const WIDTH = 60;
    const formatLine = (text) => `║  ${text.padEnd(WIDTH - 4)}║`;
    const separator = '╠' + '═'.repeat(WIDTH) + '╣';
    
    const serverUrl = `http://localhost:${PORT}`;
    const docsUrl = `${serverUrl}/docs`;
    const openapiUrl = `${serverUrl}/api/openapi.json`;
    
    console.log(`
╔${'═'.repeat(WIDTH)}╗
${formatLine('🚀 Equipment Inventory API')}
${separator}
${formatLine(`Сервер запущен на ${serverUrl}`)}
${formatLine(`Документация: ${docsUrl}`)}
${formatLine(`OpenAPI JSON: ${openapiUrl}`)}
${separator}
${formatLine('📚 Эндпоинты аутентификации:')}
${formatLine(`   POST   /api/${API_VERSION}/auth/signup`)}
${formatLine(`   POST   /api/${API_VERSION}/auth/login`)}
${formatLine(`   POST   /api/${API_VERSION}/auth/refresh`)}
${formatLine(`   POST   /api/${API_VERSION}/auth/logout`)}
${formatLine(`   POST   /api/${API_VERSION}/auth/forgot-password`)}
${formatLine(`   POST   /api/${API_VERSION}/auth/reset-password`)}
${formatLine('')}
${formatLine('🔧 Эндпоинты оборудования (требуется Bearer токен):')}
${formatLine(`   GET    /api/${API_VERSION}/equipment`)}
${formatLine(`   POST   /api/${API_VERSION}/equipment`)}
${formatLine(`   GET    /api/${API_VERSION}/equipment/:id`)}
${formatLine(`   PUT    /api/${API_VERSION}/equipment/:id`)}
${formatLine(`   PATCH  /api/${API_VERSION}/equipment/:id`)}
${formatLine(`   DELETE /api/${API_VERSION}/equipment/:id`)}
${separator}
${formatLine('🔐 Тестовые аккаунты:')}
${formatLine('   Admin: admin@example.com / password123')}
${formatLine('   User1: user1@example.com / password123')}
${formatLine('   User2: user2@example.com / password123')}
╚${'═'.repeat(WIDTH)}╝
    `);
  });
}

module.exports = app;
