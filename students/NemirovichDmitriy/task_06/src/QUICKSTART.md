# Краткая инструкция по запуску проекта

## Быстрый старт

```bash
cd src
npm install
npx prisma migrate dev --name init
npm run seed
npm start
```

Сервер будет доступен по адресу: http://localhost:3000

## Тестовые учетные данные

- email: editor@example.com, password: password123
- email: user@example.com, password: pass456

## Основные endpoints

- POST /api/auth/signup - Регистрация
- POST /api/auth/login - Вход
- GET /api/articles - Получить все статьи (требуется токен)
- POST /api/articles - Создать статью (требуется токен)
- GET /api/articles/:id - Получить статью по ID (требуется токен)
- PUT /api/articles/:id - Обновить статью (требуется токен)
- DELETE /api/articles/:id - Удалить статью (требуется токен)
