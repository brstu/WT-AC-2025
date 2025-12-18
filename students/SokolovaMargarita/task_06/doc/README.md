# Лабораторная работа 06. Базы данных и авторизация (SQLite/PostgreSQL + ORM + JWT)

Министерство образования Республики Беларусь

Учреждение образования: "Брестский Государственный технический университет"

Кафедра: ИИТ

Вариант: 19

Выполнил(а): Соколова М. А.

Группа: АС-63

Проверил: Несюк А.Н.

Брест, 2025

## Краткое описание

**Хранилище документов с правами доступа**
Проект реализует REST API для работы с документами с приватным/публичным доступом и системой аутентификации на JWT с использованием Prisma ORM.

API содержит маршруты для регистрации, входа/обновления токенов, восстановления пароля, и CRUD операций с документами (с проверкой владельца).

---

**Основные технологии:** Express.js, Prisma (SQLite для разработки), JWT, `bcrypt`, `express-validator`, `dotenv`.

---

**Файловая структура (важные файлы и папки):**

```text
task_06/
├── src/
│   ├── index.js              # Express приложение (экспорт для тестов)
│   ├── package.json          # Зависимости и скрипты (в проекте package.json находится в `src`)
│   ├── prisma/               # Prisma schema и миграции
│   │   └── schema.prisma
│   ├── routes/
│   │   ├── auth.js           # Роуты аутентификации
│   │   └── documents.js      # CRUD для документов
│   ├── middlewares/
│   │   └── auth.js           # JWT middleware и проверка ролей
│   └── prisma.js             # Prisma client wrapper
├── doc/
│   └── README.md             # Отчёт 
└── tests/
 └── api.test.js           # Тесты (запуск: `npm test` в `src`)
```

---

## 1. Схема данных (Prisma)

Основные модели в `src/prisma/schema.prisma`:

- `User` — поля: `id`, `email` (unique), `passwordHash`, `role`, связи с документами и токенами
- `Document` — поля: `id`, `title`, `content?`, `accessLevel` (private|public), `ownerId` и связь с `User`
- `RefreshToken` — хранение refresh токенов с `expiresAt`
- `ResetToken` — одноразовые токены для сброса пароля с `expiresAt`

Эта схема обеспечивает хранение пользователей, связанных документов и механизмов обновления/сброса пароля.

---

## 2. Endpoints

Все роуты находятся под префиксом, см. `src/index.js`:

- `POST /api/auth/signup` — регистрация нового пользователя
- `POST /api/auth/login` — вход, возвращает `accessToken` и `refreshToken`
- `POST /api/auth/refresh` — обмен `refreshToken` на новый `accessToken`
- `POST /api/auth/reset-request` — запрос на сброс пароля (логирование reset-ссылки в консоль в dev)
- `POST /api/auth/reset` — сброс пароля по токену

- `GET /api/documents` — получить список документов (фильтрация/пагинация)
- `POST /api/documents` — создать документ (требуется авторизация)
- `GET /api/documents/:id` — получить один документ (проверка доступа по `accessLevel` и владельцу)
- `PATCH /api/documents/:id` — частичное обновление (только владелец)
- `DELETE /api/documents/:id` — удаление (только владелец)

Примеры запросов и форматов ответов описаны в тестах и в коде роутов (`src/routes/*.js`).

---

## 3. Безопасность и валидация

- CORS включён глобально (`src/index.js`).
- Ограничение размера тела запроса: `1mb` (см. `express.json({ limit: '1mb' })`).
- Rate limiting для аутентификации: 10 запросов / 15 минут (`express-rate-limit` в `src/routes/auth.js`).
- Секреты и параметры конфигурации берутся из `.env` (см. ниже).
- Пароли хранятся как хеш: используется `bcrypt.hash(password, 10)` и `bcrypt.compare`.
- JWT подпись/проверка: используется `jsonwebtoken` и переменная окружения `JWT_SECRET`.
- Валидация входных данных реализована через `express-validator` в `src/routes/auth.js` (и аналогично в других роутерах).

---

## 4. Password reset flow

- `POST /api/auth/reset-request` создаёт одноразовый reset-токен (1 час) и сохраняет в таблице `ResetToken`.
- В dev-режиме ссылка с токеном логируется в консоль (см. `src/routes/auth.js`).
- `POST /api/auth/reset` принимает `token` и `newPassword`, проверяет токен и обновляет хеш пароля.
- После смены пароля рекомендуется инвалидировать существующие refresh-токены пользователя.

---

## 5. Тесты

- Тесты расположены в `tests/` (файл `tests/api.test.js`).
- Для запуска тестов выполните в папке `src`:

```powershell
cd src
npm test
```

Проект использует `jest` и `supertest` для интеграционных/модульных тестов.

Результат проверки:

![alt text](img/tests.png)

---

## 6. Инструкции по установке и запуску

1. Клонируйте репозиторий (если используете Git):

```powershell
git clone <repo-url>
cd task_06
```

1. Установите зависимости (в каталоге `src`, т.к. `package.json` находится в `src`):

```powershell
cd src
npm install
```

1. Настройте `.env`.

- Если есть файл `src/.env.example`, скопируйте его в `.env` и заполните значения.
  
- Если файла нет, создайте `src/.env` со следующими переменными (пример):

```text
DATABASE_URL="file:./dev.db"  # SQLite, или postgresql://user:pass@host:port/db
JWT_SECRET="your_super_secret_key"  # Сгенерируйте сильный ключ
PORT=8001  # Порт сервера
```

1. Миграции БД:

```powershell
npx prisma migrate dev --name init_with_tokens
```

Это создаст/обновит БД (например `dev.db` для SQLite) и применит схему.

1. Seed данных (краткий):

Запустите скрипт для начального заполнения (в `src`):

```powershell
node src/seed.js
```

Пример seed: создаёт 2 пользователя и 3 документа.

- `user@example.com` — роль `user`, документы: приватный и публичный
- `admin@example.com` — роль `admin`, приватный документ
Пароль для всех: `password123` (хешируется в seed).

1. Запуск сервера (в `src`):

```powershell
node src/index.js
```

Сервер будет доступен по `http://localhost:8001` (или по `PORT` из `.env`).

. Тестирование:

```powershell
cd src
npm test
```

Если у вас нет `jest`/`supertest` установите их как dev-зависимости:

```powershell
npm install --save-dev jest supertest
```

1. Примечания по структуре и скриптам:

- Источник сервера и логика находятся в `src/` (`index.js`, `routes/`, `middlewares/`, `prisma.js`).
- ORM: Prisma — схема находится в `src/prisma/schema.prisma`, клиент создаётся в `src/prisma.js`.
- Seed-скрипт: `src/seed.js` (создаёт пользователей и документы).
- Миграции и генерация клиента Prisma: используйте `npx prisma migrate dev` / `npx prisma db push` и `npx prisma generate` при необходимости.

---

## 7. Как работать с аутентификацией и CRUD

1) Регистрация / вход

- `POST /api/auth/signup` — регистрация. Тело JSON: `{ "email": "user@example.com", "password": "password123" }`.
- `POST /api/auth/login` — вход. Тело JSON: `{ "email": "user@example.com", "password": "password123" }`.

Ответ на `login` содержит `accessToken` и `refreshToken`:

```json
{
 "accessToken": "eyJ...",
 "refreshToken": "eyJ..."
}
```

1) Использование accessToken для CRUD

- Для защищённых маршрутов указывайте заголовок:

```text
Authorization: Bearer <accessToken>
```

- Пример — создание документа:

POST /api/documents
Headers: `Authorization: Bearer <accessToken>`
Body JSON:

```json
{
 "title": "Новый документ",
 "content": "Содержимое",
 "accessLevel": "private"  // или "public"
}
```

- Получение списка документов (GET /api/documents) — возвращает документы с учётом `accessLevel` и владельца.

- Получение одного документа: `GET /api/documents/:id`.

- Обновление: `PATCH /api/documents/:id` — только владелец может обновить.

- Удаление: `DELETE /api/documents/:id` — только владелец может удалить.

1) Refresh / Logout / Reset

- `POST /api/auth/refresh` — тело `{ "refreshToken": "..." }` — вернёт новый `accessToken`.
- `POST /api/auth/reset-request` — тело `{ "email": "user@example.com" }` — в dev логирует ссылку в консоль.
- `POST /api/auth/reset` — тело `{ "token": "...", "newPassword": "..." }`.

---

## 8. HTTP проверка (для VS Code REST Client)

В репозитории добавлен файл `tests/tests.http` с примером последовательности запросов: регистрация, вход, создание документа, получение списка.

---
