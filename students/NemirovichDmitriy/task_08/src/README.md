# Портал стажировок

Веб-приложение для поиска и подачи заявок на стажировки.

## Запуск проекта

### Локальная разработка

```bash
cd src
npm install
npm start
```

Приложение откроется на http://localhost:3000

### Docker

```bash
cd src
docker-compose up
```

### Тестирование

```bash
npm test        # Unit тесты
npm run test:e2e  # E2E тесты
```

## CI/CD

Проект использует GitHub Actions для автоматической проверки кода при каждом коммите.

## Структура

- `/src` - исходный код приложения
- `/doc` - документация
- `.github/workflows` - CI/CD конфигурация
