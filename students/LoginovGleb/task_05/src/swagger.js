const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Esports API',
      version: '1.0.0',
      description: `
# API для управления киберспортивными турнирами и командами

Этот REST API предоставляет полный набор эндпоинтов для управления:
- **Турнирами** - создание, редактирование, удаление и поиск турниров
- **Командами** - управление киберспортивными командами

## Возможности
- Полный CRUD для всех ресурсов
- Поиск по тексту
- Фильтрация по различным полям
- Сортировка результатов
- Пагинация с метаданными
- Валидация входных данных
- Централизованная обработка ошибок

## Коды статусов
- \`200\` - Успешный запрос
- \`201\` - Ресурс успешно создан
- \`204\` - Успешное удаление (без тела ответа)
- \`400\` - Некорректный запрос
- \`404\` - Ресурс не найден
- \`422\` - Ошибка валидации
- \`500\` - Внутренняя ошибка сервера
      `,
      contact: {
        name: 'Логинов Глеб Олегович',
        email: 'loginov@example.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Tournaments',
        description: 'Операции с турнирами'
      },
      {
        name: 'Teams',
        description: 'Операции с командами'
      }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
