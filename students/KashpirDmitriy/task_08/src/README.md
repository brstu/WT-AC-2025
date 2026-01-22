# Events App - Афиша мероприятий

SPA приложение для управления афишей мероприятий (событий).

## Технологический стек

- React + TypeScript
- Vite
- Redux Toolkit + RTK Query
- React Router
- json-server (mock REST API)
- Vitest + React Testing Library
- Docker

## Запуск приложения

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
docker build -t events-app .
docker run -p 8080:80 events-app
```
