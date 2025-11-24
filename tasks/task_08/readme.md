# Лабораторная работа 08. Качество и деплой: тесты, Docker, CI/CD, Lighthouse

## Описание
Настройка качества проекта: тесты, контейнеризация, базовый CI/CD и проверка качества через Lighthouse/Web Vitals.

## Цели
- Настроить unit/integration/e2e тесты (по мере необходимости).
- Подготовить Dockerfile и docker‑compose для локального запуска.
- Собрать базовый pipeline в GitHub Actions.

## Задания
1. Тестирование: 2–3 unit, 1–2 integration/RTL или e2e (Cypress/Playwright).
2. Docker: многостадийный Dockerfile; docker‑compose при наличии БД.
3. CI/CD: workflow install → lint → test → build; опционально — сборка Docker‑образа и публикация.
4. Качество: прогон Lighthouse (Performance/Accessibility/Best Practices/SEO) и скриншоты.

## Минимальные технические требования
- ESLint/Prettier, Husky (pre‑commit) — по желанию.
- Конфигурации тестов и CI в репозитории.

<!-- START:artifacts -->

## Артефакты (что сдаём)

- Конфигурации тестов, Dockerfile, `.github/workflows/ci.yml`, README с инструкциями, скриншоты Lighthouse.
<!-- END:artifacts -->

<!-- START:criteria -->

## Критерии оценивания (100 баллов)

- Тесты — 20
- Контейнеризация — 20
- CI (сборка/тесты) — 20
- Качество интерфейса/показатели Lighthouse — 20
- Качество кода/конфигураций — 10
- Документация/инструкции — 10
<!-- END:criteria -->

<!-- START:bonuses -->

## Бонусы (+ до 10)

- CD: автодеплой в Pages/Netlify/Vercel/Render/Fly.io.
- Мониторинг ошибок (Sentry) или логирование запросов.
- Проверка типов (TypeScript, strict).
<!-- END:bonuses -->

## Подсказки

- Для e2e на CI используйте `--ci` режим и экшены браузеров; артефакты (скриншоты/видео) сохраняйте как workflow artifacts.

Методические материалы: [ЛР08](./Лабораторная_работа_08_Методические_материалы.md)

Список вариантов: [Варианты тем](./Варианты.md)
