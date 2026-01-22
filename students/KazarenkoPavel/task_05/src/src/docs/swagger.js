const swaggerJSDoc = require('swagger-jsdoc');
const config = require('../config/config');

/**
 * Опции для Swagger JSdoc
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🍳 API рецептов',
      version: '1.0.0',
      description: `
        REST API для управления рецептами с категориями и ингредиентами.

        ## Особенности API:

        - **CRUD операции** для рецептов и категорий
        - **Валидация данных** с использованием Zod
        - **Пагинация и фильтрация** для списков
        - **Поиск** по названию, описанию и ингредиентам
        - **Документация OpenAPI** с Swagger UI
        - **Централизованная обработка ошибок**
        - **Временное хранение данных** в памяти

        ## Статус коды:

        - \`200\` - Успешный запрос
        - \`201\` - Ресурс создан
        - \`400\` - Некорректный запрос
        - \`404\` - Ресурс не найден
        - \`409\` - Конфликт данных
        - \`422\` - Ошибка валидации
        - \`500\` - Внутренняя ошибка сервера

        ## Авторизация:

        На данный момент API не требует авторизации. В будущих версиях будет добавлена JWT-аутентификация.
      `,
      contact: {
        name: 'Разработчик API',
        email: 'developer@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/${config.apiVersion}`,
        description: 'Локальный сервер разработки',
      },
      {
        url: 'https://api.example.com/v1',
        description: 'Продакшен сервер',
      },
    ],
    tags: [
      {
        name: 'Recipes',
        description: 'Операции с рецептами',
      },
      {
        name: 'Categories',
        description: 'Операции с категориями',
      },
      {
        name: 'Health',
        description: 'Проверка состояния сервиса',
      },
    ],
    components: {
      schemas: {
        // Ингредиент
        Ingredient: {
          type: 'object',
          required: ['name', 'amount'],
          properties: {
            name: {
              type: 'string',
              description: 'Название ингредиента',
              example: 'Спагетти',
              minLength: 1,
              maxLength: 100,
            },
            amount: {
              type: 'string',
              description: 'Количество ингредиента',
              example: '400 г',
              minLength: 1,
              maxLength: 50,
            },
            unit: {
              type: 'string',
              description: 'Единица измерения',
              example: 'грамм',
              maxLength: 20,
            },
          },
        },

        // Рецепт (полная схема)
        Recipe: {
          type: 'object',
          required: ['id', 'title', 'description', 'category', 'ingredients', 'steps'],
          properties: {
            id: {
              type: 'string',
              description: 'Уникальный идентификатор рецепта',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            title: {
              type: 'string',
              description: 'Название рецепта',
              example: 'Спагетти Карбонара',
              minLength: 1,
              maxLength: 100,
            },
            description: {
              type: 'string',
              description: 'Описание рецепта',
              example: 'Классический итальянский рецепт пасты',
              minLength: 1,
              maxLength: 1000,
            },
            category: {
              type: 'string',
              description: 'ID категории',
              example: 'cat3',
            },
            categoryDetails: {
              $ref: '#/components/schemas/Category',
              description: 'Детали категории (только в ответе)',
            },
            difficulty: {
              type: 'string',
              description: 'Сложность приготовления',
              enum: ['легко', 'средне', 'сложно'],
              default: 'средне',
              example: 'легко',
            },
            time: {
              type: 'integer',
              description: 'Время приготовления в минутах',
              minimum: 1,
              maximum: 1440,
              default: 30,
              example: 25,
            },
            servings: {
              type: 'integer',
              description: 'Количество порций',
              minimum: 1,
              maximum: 100,
              default: 2,
              example: 4,
            },
            image: {
              type: 'string',
              description: 'URL изображения рецепта',
              format: 'url',
              example: 'https://example.com/image.jpg',
            },
            ingredients: {
              type: 'array',
              description: 'Список ингредиентов',
              items: {
                $ref: '#/components/schemas/Ingredient',
              },
              minItems: 1,
              maxItems: 50,
            },
            steps: {
              type: 'array',
              description: 'Шаги приготовления',
              items: {
                type: 'string',
                minLength: 5,
                maxLength: 500,
              },
              minItems: 1,
              maxItems: 50,
              example: [
                'Отварите спагетти в подсоленной воде',
                'Обжарьте бекон до хрустящей корочки',
              ],
            },
            notes: {
              type: 'string',
              description: 'Дополнительные заметки',
              maxLength: 1000,
              example: 'Подавайте сразу после приготовления',
            },
            tags: {
              type: 'array',
              description: 'Теги рецепта',
              items: {
                type: 'string',
                maxLength: 50,
              },
              maxItems: 10,
              example: ['итальянская', 'паста', 'быстро'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания',
              example: '2024-01-15T10:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата последнего обновления',
              example: '2024-01-15T10:30:00Z',
            },
          },
        },

        // Создание рецепта
        CreateRecipe: {
          type: 'object',
          required: ['title', 'description', 'category', 'ingredients', 'steps'],
          properties: {
            title: {
              $ref: '#/components/schemas/Recipe/properties/title',
            },
            description: {
              $ref: '#/components/schemas/Recipe/properties/description',
            },
            category: {
              $ref: '#/components/schemas/Recipe/properties/category',
            },
            difficulty: {
              $ref: '#/components/schemas/Recipe/properties/difficulty',
            },
            time: {
              $ref: '#/components/schemas/Recipe/properties/time',
            },
            servings: {
              $ref: '#/components/schemas/Recipe/properties/servings',
            },
            image: {
              $ref: '#/components/schemas/Recipe/properties/image',
            },
            ingredients: {
              $ref: '#/components/schemas/Recipe/properties/ingredients',
            },
            steps: {
              $ref: '#/components/schemas/Recipe/properties/steps',
            },
            notes: {
              $ref: '#/components/schemas/Recipe/properties/notes',
            },
            tags: {
              $ref: '#/components/schemas/Recipe/properties/tags',
            },
          },
        },

        // Обновление рецепта
        UpdateRecipe: {
          type: 'object',
          properties: {
            title: {
              $ref: '#/components/schemas/Recipe/properties/title',
            },
            description: {
              $ref: '#/components/schemas/Recipe/properties/description',
            },
            category: {
              $ref: '#/components/schemas/Recipe/properties/category',
            },
            difficulty: {
              $ref: '#/components/schemas/Recipe/properties/difficulty',
            },
            time: {
              $ref: '#/components/schemas/Recipe/properties/time',
            },
            servings: {
              $ref: '#/components/schemas/Recipe/properties/servings',
            },
            image: {
              $ref: '#/components/schemas/Recipe/properties/image',
            },
            ingredients: {
              $ref: '#/components/schemas/Recipe/properties/ingredients',
            },
            steps: {
              $ref: '#/components/schemas/Recipe/properties/steps',
            },
            notes: {
              $ref: '#/components/schemas/Recipe/properties/notes',
            },
            tags: {
              $ref: '#/components/schemas/Recipe/properties/tags',
            },
          },
        },

        // Категория
        Category: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: {
              type: 'string',
              description: 'Уникальный идентификатор категории',
              example: 'cat1',
            },
            name: {
              type: 'string',
              description: 'Название категории',
              example: 'Завтрак',
              minLength: 1,
              maxLength: 50,
            },
            description: {
              type: 'string',
              description: 'Описание категории',
              example: 'Рецепты для завтрака',
              maxLength: 200,
            },
            color: {
              type: 'string',
              description: 'Цвет категории в формате HEX',
              pattern: '^#[0-9A-F]{6}$',
              example: '#FF6B6B',
            },
            recipesCount: {
              type: 'integer',
              description: 'Количество рецептов в категории',
              example: 5,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания',
              example: '2024-01-01T00:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата последнего обновления',
              example: '2024-01-01T00:00:00Z',
            },
          },
        },

        // Категория с рецептами
        CategoryWithRecipes: {
          allOf: [
            { $ref: '#/components/schemas/Category' },
            {
              type: 'object',
              properties: {
                recipes: {
                  type: 'array',
                  description: 'Рецепты в категории',
                  items: {
                    $ref: '#/components/schemas/Recipe',
                  },
                },
              },
            },
          ],
        },

        // Создание категории
        CreateCategory: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              $ref: '#/components/schemas/Category/properties/name',
            },
            description: {
              $ref: '#/components/schemas/Category/properties/description',
            },
            color: {
              $ref: '#/components/schemas/Category/properties/color',
            },
          },
        },

        // Обновление категории
        UpdateCategory: {
          type: 'object',
          properties: {
            name: {
              $ref: '#/components/schemas/Category/properties/name',
            },
            description: {
              $ref: '#/components/schemas/Category/properties/description',
            },
            color: {
              $ref: '#/components/schemas/Category/properties/color',
            },
          },
        },

        // Пагинация
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Текущая страница',
              example: 1,
            },
            limit: {
              type: 'integer',
              description: 'Количество элементов на странице',
              example: 10,
            },
            total: {
              type: 'integer',
              description: 'Общее количество элементов',
              example: 42,
            },
            totalPages: {
              type: 'integer',
              description: 'Общее количество страниц',
              example: 5,
            },
            hasNext: {
              type: 'boolean',
              description: 'Есть ли следующая страница',
              example: true,
            },
            hasPrev: {
              type: 'boolean',
              description: 'Есть ли предыдущая страница',
              example: false,
            },
          },
        },

        // Ошибка
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Тип ошибки',
              example: 'Bad Request',
            },
            message: {
              type: 'string',
              description: 'Сообщение об ошибке',
              example: 'Ошибка валидации данных',
            },
            statusCode: {
              type: 'integer',
              description: 'Код статуса HTTP',
              example: 400,
            },
            errors: {
              type: 'array',
              description: 'Детали ошибок валидации',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Поле с ошибкой',
                    example: 'title',
                  },
                  message: {
                    type: 'string',
                    description: 'Сообщение об ошибке',
                    example: 'Название рецепта обязательно',
                  },
                },
              },
            },
            stack: {
              type: 'string',
              description: 'Stack trace (только в development)',
            },
          },
        },
      },
      responses: {
        // Стандартные ответы
        NotFound: {
          description: 'Ресурс не найден',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Not Found',
                message: 'Рецепт не найден',
                statusCode: 404,
              },
            },
          },
        },
        BadRequest: {
          description: 'Некорректный запрос',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Bad Request',
                message: 'Ошибка валидации данных',
                statusCode: 400,
                errors: [
                  {
                    field: 'title',
                    message: 'Название рецепта обязательно',
                  },
                ],
              },
            },
          },
        },
        Conflict: {
          description: 'Конфликт данных',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Conflict',
                message: 'Рецепт с таким названием уже существует',
                statusCode: 409,
              },
            },
          },
        },
        InternalServerError: {
          description: 'Внутренняя ошибка сервера',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Internal Server Error',
                message: 'Внутренняя ошибка сервера',
                statusCode: 500,
              },
            },
          },
        },
      },
      securitySchemes: {
        // Заготовка для будущей авторизации
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
    externalDocs: {
      description: 'GitHub репозиторий проекта',
      url: 'https://github.com/username/recipes-api',
    },
  },
  apis: [
    './src/routes/*.js', // Маршруты
    './src/controllers/*.js', // Контроллеры
    './src/utils/validators.js', // Валидаторы
  ],
};

/**
 * Генерация спецификации Swagger
 */
const swaggerSpec = swaggerJSDoc(swaggerOptions);

/**
 * Функция для генерации документации в JSON
 */
const generateSwaggerJson = () => {
  return JSON.stringify(swaggerSpec, null, 2);
};

module.exports = swaggerSpec;
