# Инструкция по запуску проекта

1. Перейдите в папку `src`:

```bash
cd src
```

1. Установите зависимости:

```bash
npm install
```

1. Скопируйте `.env.example` в `.env` и при необходимости измените значения.

1. Запустите сид:

```bash
npm run seed
```

1. Запустите сервер:

```bash
npm start
```

API:
- POST /api/auth/signup { username, password }
- POST /api/auth/login { username, password } -> { token }
- GET /api/tasks (Bearer token)
- POST /api/tasks { title, description } (Bearer token)
- GET /api/tasks/:id (Bearer token)
- PUT /api/tasks/:id (Bearer token)
- DELETE /api/tasks/:id (Bearer token)
