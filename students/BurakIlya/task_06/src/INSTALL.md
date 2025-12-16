# Инструкция по установке и запуску

## Требования

- Node.js версии 16 или выше
- npm (устанавливается вместе с Node.js)

## Установка

1. Перейдите в папку src:

```bash
cd src
```

1. Установите зависимости:

```bash
npm install
```

1. Скопируйте файл .env.example в .env:

```bash
copy .env.example .env
```

## Инициализация базы данных

1. Сгенерируйте Prisma Client:

```bash
npx prisma generate
```

1. Создайте миграцию и примените её:

```bash
npx prisma migrate dev --name init
```

1. (Опционально) Заполните БД тестовыми данными:

```bash
node seed.js
```

Это создаст пользователя:
- Email: test@test.com
- Пароль: password123

## Запуск сервера

Для запуска в обычном режиме:

```bash
npm start
```

Для разработки с автоперезагрузкой:

```bash
npm run dev
```

Сервер будет доступен по адресу: http://localhost:3000

## Тестирование API

Для тестирования можно использовать:
- Postman
- curl
- Thunder Client (расширение VS Code)
- любой другой HTTP клиент

### Примеры запросов

**Регистрация:**

```bash
curl -X POST http://localhost:3000/api/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"user@test.com\",\"password\":\"pass123\",\"name\":\"Test User\"}"
```

**Вход:**

```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@test.com\",\"password\":\"password123\"}"
```

**Получить заметки (замените YOUR_TOKEN на полученный токен):**

```bash
curl -X GET http://localhost:3000/api/notes ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Структура API

- `POST /api/auth/signup` - регистрация
- `POST /api/auth/login` - вход
- `GET /api/notes` - получить все заметки
- `POST /api/notes` - создать заметку
- `GET /api/notes/:id` - получить заметку по ID
- `PUT /api/notes/:id` - обновить заметку
- `DELETE /api/notes/:id` - удалить заметку
- `GET /api/notes/search/tags?tag=имя` - поиск по меткам
