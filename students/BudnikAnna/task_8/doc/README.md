# Лабораторная работа №8 — Тестирование и деплой портфолио проектов

## Цель работы

- Настроить проверки качества проекта: линтинг и форматирование.
- Настроить тесты (unit и integration и при необходимости e2e).
- Подготовить контейнеризацию (Dockerfile и docker-compose) для локального запуска.
- Собрать базовый CI/CD pipeline в GitHub Actions.
- Оценить качество интерфейса через Lighthouse (Performance, Accessibility, Best Practices, SEO) и приложить скриншоты.

## Метаданные

- ФИО: Будник Анна
- Группа: АС-64
- StudentID: 220033
- GitHub: annettebb
- Вариант: №4
- Дата: 23.12.2025

## Вариант №4

Проект: **Тестирование и деплой портфолио проектов**

Ключевые элементы проекта (контекст для проверки качества):

- SPA на **React (Vite)**.
- Роутинг: **React Router v6+** (список, деталь, создание, редактирование, 404).
- Данные: mock API на **json-server** (`db.json`, ресурс `/programs`).
- Состояние и данные: **Redux Toolkit + RTK Query**.
- UI-состояния: **loading**, **error**, **empty**, toast-уведомления.
- Переменные окружения: `.env` (например, `VITE_API_URL`).

## Ход выполнения работы

### 1 Запуск проекта

#### 1.1 Установка зависимостей

Установка зависимостей выполняется командой:

- `npm ci`

Если используется yarn:

- `yarn install --frozen-lockfile`

#### 1.2 Запуск в режиме разработки

Запуск проекта в dev-режиме:

- `npm run dev`

Или для yarn:

- `yarn dev`

### 2 Линтер и форматирование

#### 2.1 ESLint

Добавлены правила линтинга и скрипт запуска.

Команда проверки:

- `npm run lint`

Команда автоисправления:

- `npm run lint:fix`

#### 2.2 Prettier

Добавлен форматтер и скрипты.

Проверка форматирования:

- `npm run format:check`

Автоформатирование:

- `npm run format`

### 3 Тестирование

#### 3.1 Unit тесты

Добавлены 2–3 unit теста для базовых функций или компонентов.

Запуск unit тестов:

- `npm run test`

#### 3.2 Integration тесты

Добавлены 1–2 интеграционных теста (например, с React Testing Library), проверяющие сценарии взаимодействия пользователя с интерфейсом.

Запуск интеграционных тестов выполняется той же командой `npm run test`, либо отдельной:

- `npm run test:integration`

Если в проекте используется e2e (Playwright или Cypress), запускается отдельной командой:

- `npm run test:e2e`

### 4 Контейнеризация Docker

#### 4.1 Dockerfile

Подготовлен многостадийный Dockerfile, который:

- устанавливает зависимости
- собирает проект
- запускает приложение в production режиме

Сборка образа:

- `docker build -t task-8-app .`

Запуск контейнера:

- `docker run -p 3000:3000 task-8-app`

#### 4.2 Docker Compose

Если проект использует дополнительные сервисы, добавлен `docker-compose.yml` (например, для базы данных).

Запуск:

- `docker compose up --build`

Остановка:

- `docker compose down`

### 5 CI CD GitHub Actions

#### 5.1 Workflow

Добавлен workflow `.github/workflows/ci.yml`, который выполняет:

- установку зависимостей
- запуск линтера
- запуск тестов
- сборку проекта

Пример логики пайплайна:

- `install` → `lint` → `test` → `build`

#### 5.2 Результат

После push в репозиторий workflow автоматически запускается и отображается в разделе Actions.

При успешном прохождении всех шагов сборка считается корректной и готовой к дальнейшей публикации.

### 6 Lighthouse и Web Vitals

#### 6.1 Запуск Lighthouse

Аудит Lighthouse выполнен через Chrome DevTools:

- открыть страницу приложения
- вкладка Lighthouse
- выбрать категории Performance, Accessibility, Best Practices, SEO
- запустить аудит и сохранить результаты

#### 6.2 Результаты

Результаты сохранены в `students/BudnikAnna/task_8/doc/lighthouse` в виде скриншотов.

Приложены файлы:

- `performance.png`
- `accessibility.png`
- `best-practices.png`
- `seo.png`

Также допускается сохранение отчёта в формате HTML:

- `lighthouse-report.html`

## Инструкция по запуску проекта

### Локальный запуск

- `npm ci`
- `npm run dev`

### Проверка качества

- `npm run lint`
- `npm run format:check`
- `npm run test`
- `npm run build`

### Запуск в Docker

- `docker build -t task-8-app .`
- `docker run -p 3000:3000 task-8-app`

## Артефакты для сдачи

В репозитории присутствуют:

- конфигурации линтера и форматтера
- тесты (unit и integration)
- `Dockerfile` и при необходимости `docker-compose.yml`
- `.github/workflows/ci.yml`
- данный отчёт `doc/README.md`
- скриншоты Lighthouse в `doc/lighthouse`
