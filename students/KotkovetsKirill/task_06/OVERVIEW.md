# Лабораторная работа №6 - Краткий обзор

## Студент

**Котковец Кирилл Викторович**, группа АС-64

## Тема

Дневник здоровья: измерения, цели, приватность, роли

## Что реализовано

### ✅ ORM и База данных (SQLite + Prisma)

- Модель User (email, password, name)
- Модель HealthRecord (type, value, date, goal, notes, ownerId)
- Связь между моделями через ownerId

### ✅ Авторизация

- POST /api/auth/signup - регистрация с хешированием паролей (bcrypt)
- POST /api/auth/login - вход с выдачей JWT токена
- Middleware auth для защиты эндпоинтов

### ✅ CRUD операции для записей здоровья

- GET /api/records - получить все записи пользователя
- POST /api/records - создать новую запись
- GET /api/records/:id - получить запись по ID
- PUT /api/records/:id - обновить запись
- DELETE /api/records/:id - удалить запись

### ✅ Безопасность

- CORS настроен
- Хеширование паролей через bcrypt
- JWT токены для авторизации
- Переменные окружения в .env
- Bearer Token в заголовках

### ✅ Документация

- README.md с полным отчетом по работе
- INSTALL.md с инструкциями по установке
- Демо-страница для тестирования API
- Batch-файлы для Windows

## Структура

```
task_06/
├── doc/
│   ├── README.md           # Полный отчет
│   └── screenshots/        # Скриншоты
└── src/
    ├── index.js            # Основной сервер
    ├── seed.js             # Тестовые данные
    ├── demo.html           # Демо-интерфейс
    ├── setup.bat           # Автоустановка
    ├── start.bat           # Запуск
    └── prisma/
        └── schema.prisma   # Схема БД
```

## Быстрый старт (Windows)

1. Перейти в папку `src`
2. Запустить `setup.bat` (установит все зависимости и настроит БД)
3. Запустить `start.bat` (запустит сервер на порту 3000)
4. Открыть `demo.html` для тестирования

## Технологии

- Node.js + Express
- Prisma ORM + SQLite
- JWT + bcrypt
- CORS

## Тестовые пользователи (после seed)

- test@test.com / 123456
- doctor@health.ru / password
