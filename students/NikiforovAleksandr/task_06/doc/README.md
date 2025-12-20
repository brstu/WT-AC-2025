# Лабораторная работа №06 — Форум/сообщество с ролями и модерацией

**Вариант №16: Форум/сообщество с ролями и модерацией.**

---

## Цель работы

Изучить подключение базы данных к серверному приложению, реализовать систему авторизации на основе JWT-токенов и обеспечить защиту маршрутов. Перенести CRUD-операции из предыдущей лабораторной работы в базу данных.

---

## Ход выполнения работы

### 1. Структура проекта

```bash
src/
├── server.js         — основной файл сервера
├── seed.js           — заполнение БД тестовыми данными
├── package.json      — зависимости проекта
├── .env              — переменные окружения
└── database.db       — база данных SQLite (создается автоматически)
```

---

### 2. Реализованные элементы

**Основные компоненты:**

* База данных SQLite с таблицами `users` и `tasks`
* Регистрация и аутентификация пользователей
* JWT-токены для авторизации
* Хеширование паролей с помощью bcrypt
* CRUD операции для задач/топиков форума
* Middleware для защиты маршрутов
* Разграничение доступа по ролям (`user`, `admin`)
* Связь задач с владельцами через `ownerId`

**Схема базы данных:**

Таблица `users`:

* `id` (INTEGER PRIMARY KEY)
* `username` (TEXT UNIQUE)
* `password` (TEXT) — хешированный
* `role` (TEXT) — роль пользователя (`user`, `admin`)

Таблица `tasks`:

* `id` (INTEGER PRIMARY KEY)
* `title` (TEXT)
* `done` (INTEGER) — 0/1
* `ownerId` (INTEGER) — внешний ключ на `users.id`

---

**Эндпоинты API:**

**Авторизация:**

* `POST /api/auth/signup` — регистрация нового пользователя
* `POST /api/auth/login` — вход в систему

**Задачи/топики (требуют токен):**

* `GET /api/tasks` — получить все задачи текущего пользователя (или все для admin)
* `GET /api/tasks/:id` — получить задачу по ID
* `POST /api/tasks` — создать новую задачу
* `PUT /api/tasks/:id` — обновить задачу
* `DELETE /api/tasks/:id` — удалить задачу

---

## Инструкция по запуску

### Установка зависимостей

```bash
cd src
npm install
```

### Настройка окружения

Скопируйте `.env.example` в `.env` и при необходимости измените параметры:

```env
PORT=3000
JWT_SECRET=super_secure_jwt_key
DB_PATH=./database.db
```

---

### Заполнение БД тестовыми данными

```bash
npm run seed
```

Будут созданы пользователи:

* `user1` / `user123` (роль: user)
* `user2` / `user123` (роль: user)
* `admin` / `admin123` (роль: admin)

И тестовые задачи:

* `Первая тема форума` — пользователь `user1`
* `Вторая тема` — пользователь `user1`
* `Админская тема` — пользователь `admin`

---

### Запуск сервера

```bash
npm start
```

Сервер запустится на `http://localhost:3000`

---

### Примеры использования API

**Регистрация:**

```http
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "username": "новый_пользователь",
  "password": "123456",
  "role": "user"
}
```

**Вход:**

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "user1",
  "password": "user123"
}
```

**Создание задачи (только user или admin):**

```http
POST http://localhost:3000/api/tasks
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "title": "Новая тема форума"
}
```

**Обновление задачи:**

```http
PUT http://localhost:3000/api/tasks/1
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "title": "Обновлённая тема"
}
```

**Удаление задачи:**

```http
DELETE http://localhost:3000/api/tasks/1
Authorization: Bearer YOUR_TOKEN
```

## Вывод

В ходе выполнения лабораторной работы была создана система форума с ролями и задачами пользователей с использованием SQLite и JWT-авторизации. Реализованы CRUD-операции для задач, регистрация и вход пользователей с хешированием паролей, настроена защита маршрутов и разграничение доступа по ролям. Освоены навыки работы с базами данных, JWT, middleware и авторизацией в Node.js приложениях.
