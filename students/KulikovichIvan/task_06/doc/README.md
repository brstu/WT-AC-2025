# Лабораторная работа №6

<p align="center">Министерство образования Республики Беларусь</p>
<p align="center">Учреждение образования</p>
<p align="center">"Брестский Государственный технический университет"</p>
<p align="center">Кафедра ИИТ</p>
<br><br><br><br><br><br>
<p align="center"><strong>Лабораторная работа №6</strong></p>
<p align="center"><strong>По дисциплине:</strong> "Веб-технологии"</p>
<p align="center"><strong>Тема:</strong> Базы данных и авторизация (SQLite + JWT)</p>
<br><br><br><br><br><br>
<p align="right"><strong>Выполнил:</strong></p>
<p align="right">Студент 4 курса</p>
<p align="right">Группы АС-63</p>
<p align="right">Куликович И.С.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Изучить подключение базы данных к серверному приложению, реализовать систему авторизации на основе JWT-токенов и обеспечить защиту маршрутов. Перенести CRUD-операции из предыдущей лабораторной работы в базу данных.

## Вариант №11

Сервис бронирований (события/места) с ролями

## Ход выполнения работы

### 1. Структура проекта

```bash
src/
├── server.js          # Основной файл сервера
├── seed.js            # Заполнение БД тестовыми данными
├── package.json       # Зависимости проекта
├── .env               # Переменные окружения
├── .env.example       # Пример файла конфигурации
├── .gitignore         # Файлы для игнорирования
└── database.db        # База данных SQLite
```

---

### 2. Реализованные элементы

#### Основные компоненты

- **База данных SQLite** с таблицами: `users`, `events`, `bookings`
- **Регистрация и аутентификация** пользователей
- **JWT-токены** для авторизации
- **Хеширование паролей** с помощью bcrypt
- **CRUD-операции** для событий и бронирований
- **Middleware** для защиты маршрутов
- **Разграничение доступа** по ролям: `user`, `organizer`, `admin`
- **Связь бронирований** с пользователями и событиями через внешние ключи

---

#### Схема базы данных

| **Таблица `users`**       |
|---------------------------|
| `id` (INTEGER PRIMARY KEY)|
| `username` (TEXT UNIQUE)  |
| `password` (TEXT)         |
| `role` (TEXT)             |

| **Таблица `events`**      |
|---------------------------|
| `id` (INTEGER PRIMARY KEY)|
| `title` (TEXT)            |
| `description` (TEXT)      |
| `date` (TEXT)             |
| `location` (TEXT)         |
| `maxParticipants` (INTEGE)|
| `organizerId` (INTEGER)   |
| `status` (TEXT)           |

| **Таблица `bookings`**    |
|---------------------------|
| `id` (INTEGER PRIMARY KEY)|
| `userId` (INTEGER)        |
| `eventId` (INTEGER)       |
| `bookingDate` (TEXT)      |
| `status` (TEXT)           |
| `participantsCount`(INTEG)|
| `UNIQUE(userId, eventId)` |

---

#### Эндпоинты API

| **Авторизация**                     |
|-------------------------------------|
| `POST /api/auth/signup`             |
| `POST /api/auth/login`              |

| **События**                         |
|-------------------------------------|
| `GET /api/events`                   |
| `GET /api/events/:id`               |
| `POST /api/events`                  |
| `PUT /api/events/:id`               |
| `DELETE /api/events/:id`            |

| **Бронирования**                    |
|-------------------------------------|
| `GET /api/bookings`                 |
| `GET /api/bookings/event/:eventId`  |
| `POST /api/events/:eventId/book`    |
| `PUT /api/bookings/:id`             |
| `DELETE /api/bookings/:id`          |

---

### 3. Инструкция по запуску

#### Установка зависимостей

```bash
cd src
npm install
```

#### Настройка окружения

Скопируйте `.env.example` в `.env` и измените параметры при необходимости:

```ini
PORT=3000
JWT_SECRET=your_very_secure_secret_key_change_this_in_production
DB_PATH=./database.db
```

#### Заполнение БД тестовыми данными

```bash
npm run seed
```

Будут созданы пользователи:

- `петров` / `user123` (роль: `user`)
- `сидорова` / `user123` (роль: `user`)
- `организатор` / `organizer123` (роль: `organizer`)
- `admin` / `admin123` (роль: `admin`)

#### Запуск сервера

```bash
npm start
```

Сервер запустится на [http://localhost:3000](http://localhost:3000).

---

### 4. Примеры использования API

#### Регистрация

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"новый","password":"123456","role":"user"}'
```

#### Вход

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"петров","password":"user123"}'
```

#### Создание события (только `organizer`/`admin`)

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Концерт классической музыки",
    "description": "Вечер классической музыки в филармонии",
    "date": "2025-12-20T19:00:00",
    "location": "Брестская филармония",
    "maxParticipants": 200,
    "status": "active"
  }'
```

#### Бронирование события

```bash
curl -X POST http://localhost:3000/api/events/1/book \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "participantsCount": 2
  }'
```

#### Получение всех бронирований пользователя

```bash
curl -X GET http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Вывод

В ходе выполнения лабораторной работы был создан сервис бронирований событий с использованием базы данных SQLite и JWT-авторизации. Реализованы основные CRUD-операции для работы с событиями и бронированиями, система регистрации и аутентификации пользователей с хешированием паролей. Особенностью системы является проверка доступности мест при бронировании и уникальность бронирования для каждого пользователя на каждое событие. Освоены навыки работы с базами данных, сложными связями между таблицами и системами авторизации в Node.js-приложениях.
