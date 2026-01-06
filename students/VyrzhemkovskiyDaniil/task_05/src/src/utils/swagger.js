const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Microblog API',
      version: '1.0.0',
      description: 'REST API для микроблога с постами и комментариями'
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Post: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string', minLength: 1, maxLength: 100 },
            content: { type: 'string', minLength: 1, maxLength: 1000 },
            author: { type: 'string', minLength: 1, maxLength: 50 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            postId: { type: 'string' },
            author: { type: 'string', minLength: 1, maxLength: 50 },
            content: { type: 'string', minLength: 1, maxLength: 500 },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;