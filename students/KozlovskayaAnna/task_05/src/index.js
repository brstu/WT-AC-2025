import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import podcastsRouter from './routes/podcasts.js';
import episodesRouter from './routes/episodes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Загружаем переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger конфигурация
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Podcasts & Episodes API',
      version: '1.0.0',
      description: 'REST API для управления подкастами и их эпизодами (Лабораторная работа №5)',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Podcast: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор подкаста'
            },
            title: {
              type: 'string',
              description: 'Название подкаста'
            },
            author: {
              type: 'string',
              description: 'Автор подкаста'
            },
            description: {
              type: 'string',
              description: 'Описание подкаста'
            },
            coverUrl: {
              type: 'string',
              description: 'URL обложки подкаста'
            },
            category: {
              type: 'string',
              description: 'Категория подкаста'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания'
            }
          }
        },
        PodcastCreate: {
          type: 'object',
          required: ['title', 'author', 'description', 'coverUrl', 'category'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 100
            },
            author: {
              type: 'string',
              minLength: 1,
              maxLength: 80
            },
            description: {
              type: 'string',
              minLength: 1
            },
            coverUrl: {
              type: 'string',
              format: 'uri'
            },
            category: {
              type: 'string',
              minLength: 1
            }
          }
        },
        PodcastUpdate: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 100
            },
            author: {
              type: 'string',
              minLength: 1,
              maxLength: 80
            },
            description: {
              type: 'string',
              minLength: 1
            },
            coverUrl: {
              type: 'string',
              format: 'uri'
            },
            category: {
              type: 'string',
              minLength: 1
            }
          }
        },
        Episode: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор эпизода'
            },
            podcastId: {
              type: 'integer',
              description: 'ID подкаста, к которому относится эпизод'
            },
            title: {
              type: 'string',
              description: 'Название эпизода'
            },
            description: {
              type: 'string',
              description: 'Описание эпизода'
            },
            duration: {
              type: 'integer',
              description: 'Длительность в секундах'
            },
            audioUrl: {
              type: 'string',
              description: 'URL аудиофайла'
            },
            publishedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата публикации'
            },
            season: {
              type: 'integer',
              description: 'Номер сезона'
            },
            episodeNumber: {
              type: 'integer',
              description: 'Номер эпизода в сезоне'
            }
          }
        },
        EpisodeCreate: {
          type: 'object',
          required: ['title', 'description', 'audioUrl'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 150
            },
            description: {
              type: 'string',
              minLength: 1
            },
            duration: {
              type: 'integer',
              minimum: 1
            },
            audioUrl: {
              type: 'string',
              format: 'uri'
            },
            season: {
              type: 'integer',
              minimum: 1
            },
            episodeNumber: {
              type: 'integer',
              minimum: 1
            }
          }
        },
        EpisodeUpdate: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 150
            },
            description: {
              type: 'string',
              minLength: 1
            },
            duration: {
              type: 'integer',
              minimum: 1
            },
            audioUrl: {
              type: 'string',
              format: 'uri'
            },
            season: {
              type: 'integer',
              minimum: 1
            },
            episodeNumber: {
              type: 'integer',
              minimum: 1
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Podcasts API Documentation'
}));

// Главная страница с редиректом на документацию
app.get('/', (req, res) => {
  res.redirect('/docs');
});

// API Routes (v1)
app.use('/api/v1/podcasts', podcastsRouter);
app.use('/api/v1/podcasts/:podcastId/episodes', episodesRouter);

// Обработка 404
app.use((req, res) => {
  res.status(404).json({
    message: 'Маршрут не найден'
  });
});

// Централизованный обработчик ошибок (должен быть последним)
app.use(errorHandler);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
  console.log(`📚 Документация Swagger доступна: http://localhost:${PORT}/docs`);
  console.log(`🎙️  API доступен: http://localhost:${PORT}/api/v1`);
});
