# Лабораторная работа №8

<p align="center">Министерство образования Республики Беларусь</p>
<p align="center">Учреждение образования</p>
<p align="center">"Брестский Государственный технический университет"</p>
<p align="center">Кафедра ИИТ</p>
<br><br><br><br><br><br>
<p align="center"><strong>Лабораторная работа №8</strong></p>
<p align="center"><strong>По дисциплине:</strong> "Веб-технологии"</p>
<p align="center"><strong>Тема:</strong> Качество и деплой: тесты, Docker, CI/CD, Lighthouse</p>
<br><br><br><br><br><br>
<p align="right"><strong>Выполнил:</strong></p>
<p align="right">Студент 4 курса</p>
<p align="right">Группы АС-64</p>
<p align="right">Котковец К. В.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Настройка качества проекта: тесты, контейнеризация, базовый CI/CD и проверка качества через Lighthouse/Web Vitals.

---

### Вариант №35

Тестирование и деплой справочника кофеен.

## Ход выполнения работы

### 1. Структура проекта

- `src/` — исходный код приложения
  - `src/` — React компоненты
    - `App.jsx` — главный компонент приложения
    - `main.jsx` — точка входа
    - `components/` — компоненты
      - `CoffeeShopList.jsx` — список кофеен
      - `CoffeeShopCard.jsx` — карточка кофейни
  - `__tests__/` — тесты
    - `App.test.jsx` — unit тесты для App
    - `CoffeeShopCard.test.jsx` — unit тесты для карточки
  - `e2e/` — e2e тесты
    - `app.spec.js` — e2e тесты с Playwright
  - `package.json` — зависимости проекта
  - `vite.config.js` — конфигурация Vite
  - `playwright.config.js` — конфигурация Playwright
  - `Dockerfile` — контейнеризация приложения
  - `docker-compose.yml` — оркестрация контейнеров
  - `.github/workflows/ci.yml` — CI/CD pipeline
- `doc/` — документация
  - `README.md` — отчет по работе
  - `screenshots/` — скриншоты Lighthouse

### 2. Реализованные элементы

**Тестирование:**

- 2 unit теста для компонента App (проверка отображения заголовка и футера)
- 2 unit теста для компонента CoffeeShopCard (проверка отображения данных)
- 2 e2e теста с использованием Playwright (проверка загрузки страницы и отображения списка)

**Контейнеризация:**

- Dockerfile для сборки приложения
- docker-compose.yml для запуска приложения
- .dockerignore для исключения ненужных файлов

**CI/CD:**

- GitHub Actions workflow с этапами:
  - Установка зависимостей (install)
  - Запуск тестов (test)
  - Сборка проекта (build)

**Функциональность:**

- Справочник кофеен с отображением информации о заведениях
- Карточки кофеен с изображениями, названиями, адресами, рейтингами
- Адаптивная сетка для отображения карточек

### 3. Скриншоты выполненной лабораторной работы

#### Интерфейс приложения

![Главная страница](./screenshots/main-page.png)

#### Результаты Lighthouse

![Lighthouse Performance](./screenshots/lighthouse-performance.png)
![Lighthouse Accessibility](./screenshots/lighthouse-accessibility.png)
![Lighthouse Best Practices](./screenshots/lighthouse-best-practices.png)
![Lighthouse SEO](./screenshots/lighthouse-seo.png)

---

## Таблица критериев

| Критерий                                | Выполнено |
|------------------------------------------|-----------|
| Тесты (2-3 unit, 1-2 integration/e2e)   | ✅ |
| Контейнеризация (Dockerfile, docker-compose) | ✅ |
| CI/CD (install → test → build)           | ✅ |
| Качество интерфейса/Lighthouse           | ✅ |
| Качество кода/конфигураций               | ✅ |
| Документация/инструкции                  | ✅ |

### Дополнительные бонусы

| Бонус                                     | Выполнено |
|-------------------------------------------|-----------|
| CD: автодеплой                            | ❌ |
| Мониторинг ошибок (Sentry)                | ❌ |
| Проверка типов (TypeScript, strict)       | ❌ |

---

## Инструкции по запуску

### Локальный запуск

```bash
cd src
npm install
npm run dev
```

Приложение будет доступно по адресу <http://localhost:5173>

### Запуск тестов

```bash
# Unit тесты
npm test

# E2E тесты
npm run test:e2e
```

### Запуск через Docker

```bash
cd src
docker-compose up --build
```

Приложение будет доступно по адресу <http://localhost:5173>

---

## Вывод

В ходе выполнения лабораторной работы был разработан справочник кофеен с использованием React. Настроено тестирование с помощью Vitest и Playwright, контейнеризация с Docker, автоматизация с GitHub Actions. Проведена проверка качества через Lighthouse. Освоены навыки работы с современными инструментами разработки и деплоя веб-приложений.
