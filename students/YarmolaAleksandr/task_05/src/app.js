require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

// Middleware imports
const { errorHandler } = require('./middleware/errorHandler');

// Routes imports
const gadgetsRouter = require('./routes/gadgets');

// Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: process.env.SWAGGER_TITLE || 'Gadgets & Reviews API',
      version: process.env.SWAGGER_VERSION || '1.0.0',
      description: process.env.SWAGGER_DESCRIPTION || 'REST API для управления коллекцией гаджетов и обзоров',
      contact: {
        name: 'YarmolaAleksandr',
        email: 'student@example.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api/${API_VERSION}`,
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Gadget: {
          type: 'object',
          required: ['name', 'brand', 'category', 'price'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Gadget name',
              example: 'iPhone 15 Pro'
            },
            brand: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
              description: 'Gadget brand',
              example: 'Apple'
            },
            category: {
              type: 'string',
              enum: ['smartphone', 'laptop', 'tablet', 'smartwatch', 'headphones', 'camera', 'gaming', 'other'],
              description: 'Gadget category',
              example: 'smartphone'
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Price in USD',
              example: 999.99
            },
            rating: {
              type: 'number',
              minimum: 1,
              maximum: 5,
              description: 'Rating from 1 to 5',
              example: 4.5
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Detailed description',
              example: 'Latest flagship smartphone with advanced features'
            },
            releaseDate: {
              type: 'string',
              format: 'date',
              description: 'Release date in ISO format',
              example: '2023-09-15'
            },
            inStock: {
              type: 'boolean',
              description: 'Availability status',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/app.js']
};

const specs = swaggerJsdoc(swaggerOptions);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.SWAGGER_VERSION || '1.0.0'
  });
});

// API documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Gadgets API Documentation'
}));

// API routes
app.use(`/api/${API_VERSION}/gadgets`, gadgetsRouter);

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/docs');
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Gadgets API Server running on port ${PORT}`);
    console.log(`📚 Documentation available at http://localhost:${PORT}/docs`);
    console.log(`🔍 Health check at http://localhost:${PORT}/health`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api/${API_VERSION}`);
  });
}

module.exports = app;