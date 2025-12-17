# Game Collection API

REST API для управления коллекцией игр с оценками пользователей. JWT аутентификация и SQLite БД. Лабораторная работа 06.
Вариант - 17.
Выполнил - Поплавский Владислав.

## Технологии

* Node.js + Express + TypeScript
* Prisma ORM + SQLite
* JWT аутентификация
* Bcrypt для хеширования паролей
* CORS + Helmet для безопасности

## Установка

* npm install
* cp .env.example .env
* npm run db:generate
* npm run db:migrate
* npm run db:seed
* npm run dev

## Аутентификация

### Регистрация

POST /api/auth/signup
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}

### Логин

POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Возвращает JWT токен для использования в запросах
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "username": "username",
      "role": "USER"
    }
  }
}

## Игры (требуется токен)

Добавить заголовок: Authorization: Bearer <ваш_токен>

### Создание игры

POST /api/games
{
  "title": "The Witcher 3: Wild Hunt",
  "description": "Action RPG от CD Projekt Red",
  "genre": "RPG",
  "platform": "PC",
  "releaseYear": 2015,
  "rating": 9.7,
  "imageUrl": "https://example.com/witcher3.jpg"
}

### Получение списка игр

GET /api/games

## Фильтрация

* genre=RPG - фильтр по жанру
* platform=PC - фильтр по платформе
* minRating=8&maxRating=10 - фильтр по рейтингу
* minYear=2015&maxYear=2020 - фильтр по году
* search=witcher - поиск по названию/описанию

## Получение статистики

GET /api/games/stats

Пример ответа:
{
  "totalGames": 5,
  "averageRating": 9.22,
  "byGenre": { "RPG": 2, "Action": 3 },
  "byPlatform": { "PC": 3, "PlayStation": 2 }
}

## Получение конкретной игры

GET /api/games/:id

## Обновление игры

PUT /api/games/:id
{
  "title": "Updated Title",
  "rating": 9.5
}

## Удаление игры

DELETE /api/games/:id

## Профиль пользователя

GET /api/auth/profile - Получение профиля текущего пользователя

## Тестовые пользователи

После выполнения npm run prisma:seed создается тестовый пользователь:
* Email: test@example.com
* Пароль: password123
* Роль: USER
Автоматически создается 5 тестовых игр в коллекции пользователя.

## Структура проекта

game-collection-api/
├── src/
│   ├── config/
│   │   └── database.ts          # Конфигурация Prisma
│   ├── controllers/
│   │   ├── auth.controller.ts   # Контроллеры аутентификации
│   │   └── games.controller.ts  # Контроллеры игр
│   ├── middleware/
│   │   ├── auth.middleware.ts   # Middleware аутентификации
│   │   ├── error.middleware.ts  # Обработка ошибок
│   │   └── validation.middleware.ts # Валидация данных
│   ├── models/
│   │   ├── User.ts              # Типы пользователя
│   │   └── Game.ts              # Типы игры
│   ├── routes/
│   │   ├── auth.routes.ts       # Маршруты аутентификации
│   │   └── games.routes.ts      # Маршруты игр
│   ├── services/
│   │   ├── auth.service.ts      # Логика аутентификации
│   │   └── game.service.ts      # Логика работы с играми
│   ├── utils/
│   │   ├── validation.ts        # Схемы валидации Zod
│   │   └── logger.ts            # Логирование
│   └── index.ts                 # Основной файл приложения
├── prisma/
│   ├── schema.prisma            # Схема базы данных
│   └── seed.ts                  # Сид базы данных
├── .env.example                 # Пример переменных окружения
├── package.json                 # Зависимости и скрипты
├── tsconfig.json                # Конфигурация TypeScript
└── README.md                    # Эта документация

## Скрипты

* npm run dev - Запуск сервера в режиме разработки
* npm run db:migrate - Применение миграций базы данных
* npm run db:seed - Заполнение БД тестовыми данными
* npm run db:studio - Запуск Prisma Studio (GUI для БД)
* npm run build - Сборка TypeScript в JavaScript
* npm start - Запуск собранного приложения
* npm run prisma:generate -Генерация Prisma клиента
