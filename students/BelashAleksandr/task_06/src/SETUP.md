# Инструкция по запуску

## Установка зависимостей

```bash
cd src
npm install
```

## Настройка базы данных

```bash
npx prisma generate
npx prisma migrate dev --name init
```

## Заполнение тестовыми данными (опционально)

```bash
npm run seed
```

## Запуск сервера

```bash
npm run dev
```

Сервер запустится на http://localhost:3000

## API Endpoints

### Авторизация

**POST /api/auth/signup** - Регистрация

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Иван Иванов"
}
```

**POST /api/auth/login** - Вход

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Поездки (требуется токен)

Все запросы к /api/trips требуют заголовок:

```
Authorization: Bearer YOUR_TOKEN
```

**GET /api/trips** - Получить все поездки пользователя

**POST /api/trips** - Создать поездку

```json
{
  "title": "Поездка в Минск",
  "description": "Деловая поездка",
  "destination": "Минск",
  "startDate": "2025-01-15",
  "endDate": "2025-01-20",
  "budget": 500
}
```

**GET /api/trips/:id** - Получить поездку по ID

**PUT /api/trips/:id** - Обновить поездку

**DELETE /api/trips/:id** - Удалить поездку
