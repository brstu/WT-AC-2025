const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const authRouter = require('./routes/auth');
const tasksRouter = require('./routes/tasks');

const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 3000;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Academic Portfolio API',
      version: '1.0.0',
      description: 'REST API для управления задачами с JWT аутентификацией и SQLite базой данных. Разработано в рамках лабораторной работы 06.',
      contact: {
        name: 'Студент',
        email: 'student@university.edu'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/', apiLimiter);

app.use('/api/auth', authRouter);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Academic Portfolio API Documentation"
}));

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    documentation: '/docs'
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Academic Portfolio API',
    version: '1.0.0',
    description: 'REST API для управления задачами с аутентификацией',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me',
        updateProfile: 'PATCH /api/auth/profile'
      },
      tasks: {
        list: 'GET /api/tasks',
        create: 'POST /api/tasks',
        get: 'GET /api/tasks/:id',
        update: 'PATCH /api/tasks/:id',
        delete: 'DELETE /api/tasks/:id',
        complete: 'PATCH /api/tasks/:id/complete'
      }
    },
    authentication: 'Все эндпоинты задач требуют JWT токена в заголовке Authorization: Bearer <token>'
  });
});

app.use('/api/tasks', tasksRouter);

app.use(errorHandler);

app.use('*', (req, res) => {
  res.status(404).json({ 
    message: `Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
    availableRoutes: [
      '/health',
      '/api',
      '/docs',
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/me',
      '/api/auth/profile',
      '/api/tasks'
    ]
  });
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`
🎓 Academic Portfolio API Server
✅ Server is running on port ${PORT}
📚 API Documentation: http://localhost:${PORT}/docs
🔍 Health check: http://localhost:${PORT}/health
📋 API info: http://localhost:${PORT}/api
🔐 Authentication required for /api/tasks routes

💡 Quick start:
1. Register: POST /api/auth/register
2. Login: POST /api/auth/login  
3. Use token in Authorization header for tasks
  `);
});

module.exports = app;