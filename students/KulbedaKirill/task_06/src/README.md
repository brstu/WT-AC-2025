# Инструкция по установке и запуску

## Требования

- Node.js версии 14 или выше
- npm

## Установка

1. Перейдите в директорию src:

```bash
cd src
```

1. Установите зависимости:

```bash
npm install
```

1. Создайте файл .env на основе .env.example:

```bash
copy .env.example .env
```

1. Инициализируйте Prisma и выполните миграции:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

1. (Опционально) Заполните базу данных тестовыми данными:

```bash
npm run seed
```

## Запуск

Запустите сервер:

```bash
npm start
```

Или для разработки с автоперезагрузкой:

```bash

Сервер будет доступен по адресу: http://localhost:3000

## Тестирование

После запуска сервера и выполнения seed, вы можете войти с помощью:
- Email: test@example.com
- Password: password123

Используйте Postman или curl для тестирования API.
