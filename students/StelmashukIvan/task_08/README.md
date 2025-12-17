# Каталог книг с рецензиями - Лабораторная работа 8

## Описание

React-приложение для управления каталогом книг с системой рецензий. Включает тестирование, контейнеризацию, CI/CD и проверку качества.

## Быстрый запуск

### Установка

```bash
git clone <repository-url>
cd book-catalog
npm install
```

Запуск в разработке

```bash
# Запуск приложения
npm run dev

# Запуск mock API (в другом терминале)
npm run server
```

Приложение доступно по адресу: <http://localhost:3000>

Запуск тестов

```bash
# Все тесты
npm test

# Unit тесты
npm run test:unit

# E2E тесты
npx playwright install
npm run test:e2e
```

Docker

```bash
# Сборка и запуск
docker-compose up

# Или
npm run docker:build
npm run docker:run
```

## Структура проекта

```text

book-catalog/
├── src/           # Исходный код (React + TypeScript)
├── tests/         # Тесты (Unit, Integration, E2E)
├── docker/        # Docker конфигурации
├── .github/       # CI/CD workflows
└── lighthouse/    # Отчеты качества
```

## Основные команды

* npm run dev - Запуск в режиме разработки
* npm run build - Сборка для production
* npm test - Запуск всех тестов
* npm run lint - Проверка кода линтером
* npm run docker:compose - Запуск через Docker Compose
* npm run lighthouse - Проверка качества Lighthouse

## Ссылка

Ссылка: <https://book-catalog-demo.vercel.app>

## Требования

* Node.js 18+
* npm 9+
* Docker (опционально)
* Git

## Что реализовано

✅ CRUD операции с книгами
✅ Система рецензий и рейтингов
✅ Валидация форм (React Hook Form + Zod)
✅ Управление состоянием (Redux Toolkit)
✅ Маршрутизация (React Router)
✅ Unit и Integration тесты (Vitest)
✅ E2E тесты (Playwright)
✅ Docker контейнеризация
✅ CI/CD (GitHub Actions)
✅ Lighthouse аудит
