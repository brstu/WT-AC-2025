const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Arts & Galleries API',
      version: '1.0.0',
      description: `
# API для управления артами и галереями с лайками

Этот REST API предоставляет полный набор эндпоинтов для управления:
- **Артами** — отдельные произведения искусства
- **Галереями** — выставки и коллекции артов

## Возможности
- Полный CRUD для артов и галерей
- Лайки для артов и галерей
- Поиск по тексту
- Фильтрация и сортировка
- Пагинация
- Валидация данных
- Централизованная обработка ошибок

## Коды статусов
- \`200\` - Успешный запрос
- \`201\` - Ресурс создан
- \`204\` - Успешное удаление
- \`400\` - Некорректный запрос
- \`404\` - Ресурс не найден
- \`422\` - Ошибка валидации
- \`500\` - Внутренняя ошибка сервера
      `,
      contact: {
        name: 'Крагель Алина Максимовна',
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
        name: 'Arts',
        description: 'Операции с артами'
      },
      {
        name: 'Galleries',
        description: 'Операции с галереями'
      }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;