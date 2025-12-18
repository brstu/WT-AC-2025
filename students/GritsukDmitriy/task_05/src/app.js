const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const mediaRoutes = require('./routes/media.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Media Catalog API',
      version: '1.0.0',
      description: 'API для управления каталогом фильмов и сериалов',
      contact: {
        name: 'Developer',
        email: 'dev@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    // Добавьте в components в app.js
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Media: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Уникальный идентификатор записи'
            },
            title: {
              type: 'string',
              description: 'Название фильма/сериала'
            },
            description: {
              type: 'string',
              description: 'Описание'
            },
            year: {
              type: 'integer',
              description: 'Год выпуска'
            },
            genre: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Жанры'
            },
            type: {
              type: 'string',
              enum: ['movie', 'series'],
              description: 'Тип контента'
            },
            rating: {
              type: 'number',
              format: 'float',
              description: 'Рейтинг от 0 до 10'
            },
            duration: {
              type: 'integer',
              description: 'Продолжительность в минутах (для фильмов)'
            },
            seasons: {
              type: 'integer',
              description: 'Количество сезонов (для сериалов)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата последнего обновления'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Статус ошибки',
              example: 'error'
            },
            message: {
              type: 'string',
              description: 'Сообщение об ошибке',
              example: 'Validation failed'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    description: 'Сообщение об ошибке валидации'
                  },
                  path: {
                    type: 'array',
                    items: {
                      type: 'string'
                    },
                    description: 'Путь к полю с ошибкой'
                  }
                }
              },
              description: 'Детали ошибок валидации'
            }
          }
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Общее количество записей'
            },
            limit: {
              type: 'integer',
              description: 'Количество записей на странице'
            },
            offset: {
              type: 'integer',
              description: 'Смещение'
            },
            hasMore: {
              type: 'boolean',
              description: 'Есть ли еще записи'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1/media', mediaRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;