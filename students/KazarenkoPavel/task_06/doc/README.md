# Мини-CRM API

REST API для управления клиентами и сделками с авторизацией JWT и ролевой системой.

## Быстрый старт

1. Установите зависимости: `npm install`
2. Настройте PostgreSQL и создайте базу данных
3. Скопируйте `.env.example` в `.env` и настройте переменные
4. Запустите миграции: `npm run migration:run`
5. Заполните начальными данными: `npm run seed`
6. Запустите сервер: `npm run dev`

## Основные эндпоинты

### Аутентификация

**Регистрация:**

```text
POST /api/auth/signup
Body: { "email": "...", "password": "...", "firstName": "...", "lastName": "..." }
```

**Вход:**

```text
POST /api/auth/login
Body: { "email": "...", "password": "..." }
```

**Обновление токена:**

```text
POST /api/auth/refresh
Body: { "refreshToken": "..." }
```

**Выход:**

```text
POST /api/auth/logout
Header: Authorization: Bearer <token>
```

### Клиенты

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/clients` | Создать клиента |
| GET | `/api/clients` | Получить список клиентов |
| GET | `/api/clients/:id` | Получить клиента по ID |
| PUT | `/api/clients/:id` | Обновить клиента |
| DELETE | `/api/clients/:id` | Удалить клиента |

### Сделки

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/deals` | Создать сделку |
| GET | `/api/deals` | Получить список сделок |
| GET | `/api/deals/:id` | Получить сделку по ID |
| PUT | `/api/deals/:id` | Обновить сделку |
| DELETE | `/api/deals/:id` | Удалить сделку |

## Роли и доступы

**Admin** - полный доступ ко всем операциям  
**Manager** - чтение/запись всех данных, без удаления  
**User** - работа только со своими данными

## Параметры запросов

- `page` - номер страницы (по умолчанию: 1)
- `limit` - элементов на странице (по умолчанию: 10)
- `search` - поиск по имени/email (клиенты)
- `status` - фильтр по статусу (сделки)
- `clientId` - фильтр по ID клиента

## Примеры запросов

### Создание клиента

```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Company","email":"contact@company.com","phone":"+1234567890"}'
```

### Получение сделок

```bash
curl -X GET "http://localhost:3000/api/deals?page=1&limit=10&status=new" \
  -H "Authorization: Bearer <token>"
```

### Переменные окружения (.env)

```bash
env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=mini_crm
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your_refresh_secret
CORS_ORIGIN=http://localhost:3001
```

## Команды

```bash
npm run dev          # Запуск в development
npm run build        # Сборка проекта
npm start            # Запуск в production
npm run migration:run # Применить миграции
npm run seed         # Заполнить начальными данными
```

## Технологии

- Node.js + Express + TypeScript
- PostgreSQL + TypeORM
- JWT аутентификация
- bcrypt для хеширования паролей
- class-validator для валидации

## Безопасность

- Хеширование паролей (bcrypt)
- JWT с access/refresh токенами
- CORS и Helmet middleware
- Rate limiting
- Валидация всех входных данных
- Защита маршрутов по ролям
