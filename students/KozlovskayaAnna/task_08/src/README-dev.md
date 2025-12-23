# Блог-платформа

Простая платформа для ведения блога с поддержкой создания, редактирования и удаления статей.

## Установка и запуск

### Локальный запуск

```bash
cd src
npm install
npm start
```

Приложение будет доступно по адресу http://localhost:3000

### Docker запуск

```bash
cd src
docker-compose up --build
```

## Структура проекта

```
src/
├── public/
│   ├── index.html       # Главная страница
│   ├── style.css        # Стили
│   └── app.js           # Клиентский скрипт
├── tests/
│   ├── unit.test.js     # Unit тесты
│   ├── integration.test.js  # Интеграционные тесты
│   ├── api.test.js      # API тесты
│   └── setup.js         # Jest конфигурация
├── cypress/
│   └── e2e/
│       └── blog.cy.js   # E2E тесты
├── .github/
│   └── workflows/
│       └── ci.yml       # GitHub Actions workflow
├── server.js            # Express сервер
├── package.json         # Зависимости
├── Dockerfile           # Docker конфигурация
├── docker-compose.yml   # Compose конфигурация
├── jest.config.js       # Jest конфигурация
├── cypress.config.js    # Cypress конфигурация
└── .eslintrc.js         # ESLint конфигурация
```

## Команды

- `npm start` - запуск сервера
- `npm test` - запуск всех тестов
- `npm run lint` - проверка кода ESLint
- `npm run lint:fix` - исправление ошибок ESLint
- `npm run build` - сборка проекта
- `npm run test:e2e` - запуск E2E тестов Cypress

## API endpoints

- GET `/api/posts` - получить все статьи
- GET `/api/posts/:id` - получить статью по ID
- POST `/api/posts` - создать новую статью
- PUT `/api/posts/:id` - обновить статью
- DELETE `/api/posts/:id` - удалить статью

## Функциональность

- Просмотр всех статей
- Создание новой статьи
- Редактирование существующей статьи
- Удаление статьи
- Адаптивный дизайн
- REST API

## Тестирование

Проект включает несколько типов тестов:
- Unit тесты (Jest)
- Интеграционные тесты (Jest)
- API тесты (Jest + Supertest)
- E2E тесты (Cypress)

## Контейнеризация

Проект содержит:
- Многостадийный Dockerfile
- docker-compose для локальной разработки
- Nginx конфигурация для reverse proxy

## CI/CD

GitHub Actions workflow включает:
- Проверка зависимостей
- Линтинг кода
- Запуск тестов
- Сборка приложения
- Lighthouse анализ
- Docker сборка (опционально)

## Требования

- Node.js 16+ или 18+
- Docker и Docker Compose (для контейнеризации)
- Браузер современной версии

## Лицензия

MIT
