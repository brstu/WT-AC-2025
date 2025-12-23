const swaggerJSDoc = require('swagger-jsdoc');
const config = require('../config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'File Storage API',
      version: '1.0.0',
      description: 'API для хранения файлов с правами доступа и версиями'
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        File: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            originalName: { type: 'string' },
            description: { type: 'string' },
            mimeType: { type: 'string' },
            size: { type: 'integer' },
            ownerId: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            isPublic: { type: 'boolean' },
            permissions: { 
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  canRead: { type: 'boolean' },
                  canWrite: { type: 'boolean' },
                  canDelete: { type: 'boolean' }
                }
              }
            },
            currentVersion: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Version: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fileId: { type: 'string', format: 'uuid' },
            versionNumber: { type: 'integer' },
            size: { type: 'integer' },
            hash: { type: 'string' },
            uploadedBy: { type: 'string' },
            uploadedAt: { type: 'string', format: 'date-time' },
            changes: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'Auth endpoints' },
      { name: 'Files', description: 'File management endpoints' },
      { name: 'Versions', description: 'File version management' },
      { name: 'Permissions', description: 'File permissions management' }
    ]
  },
  apis: ['./src/routes/*.js'] // Path to the API routes
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;