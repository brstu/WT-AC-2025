# Лабораторная работа №6

<p align="center">Министерство образования Республики Беларусь</p>
<p align="center">Учреждение образования</p>
<p align="center">"Брестский Государственный технический университет"</p>
<p align="center">Кафедра ИИТ</p>
<br><br><br><br><br><br>
<p align="center"><strong>Лабораторная работа №6</strong></p>
<p align="center"><strong>По дисциплине:</strong> "Веб-технологии"</p>
<p align="center"><strong>Тема:</strong> "Базы данных и авторизация (SQLite/PostgreSQL + ORM + JWT)"</p>
<br><br><br><br><br><br>
<p align="right"><strong>Выполнил:</strong></p>
<p align="right">Студент 4 курса</p>
<p align="right">Группы АС-64</p>
<p align="right">Бурак И. Э.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Подключение БД к серверному приложению, реализация авторизации на базе JWT и защита маршрутов. Перенос CRUD из ЛР‑05 в БД.

- Настроить ORM и схему данных (SQLite/PostgreSQL).
- Реализовать регистрацию/логин, выдачу JWT, middleware защиты и доступ к задачам только владельца.

---

### Вариант №29 - Сервис заметок с метками и ролями

## Ход выполнения работы

### 1. Структура проекта

Проект организован следующим образом:

```
task_06/
├── doc/
│   ├── README.md
│   └── screenshots/
│       ├── screenshot1.png
│       ├── screenshot2.png
│       └── screenshot3.png
└── src/
    ├── prisma/
    │   └── schema.prisma
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── package.json
    ├── seed.js
    └── server.js
```

**Описание файлов:**

- `server.js` — главный файл сервера с Express и всеми эндпоинтами
- `prisma/schema.prisma` — схема базы данных с моделями User и Note
- `.env` — переменные окружения (не в репозитории)
- `.env.example` — пример конфигурации
- `seed.js` — скрипт для заполнения БД тестовыми данными
- `package.json` — зависимости и скрипты проекта

### 2. Реализованные элементы

**База данных и ORM:**
- Использована ORM Prisma с SQLite
- Созданы модели User и Note с связью один-ко-многим
- Поле ownerId (userId) связывает заметки с пользователями
- Реализованы миграции через Prisma

**Авторизация:**
- Эндпоинт регистрации `/api/auth/signup`
- Эндпоинт входа `/api/auth/login`
- Хеширование паролей с использованием bcrypt
- Выдача JWT токенов при успешной авторизации
- Middleware `checkToken` для защиты маршрутов

**CRUD операции с заметками:**
- `GET /api/notes` — получение всех заметок пользователя
- `POST /api/notes` — создание новой заметки
- `GET /api/notes/:id` — получение конкретной заметки
- `PUT /api/notes/:id` — обновление заметки
- `DELETE /api/notes/:id` — удаление заметки
- `GET /api/notes/search/tags` — поиск по меткам

**Безопасность:**
- CORS включен для кросс-доменных запросов
- Использование переменных окружения для секретов
- Защита всех маршрутов заметок через Bearer токен
- Проверка владельца перед доступом к заметкам

### 3. Инструкция по запуску

**Установка зависимостей:**

```bash
cd src
npm install
```

**Настройка окружения:**
1. Скопировать `.env.example` в `.env`
2. При необходимости изменить параметры

**Инициализация базы данных:**

```bash
npx prisma generate
npx prisma migrate dev --name init
```

**Заполнение тестовыми данными:**

```bash
node seed.js
```

**Запуск сервера:**

```bash
npm start
```

Сервер будет доступен по адресу `http://localhost:3000`

### 4. Примеры использования API

**Регистрация нового пользователя:**

```bash
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "mypassword",
  "name": "Иван Иванов"
}

```

**Вход в систему:**

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "mypassword"
}
```

Ответ содержит токен:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Иван Иванов"
  }
}
```

**Создание заметки (требуется токен):**

```bash
POST http://localhost:3000/api/notes
Authorization: Bearer <ваш_токен>
Content-Type: application/json

{
  "title": "Моя заметка",
  "content": "Текст заметки",
  "tags": "работа,важное"
}
```

**Получение всех заметок:**

```bash
GET http://localhost:3000/api/notes
Authorization: Bearer <ваш_токен>
```

**Обновление заметки:**

```bash
PUT http://localhost:3000/api/notes/1
Authorization: Bearer <ваш_токен>
Content-Type: application/json

{
  "title": "Обновленная заметка",
  "content": "Новый текст",
  "tags": "личное"
}
```

**Удаление заметки:**

```bash
DELETE http://localhost:3000/api/notes/1
Authorization: Bearer <ваш_токен>
```

**Поиск по меткам:**

```bash
GET http://localhost:3000/api/notes/search/tags?tag=работа
Authorization: Bearer <ваш_токен>
```

### 5. Тестовые данные

После выполнения `node seed.js` будут созданы:

- Пользователь: `test@test.com` / `password123`
- Несколько тестовых заметок

### 6. Скриншоты выполненной лабораторной работы

**Регистрация пользователя:**

![Регистрация пользователя](./screenshots/screenshot1.png)

**Вход и получение токена:**

![Вход в систему и получение JWT токена](./screenshots/screenshot2.png)

**CRUD операции с заметками:**

![CRUD операции с заметками](./screenshots/screenshot3.png)

---

## Таблица критериев

| Критерий | Выполнено |
|----------|-----------|
| Схема БД/миграции (User, Note с ownerId) | ✅ |
| CRUD операции + связь с пользователем | ✅ |
| Безопасность (хеши паролей, JWT, защита маршрутов, CORS) | ✅ |
| Качество кода/архитектуры | ✅ |
| Тесты/валидность | ❌ |
| Документация/инструкция | ✅ |

### Дополнительные бонусы

| Бонус | Выполнено |
|-------|-----------|
| Refresh‑токены и обновление access‑токена | ❌ |
| Роли/права (admin/user) | ✅ |
| Password reset flow | ❌ |
| Поиск по меткам | ✅ |

---

## Использованные технологии

- **Node.js** — серверная платформа
- **Express** — веб-фреймворк
- **Prisma** — ORM для работы с БД
- **SQLite** — реляционная база данных
- **JWT** — JSON Web Tokens для авторизации
- **bcrypt** — хеширование паролей
- **CORS** — поддержка кросс-доменных запросов

---

## Вывод

В ходе выполнения лабораторной работы был разработан серверный API для сервиса заметок с полноценной авторизацией и работой с базой данных. Реализованы все основные требования: настроена ORM Prisma с SQLite, созданы модели User и Note, реализована регистрация и вход с выдачей JWT токенов, все CRUD операции защищены middleware авторизации. Пользователи могут видеть и редактировать только свои заметки. Также добавлена возможность поиска заметок по меткам. Освоены навыки работы с ORM, миграциями БД, JWT авторизацией и защитой API endpoints.
