# Сервис объявлений - API

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск сервера

```bash
npm start
```

Сервер запустится на http://localhost:3000

### 3. Заполнение тестовыми данными

```bash
npm run seed
```

Или откройте в браузере: http://localhost:3000/api/seed

### 4. Тестирование

Откройте test.html в браузере для визуального тестирования API

## API Эндпоинты

### Авторизация

#### Регистрация

```
POST /api/auth/signup
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.ru"
}
```

#### Вход

```
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

Возвращает токен в формате:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser"
  }
}
```

### Объявления (требуется токен)

Все запросы должны содержать заголовок:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Получить все объявления

```
GET /api/ads
```

#### Получить свои объявления

```
GET /api/ads/my
```

#### Создать объявление

```
POST /api/ads
Content-Type: application/json

{
  "title": "Продам диван",
  "description": "Отличное состояние",
  "price": 5000,
  "category": "мебель"
}
```

#### Получить объявление по ID

```
GET /api/ads/:id
```

#### Обновить объявление

```
PUT /api/ads/:id
Content-Type: application/json

{
  "title": "Новый заголовок",
  "price": 4500
}
```

#### Удалить объявление

```
DELETE /api/ads/:id
```

#### Модерация объявления

```
PATCH /api/ads/:id/moderate
Content-Type: application/json

{
  "status": "одобрено"
}
```

Возможные статусы: "на модерации", "одобрено", "отклонено"

## Тестирование

Откройте файл `test.html` в браузере для визуального тестирования API.

## Структура БД

### Таблица users

- id (INTEGER PRIMARY KEY)
- username (TEXT)
- password (TEXT, хешированный)
- email (TEXT)
- created_at (TEXT)

### Таблица ads

- id (INTEGER PRIMARY KEY)
- title (TEXT)
- description (TEXT)
- price (REAL)
- owner_id (INTEGER)
- status (TEXT)
- created_at (TEXT)
- category (TEXT)
