# Отчёт по проекту Music Next.js App

## Тестирование
- Unit‑тесты (Vitest):
  - `src/lib/formatters.test.ts` — проверка утилит форматирования.
  - `src/components/SearchInput.test.tsx` — проверка компонента ввода.
- Integration/RTL:
  - `src/features/artist/SearchPage.test.tsx` — взаимодействие поиска и сетевого запроса (mock).
-E2E (Playwright):
  - `e2e/search.spec.ts` — поиск артиста и отображение результатов.

Запуск:

```bash
npm run test     
npm run e2e     
```

Контейнеризация
Dockerfile: многостадийный (deps → builder → runner).
docker‑compose.yml: добавлен сервис Postgres (опционально).

Локальный запуск:

```bash
docker build -t music-app .
docker run -p 3000:3000 music-app
```

или

```bash
docker-compose up -d
```
CI/CD (GitHub Actions)
Workflow .github/workflows/ci.yml:

Checkout → Setup Node → Install → Lint → Unit/Integration → E2E → Build.

Дополнительно: сборка и публикация Docker‑образа в GitHub Container Registry.
