# Linguistic tracker API

REST API для управления задачами с JWT аутентификацией и SQLite БД. Лабораторная работа 06.
Вариант - 32.
Выполнил - Иванюк Иван.

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
Content-Type: application/json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}

### Логин

POST /api/auth/login
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "password123"
}

Возвращает JWT токен.

## Слова (требуется токен)

Добавить заголовок: Authorization: Bearer token

* GET /api/words - Список слов
* GET /api/words/:id - Слово по ID
* POST /api/words - Создать слово
* PUT /api/words/:id - Обновление слова
* DELETE /api/words/:id - Удалить слово
* PATCH /api/words/:id/progress - Обновление прогресса

## Тестовые пользователи

После npm run seed:

* Пользователь: test@example.com / password123
* 5 слов на разных языках
* 2 заметки

## Структура проекта
task_06/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── words.controller.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models/
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── words.routes.js
│   ├── utils/
│   │   └── helpers.js
│   └── app.js
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── .env
├── .env.example
├── package.json
└── seed.js

## Скрипты

* npm run dev - Запуск
* npm run db:migrate - Миграции БД
* npm run db:seed - Тестовые данные
* npm run db:studio - GUI для БД

## Документация

Swagger UI: <http://localhost:3000/api>
