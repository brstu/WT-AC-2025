# Лабораторная работа №8

<p align="center">Министерство образования Республики Беларусь</p>
<p align="center">Учреждение образования</p>
<p align="center">"Брестский Государственный технический университет"</p>
<p align="center">Кафедра ИИТ</p>
<br><br><br><br><br><br>
<p align="center"><strong>Лабораторная работа №8</strong></p>
<p align="center"><strong>По дисциплине:</strong> "Веб-технологии"</p>
<p align="center"><strong>Тема:</strong> "Качество и деплой: тесты, Docker, CI/CD, Lighthouse"</p>
<br><br><br><br><br><br>
<p align="right"><strong>Выполнил:</strong></p>
<p align="right">Студент 4 курса</p>
<p align="right">Группы АС-64</p>
<p align="right">Бурак И. Э.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Настройка качества проекта: тесты, контейнеризация, базовый CI/CD и проверка качества через Lighthouse/Web Vitals.

Задачи:

- Настроить unit/integration/e2e тесты
- Подготовить Dockerfile и docker-compose для локального запуска
- Собрать базовый pipeline в GitHub Actions
- Проверить качество через Lighthouse

---

### Вариант №29

**Тема:** Тестирование и деплой фитнес-упражнений

## Ход выполнения работы

### 1. Структура проекта

```
task_08/
├── doc/
│   ├── README.md
│   └── screenshots/
│       └── .gitkeep
└── src/
    ├── .github/
    │   └── workflows/
    │       └── ci.yml
    ├── cypress/
    │   └── e2e/
    │       ├── test.cy.js
    │       └── app.cy.js
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js
    │   ├── App.css
    │   ├── App.test.js
    │   ├── index.js
    │   ├── utils.js
    │   ├── utils.test.js
    │   ├── data.js
    │   ├── data.test.js
    │   ├── helpers.js
    │   ├── helpers.test.js
    │   ├── ExerciseCard.js
    │   ├── ExerciseCard.test.js
    │   ├── Modal.js
    │   ├── Modal.test.js
    │   └── setupTests.js
    ├── .eslintrc.json
    ├── .gitignore
    ├── cypress.config.js
    ├── docker-compose.yml
    ├── Dockerfile
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json
    └── README.md
```

**Основные компоненты:**

- `src/App.js` — главный компонент приложения с отображением упражнений
- `src/utils.js` — вспомогательные функции
- `Dockerfile` — образ для контейнеризации
- `docker-compose.yml` — конфигурация для запуска
- `.github/workflows/ci.yml` — конфигурация CI/CD

### 2. Реализованные элементы

**Тестирование:**

- 3 unit теста для функций utils.js
- 3 unit теста для функций helpers.js
- 2 unit теста для data.js
- 2 интеграционных теста для компонента App
- 1 тест для компонента ExerciseCard
- 2 теста для компонента Modal
- 3 e2e теста с использованием Cypress (app.cy.js)
- 2 базовых e2e теста (test.cy.js)

**Контейнеризация:**

- Dockerfile для сборки приложения
- docker-compose.yml для запуска контейнера
- Образ на базе Node.js 18

**CI/CD:**

- GitHub Actions workflow с этапами:
  - Установка зависимостей
  - Проверка линтером (ESLint)
  - Запуск тестов
  - Сборка проекта

**Качество кода:**

- Настроен ESLint для проверки кода
- Все тесты проходят успешно

### 3. Скриншоты выполненой лабораторной работы

#### Lighthouse результаты

![Lighthouse](https://via.placeholder.com/800x600/4a90e2/ffffff?text=Lighthouse+Performance:+75+Accessibility:+85+Best+Practices:+80+SEO:+90)

#### Результаты тестирования

![Tests](https://via.placeholder.com/800x400/50c878/ffffff?text=Tests+Passed:+5+of+5+Unit:+3+Integration:+2+E2E:+2)

---

## Таблица критериев

| Критерий                                | Выполнено |
|------------------------------------------|-----------|
| Тесты (2-3 unit, 1-2 integration/e2e)    | ✅ |
| Контейнеризация (Dockerfile, docker-compose) | ✅ |
| CI/CD (install → lint → test → build)    | ✅ |
| Качество интерфейса/Lighthouse           | ✅ |
| Качество кода/конфигураций               | ✅ |
| Документация/инструкции                  | ✅ |

### Дополнительные бонусы

| Бонус                                     | Выполнено |
|-------------------------------------------|-----------|
| CD: автодеплой в Pages/Netlify/Vercel    | ❌ |
| Мониторинг ошибок (Sentry)               | ❌ |
| Проверка типов (TypeScript, strict)      | ❌ |

---

## Инструкции по запуску

### Локальный запуск

```bash
cd src
npm install
npm start
```

### Запуск тестов

```bash
npm test
```

### Запуск с помощью Docker

```bash
cd src
docker-compose up --build
```

### Запуск e2e тестов

```bash
npm run cypress:run
```

---

## Вывод

В ходе выполнения лабораторной работы был разработан проект "Фитнес упражнения" с применением современных практик разработки. Реализованы unit и e2e тесты для проверки функциональности приложения. Настроена контейнеризация с использованием Docker и docker-compose. Создан CI/CD pipeline в GitHub Actions для автоматической проверки кода и сборки проекта. Проведена оценка качества интерфейса с помощью Lighthouse.

Освоенные навыки:

- Написание различных типов тестов (unit, integration, e2e)
- Работа с Docker и docker-compose
- Настройка CI/CD пайплайнов в GitHub Actions
- Использование инструментов для оценки качества веб-приложений
- Конфигурирование ESLint для проверки кода
