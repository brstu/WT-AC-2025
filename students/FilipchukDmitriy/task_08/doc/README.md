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
<p align="right">Группы АС-63</p>
<p align="right">Филипчук Д. В.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Настройка качества проекта: тесты, контейнеризация, базовый CI/CD и проверка качества через Lighthouse/Web Vitals.

---

### Вариант №22 - Тестирование и деплой open-source каталога

## Ход выполнения работы

### 1. Структура проекта

```
task_08/
├── doc/
│   ├── README.md
│   └── screenshots/
│       ├── lighthouse-performance.png
│       ├── lighthouse-accessibility.png
│       └── app-screenshot.png
└── src/
    ├── .github/
    │   └── workflows/
    │       └── ci.yml
    ├── cypress/
    │   └── e2e/
    │       └── app.cy.js
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.css
    │   ├── App.js
    │   ├── App.test.js
    │   ├── index.css
    │   ├── index.js
    │   └── setupTests.js
    ├── .dockerignore
    ├── .eslintrc.json
    ├── .gitignore
    ├── cypress.config.js
    ├── docker-compose.yml
    ├── Dockerfile
    └── package.json
```

### 2. Реализованные элементы

**Frontend:**

- React приложение для каталога open-source проектов
- Отображение карточек проектов с изображениями
- Поиск по названию проекта
- Фильтрация по категориям (Frontend, Backend, Инструменты)
- Адаптивная сетка проектов

**Тестирование:**

- Unit тесты с использованием Jest и React Testing Library
- E2E тесты с использованием Cypress
- Конфигурация тестовой среды

**Контейнеризация:**

- Dockerfile для сборки приложения
- docker-compose для локального запуска
- .dockerignore для оптимизации образа

**CI/CD:**

- GitHub Actions workflow
- Автоматическая установка зависимостей
- Запуск тестов
- Сборка проекта

**Качество кода:**

- ESLint конфигурация
- Базовая структура проекта

### 3. Скриншоты выполненной лабораторной работы

![Главная страница приложения](./screenshots/app-screenshot.png)

**Рисунок 1** - Главная страница каталога open-source проектов

![Lighthouse Performance](./screenshots/lighthouse-performance.png)

**Рисунок 2** - Результаты Lighthouse Performance

![Lighthouse Accessibility](./screenshots/lighthouse-accessibility.png)

**Рисунок 3** - Результаты Lighthouse Accessibility

---

## Таблица критериев

| Критерий                                          | Выполнено |
|--------------------------------------------------|-----------|
| Тесты (2-3 unit, 1-2 integration/e2e)            | ✅        |
| Контейнеризация (Dockerfile, docker-compose)     | ✅        |
| CI/CD (GitHub Actions: install → test → build)   | ✅        |
| Качество интерфейса (Lighthouse)                 | ✅        |
| Качество кода/конфигураций                       | ✅        |
| Документация/инструкции                          | ✅        |

### Дополнительные бонусы

| Бонус                                            | Выполнено |
|--------------------------------------------------|-----------|
| CD: автодеплой в Pages/Netlify/Vercel           | ❌        |
| Мониторинг ошибок (Sentry)                      | ❌        |
| Проверка типов (TypeScript, strict)             | ❌        |

---

## Инструкции по запуску

### Локальный запуск

```bash
cd src
npm install
npm start
```

Приложение будет доступно по адресу: <http://localhost:3000>

### Запуск тестов

```bash
cd src
npm test
```

### Запуск E2E тестов

```bash
cd src
npm start
npm run cypress:open
```

### Запуск через Docker

```bash
cd src
docker-compose up
```

### Запуск CI/CD

CI/CD автоматически запускается при push в ветку main или при создании Pull Request.

---

## Вывод

В ходе выполнения лабораторной работы был разработан каталог open-source проектов с использованием React. Были настроены и реализованы следующие компоненты:

1. **Тестирование**: Написаны unit тесты для компонентов приложения и e2e тесты для проверки пользовательских сценариев.

2. **Контейнеризация**: Создан Dockerfile и docker-compose.yml для локального запуска приложения в изолированной среде.

3. **CI/CD**: Настроен базовый pipeline в GitHub Actions, который автоматически устанавливает зависимости, запускает тесты и собирает проект.

4. **Качество**: Проведена проверка качества приложения с помощью Lighthouse.

В результате работы были освоены навыки написания тестов, контейнеризации приложений, настройки CI/CD pipeline и оценки качества веб-приложений.
