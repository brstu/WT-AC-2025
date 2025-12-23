# Mini-Shop SPA

Мини‑магазин (SPA) — учебный проект для изучения тестирования и деплоя.

## Технологический стек

- React + TypeScript
- Vite
- Redux Toolkit + RTK Query
- React Router
- json-server (mock REST API)
- Vitest + React Testing Library
- Docker

## Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Разработка

```bash
npm run dev
```

### Запуск mock API сервера

```bash
npm run server
```

### Запуск тестов

```bash
npm run test
```

### Production сборка

```bash
npm run build
```

### Docker

```bash
docker build -t mini-shop .
docker run -p 8080:80 mini-shop
```

## Замечания

Проект ориентирован на демонстрацию практик тестирования UI и подготовки к деплою. Тесты находятся в `src/features/events/__tests__`.
