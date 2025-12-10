require('dotenv').config();
const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');

// Swagger configuration (same as in app.js)
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
        url: `http://localhost:3000/api/v1`,
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
fs.writeFileSync('./OpenAPI.json', JSON.stringify(specs, null, 2));
console.log('OpenAPI specification exported to OpenAPI.json');