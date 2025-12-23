# Лабораторная работа №06

<p align="center">Министерство образования Республики Беларусь</p>
<p align="center">Учреждение образования</p>
<p align="center">"Брестский Государственный технический университет"</p>
<p align="center">Кафедра ИИТ</p>
<br><br><br><br><br><br>
<p align="center"><strong>Лабораторная работа №06</strong></p>
<p align="center"><strong>По дисциплине:</strong> "Веб-технологии"</p>
<p align="center"><strong>Тема:</strong> Базы данных и авторизация (SQLite/PostgreSQL + ORM + JWT)</p>
<br><br><br><br><br><br>
<p align="right"><strong>Выполнил:</strong></p>
<p align="right">Студент 4 курса</p>
<p align="right">Группы АС-63</p>
<p align="right">Козлович А. А.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Подключение БД к серверному приложению, реализация авторизации на базе JWT и защита маршрутов. Перенос CRUD из ЛР-05 в БД.

Задачи:

- Настроить ORM и схему данных (SQLite).
- Реализовать регистрацию/логин, выдачу JWT, middleware защиты и доступ к задачам только владельца.
- Обеспечить базовую безопасность приложения.

---

### Вариант №7

**Тема:** Сервис объявлений с JWT-авторизацией и модерацией

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
    ├── server.js
    ├── package.json
    ├── .env.example
    ├── .gitignore
    ├── seed.sql
    └── database.db (создается при запуске)
```

**Описание файлов:**

- `server.js` — основной серверный файл с Express и API
- `package.json` — зависимости проекта
- `.env.example` — пример конфигурации
- `seed.sql` — SQL скрипт с тестовыми данными
- `database.db` — база данных SQLite

### 2. Реализованные элементы

В рамках лабораторной работы реализовано:

#### База данных

- SQLite база данных с двумя таблицами: `users` и `ads`
- Таблица `users`: id, username, password, email, created_at
- Таблица `ads`: id, title, description, price, owner_id, status, created_at, category
- Автоматическое создание таблиц при запуске сервера

#### Авторизация

- Регистрация пользователей (`POST /api/auth/signup`)
- Вход в систему (`POST /api/auth/login`)
- Хеширование паролей с использованием bcrypt
- Генерация JWT токенов для авторизованных пользователей
- Middleware для защиты маршрутов

#### CRUD операции для объявлений

- Создание объявления (`POST /api/ads`)
- Получение всех объявлений (`GET /api/ads`)
- Получение своих объявлений (`GET /api/ads/my`)
- Получение объявления по ID (`GET /api/ads/:id`)
- Обновление объявления (`PUT /api/ads/:id`)
- Удаление объявления (`DELETE /api/ads/:id`)
- Модерация объявлений (`PATCH /api/ads/:id/moderate`)

#### Безопасность

- Хеширование паролей (bcrypt с 10 раундами)
- JWT токены со сроком действия 24 часа
- Проверка владельца при редактировании/удалении объявлений
- Middleware авторизации для защищенных маршрутов

### 3. Инструкция по запуску

#### Установка зависимостей

```bash
cd src
npm install
```

#### Запуск сервера

```bash
npm start
```

Сервер запустится на порту 3000.

#### Заполнение тестовыми данными

После запуска сервера выполните:

```bash
npm run seed
```

Или отправьте POST запрос на `http://localhost:3000/api/seed`

### 4. Примеры использования API

#### Регистрация пользователя

```bash
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.ru"
}
```

#### Вход в систему

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

Ответ содержит токен:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser"
  }
}
```

#### Создание объявления (требуется токен)

```bash
POST http://localhost:3000/api/ads
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Продам холодильник",
  "description": "Отличное состояние",
  "price": 15000,
  "category": "бытовая техника"
}
```

#### Получение всех объявлений (требуется токен)

```bash
GET http://localhost:3000/api/ads
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Обновление объявления (требуется токен, только владелец)

```bash
PUT http://localhost:3000/api/ads/1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Продам холодильник (срочно)",
  "price": 12000
}
```

#### Модерация объявления (требуется токен)

```bash
PATCH http://localhost:3000/api/ads/1/moderate
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "status": "одобрено"
}
```

### 5. Скриншоты выполненной лабораторной работы

#### Вход и получение токена

![Вход в систему](https://placehold.co/800x500/2196F3/white?text=%D0%92%D1%85%D0%BE%D0%B4+%D0%B2+%D1%81%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D1%83+JWT)

**Описание:** Авторизация пользователя через POST /api/auth/login. В ответ возвращается JWT токен, который используется для доступа к защищенным маршрутам.

#### Создание и получение объявлений

![CRUD операции](https://placehold.co/800x500/FF9800/white?text=CRUD+%D0%BE%D0%B1%D1%8A%D1%8F%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D0%B9)

**Описание:** Создание нового объявления (POST /api/ads) и получение списка объявлений пользователя (GET /api/ads/my). Доступ только для авторизованных пользователей с валидным JWT токеном.

---

## Таблица критериев

| Критерий                                | Выполнено |
|------------------------------------------|-----------|
| Схема БД/миграции | ✅ |
| CRUD + связь с пользователем | ✅ |
| Безопасность (хеши, JWT, защита маршрутов) | ✅ |
| Качество кода/архитектуры | ✅ |
| Тесты/валидность | ❌ |
| Документация/инструкция | ✅ |

### Дополнительные бонусы

| Бонус                                     | Выполнено |
|-------------------------------------------|-----------|
| Refresh-токены и обновление access-токена | ❌ |
| Роли/права (admin/user) | ❌ |
| Password reset flow | ❌ |

---

## Вывод

В ходе выполнения лабораторной работы был реализован сервис объявлений с JWT-авторизацией. Использовались технологии: Node.js, Express, SQLite, bcrypt, jsonwebtoken.

Реализованы основные функции: регистрация и авторизация пользователей, CRUD операции для объявлений с проверкой прав доступа, хеширование паролей и защита маршрутов с помощью JWT токенов.

Работа с базой данных организована через SQLite с автоматическим созданием таблиц. Реализована связь между пользователями и объявлениями через owner_id.
