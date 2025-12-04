# Academic Portfolio API

REST API для управления задачами с JWT аутентификацией и SQLite БД. Лабораторная работа 06.
Вариант - 20.
Выполнил - Стельмашук Иван.

## Установка

* npm install
* cp .env.example .env
* npm run db:generate
* npm run db:migrate
* npm run db:seed
* npm run dev

## Аутентификация

### Регистрация

POST /api/auth/register
{
  "email": "<user@example.com>",
  "password": "password",
  "name": "Имя"
}

### Логин

POST /api/auth/login
{
  "email": "<user@example.com>",
  "password": "password"
}

Возвращает JWT токен.

## Задачи (требуется токен)

Добавить заголовок: Authorization: Bearer token

* GET /api/tasks - Список задач
* GET /api/tasks/:id - Задача по ID
* POST /api/tasks - Создать задачу
* PATCH /api/tasks/:id - Обновить задачу
* DELETE /api/tasks/:id - Удалить задачу

## Тестовые пользователи

После npm run db:seed:

* <admin@university.edu> / admin123 (админ)

* <user@university.edu> / user123 (пользователь)

* <test@university.edu> / test123 (пользователь)

## Структура проекта

src/
├── app.js                  # Основной файл приложения
├── config/
│   └── database.js        # Конфигурация Prisma
├── middleware/
│   ├── auth.js           # Middleware аутентификации
│   ├── errorHandler.js   # Обработка ошибок
│   ├── rateLimit.js      # Ограничение запросов
│   └── validate.js       # Валидация данных
├── routes/
│   ├── auth.js           # Маршруты аутентификации
│   └── tasks.js          # Маршруты задач
├── utils/
│   └── crypto.js         # Хеширование и JWT
└── validation/
    └── schemas.js        # Схемы валидации Zod

prisma/
├── schema.prisma         # Схема базы данных
└── seed.js              # Сид базы данных

## Скрипты

* npm run dev - Запуск
* npm run db:migrate - Миграции БД
* npm run db:seed - Тестовые данные
* npm run db:studio - GUI для БД

## Документация

Swagger UI: <http://localhost:3000/docs>
