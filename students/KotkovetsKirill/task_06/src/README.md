# Health Diary API

Серверное приложение для дневника здоровья с авторизацией JWT.

## Быстрый старт

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
npm start
```

Сервер: http://localhost:3000

## API

### Авторизация

**POST /api/auth/signup** - Регистрация

```json
{ "email": "user@test.com", "password": "123456", "name": "Имя" }
```

**POST /api/auth/login** - Вход

```json
{ "email": "user@test.com", "password": "123456" }
```

### Записи (требуется токен)

**GET /api/records** - Список записей
**POST /api/records** - Создать запись
**GET /api/records/:id** - Получить запись
**PUT /api/records/:id** - Обновить запись
**DELETE /api/records/:id** - Удалить запись

Токен передавать в заголовке: `Authorization: Bearer <token>`

## Технологии

- Node.js + Express
- Prisma ORM + SQLite
- JWT + bcrypt
- CORS

## Демо

Откройте `demo.html` для тестирования API в браузере.

Подробная инструкция в файле `INSTALL.md`.
