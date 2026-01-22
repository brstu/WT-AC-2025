const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Charity Donations API',
      version: '1.0.0',
      description: 'REST API для управления благотворительными пожертвованиями',
      contact: {
        name: 'API Support',
        email: 'support@charity.org'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Donation: {
          type: 'object',
          required: ['donorName', 'amount', 'currency', 'projectId'],
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор пожертвования',
              example: 1
            },
            donorName: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Имя жертвователя',
              example: 'Иван Иванов'
            },
            amount: {
              type: 'number',
              minimum: 1,
              maximum: 1000000,
              description: 'Сумма пожертвования',
              example: 5000
            },
            currency: {
              type: 'string',
              enum: ['USD', 'EUR', 'RUB', 'UAH'],
              description: 'Валюта пожертвования',
              example: 'RUB'
            },
            projectId: {
              type: 'string',
              description: 'ID благотворительного проекта',
              example: 'children-help-2024'
            },
            message: {
              type: 'string',
              maxLength: 500,
              description: 'Сообщение от жертвователя',
              example: 'На лечение детей'
            },
            isAnonymous: {
              type: 'boolean',
              default: false,
              description: 'Анонимное пожертвование',
              example: false
            },
            donationDate: {
              type: 'string',
              format: 'date-time',
              description: 'Дата пожертвования',
              example: '2024-01-15T10:30:00Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания записи'
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
              example: 'Пожертвование не найдено'
            }
          }
        }
      },
      responses: {
        NotFound: {
          description: 'Ресурс не найден'
        },
        ValidationError: {
          description: 'Ошибка валидации'
        },
        ServerError: {
          description: 'Внутренняя ошибка сервера'
        }
      }
    },
    tags: [
      {
        name: 'Donations',
        description: 'Операции с пожертвованиями'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);
module.exports = specs;