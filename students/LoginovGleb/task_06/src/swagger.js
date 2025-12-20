const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Equipment Inventory API',
      version: '1.0.0',
      description: 'REST API для учета инвентаря/оборудования с авторизацией и управлением ролями',
      contact: {
        name: 'Логинов Глеб Олегович'
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Эндпоинты аутентификации и авторизации',
      },
      {
        name: 'Equipment',
        description: 'Управление оборудованием',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
