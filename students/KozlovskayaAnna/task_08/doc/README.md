# Лабораторная работа №8

<p align="center">Министерство образования Республики Беларусь</p>
<p align="center">Учреждение образования</p>
<p align="center">"Брестский Государственный технический университет"</p>
<p align="center">Кафедра ИИТ</p>
<br><br><br><br><br><br>
<p align="center"><strong>Лабораторная работа №8</strong></p>
<p align="center"><strong>По дисциплине:</strong> "Веб-технологии"</p>
<p align="center"><strong>Тема:</strong> Тестирование и деплой блог-платформы</p>
<br><br><br><br><br><br>
<p align="right"><strong>Выполнила:</strong></p>
<p align="right">Студентка 4 курса</p>
<p align="right">Группы АС-63</p>
<p align="right">Козловская Анна Геннадьевна</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Целью данной лабораторной работы является настройка комплексного решения для контроля качества веб-проекта, включающего:

- Разработку unit, интеграционных и end-to-end тестов
- Контейнеризацию приложения с использованием Docker
- Настройку базового CI/CD pipeline с GitHub Actions
- Проверку качества интерфейса через Lighthouse и Web Vitals

Вариант: **Вариант № 8** — Тестирование и деплой блог-платформы

---

## Ход выполнения работы

### 1. Структура проекта

Проект организован в соответствии с требованиями:

```
task_08/
├── doc/
│   ├── README.md                 # Отчёт о проделанной работе
│   └── screenshots/              # Скриншоты Lighthouse
│
└── src/
    ├── public/
    │   ├── index.html            # Главная HTML-страница
    │   ├── style.css             # Стили приложения
    │   └── app.js                # Клиентский JavaScript код
    ├── tests/
    │   ├── unit.test.js          # Unit тесты
    │   ├── integration.test.js    # Интеграционные тесты
    │   ├── api.test.js           # API тесты
    │   └── setup.js              # Jest конфигурация
    ├── cypress/
    │   └── e2e/
    │       └── blog.cy.js        # E2E тесты Cypress
    ├── .github/
    │   └── workflows/
    │       └── ci.yml            # GitHub Actions workflow
    ├── server.js                 # Express сервер
    ├── package.json              # Зависимости NPM
    ├── Dockerfile                # Docker конфигурация (многостадийная)
    ├── docker-compose.yml        # Docker Compose
    ├── nginx.conf                # Nginx конфигурация
    ├── jest.config.js            # Jest конфигурация
    ├── cypress.config.js         # Cypress конфигурация
    ├── lighthouserc.json         # Lighthouse конфигурация
    ├── .eslintrc.js              # ESLint конфигурация
    ├── .prettierrc                # Prettier конфигурация
    └── README-dev.md             # Документация разработчика
```

### 2. Реализованные элементы

#### A. Тестирование (20 баллов)

**Unit тесты (unit.test.js):**

- Проверка базовых функций утилит
- Тесты для вспомогательных функций
- 3 unit теста на Jest

**Интеграционные тесты (integration.test.js):**

- Проверка интеграции DOM с приложением
- Тесты объектов Post
- 2 интеграционных теста

**API тесты (api.test.js):**

- Тестирование REST endpoints с использованием Supertest
- Проверка POST запросов
- Проверка GET запросов

**E2E тесты (cypress/e2e/blog.cy.js):**

- Проверка загрузки приложения
- Тестирование открытия модального окна
- Проверка работы форм
- 8 E2E тестов на Cypress

#### B. Docker (20 баллов)

**Dockerfile:**

- Многостадийная сборка (builder stage и production stage)
- Оптимизация размера образа
- Использование Node.js Alpine образа
- Правильная установка зависимостей

**docker-compose.yml:**

- Сервис приложения (Node.js/Express)
- Сервис nginx reverse proxy
- Настройка портов и окружения
- Volume для разработки

**nginx.conf:**

- Reverse proxy конфигурация
- Gzip компрессия
- Проксирование API запросов

#### C. CI/CD (20 баллов)

**GitHub Actions workflow (.github/workflows/ci.yml):**

Шаги pipeline:

1. **Install** — установка зависимостей

   ```yaml
   npm install
   ```

2. **Lint** — проверка кода ESLint

   ```yaml
   npm run lint
   ```

3. **Test** — запуск всех типов тестов
   - Unit тесты
   - Интеграционные тесты
   - API тесты

4. **Build** — сборка приложения

   ```yaml
   npm run build
   ```

5. **Docker Build** — сборка Docker образа (опционально)

6. **Code Quality** — анализ качества кода

7. **E2E Tests** — запуск Cypress тестов

8. **Lighthouse** — проверка метрик производительности

Функции:

- Матрица Node.js версий (16.x, 18.x)
- Артефакты результатов тестов
- Скриншоты при ошибках Cypress
- Кэширование зависимостей

#### D. Качество интерфейса (20 баллов)

**Lighthouse проверка:**

- Performance (Производительность)
- Accessibility (Доступность)
- Best Practices (Лучшие практики)
- SEO (Поисковая оптимизация)

**Web Vitals:**

- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)

**Скриншоты Lighthouse:** находятся в `doc/screenshots/`

#### E. Качество кода (10 баллов)

**ESLint конфигурация:**

- Проверка синтаксиса
- Проверка на неиспользуемые переменные
- Проверка стиля кода

**Prettier конфигурация:**

- Автоматическое форматирование
- Единообразный стиль кода

**.eslintrc.js:**

```javascript
{
  env: { browser: true, es2021: true, node: true },
  extends: ['eslint:recommended'],
  rules: {
    'no-unused-vars': ['warn'],
    'no-console': ['warn'],
    'indent': ['warn', 2]
  }
}
```

**Husky (опционально):**

- Pre-commit hooks для запуска lint
- Предотвращение коммитов с ошибками

#### F. Документация (10 баллов)

**README в doc/:**

- Полное описание проекта
- Инструкции по установке и запуску
- Описание структуры проекта
- API документация
- Информация о тестировании

**README-dev.md в src/:**

- Документация для разработчиков
- Команды для разработки
- Требования к окружению

### 3. Скриншоты выполненной лабораторной работы

#### Скриншот главной страницы приложения

![Главная страница](screenshots/main-page.png)

#### Скриншот работы приложения с созданной статьей

![Статьи](screenshots/posts.png)

#### Скриншот Lighthouse Performance

![Lighthouse Performance](screenshots/lighthouse-performance.png)

#### Скриншот Lighthouse Accessibility

![Lighthouse Accessibility](screenshots/lighthouse-accessibility.png)

#### Скриншот результатов тестов

![Тесты](screenshots/tests-results.png)

#### Скриншот GitHub Actions workflow

![CI/CD Pipeline](screenshots/github-actions.png)

#### Скриншот Docker контейнеров

![Docker](screenshots/docker.png)

---

## Таблица критериев

| Критерий | Выполнено | Примечание |
|----------|-----------|-----------|
| Unit тесты (2-3 шт) | ✅ | 3 unit теста в unit.test.js |
| Интеграционные тесты (1-2 шт) | ✅ | 2 интеграционных теста в integration.test.js |
| E2E тесты (Cypress/Playwright) | ✅ | 8 E2E тестов в cypress/e2e/blog.cy.js |
| API тесты | ✅ | 5 API тестов в api.test.js с Supertest |
| Многостадийный Dockerfile | ✅ | Builder и production stages |
| docker-compose.yml | ✅ | Включает app и nginx сервисы |
| GitHub Actions CI/CD | ✅ | Полный pipeline install → lint → test → build |
| Lighthouse проверка | ✅ | Performance, Accessibility, Best Practices, SEO |
| Web Vitals мониторинг | ✅ | LCP, CLS, FID оптимизация |
| ESLint конфигурация | ✅ | Настроена в .eslintrc.js |
| Prettier форматирование | ✅ | Настроена в .prettierrc |
| Husky pre-commit | ⚠️ | Конфигурация присутствует |
| Скриншоты Lighthouse | ✅ | В папке doc/screenshots/ |
| Полная документация | ✅ | README и README-dev.md |
| Структура проекта | ✅ | doc/ и src/ папки |

### Дополнительные элементы (Бонусы)

| Бонус | Выполнено | Описание |
|-------|-----------|---------|
| CD автодеплой | ⚠️ | Pipeline готов к интеграции с Pages/Netlify |
| Мониторинг ошибок (Sentry) | ❌ | Не реализовано |
| Логирование запросов | ✅ | Базовое логирование в Express |
| TypeScript strict mode | ❌ | Используется JavaScript |
| Адаптивный дизайн | ✅ | Mobile-first подход в CSS |
| CORS поддержка | ✅ | Включена в Express app |
| Nginx reverse proxy | ✅ | С gzip компрессией |

---

## Используемые технологии и инструменты

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Тестирование:** Jest, Cypress, Supertest
- **Контейнеризация:** Docker, Docker Compose, Nginx
- **CI/CD:** GitHub Actions
- **Качество:** ESLint, Prettier, Lighthouse
- **Версионирование:** Git

---

## Инструкции по запуску

### 1. Локальная разработка

```bash
# Перейти в папку src
cd src

# Установить зависимости
npm install

# Запустить сервер разработки
npm start
```

Приложение будет доступно по адресу: **<http://localhost:3000>**

### 2. Docker запуск

```bash
# Перейти в папку src
cd src

# Запустить с Docker Compose
docker-compose up --build

# Приложение будет доступно по адресу: http://localhost
```

### 3. Запуск тестов

```bash
cd src

# Все тесты
npm test

# Только unit тесты
npm test -- --testPathPattern=unit.test.js

# Только интеграционные тесты
npm test -- --testPathPattern=integration.test.js

# Только API тесты
npm test -- --testPathPattern=api.test.js

# E2E тесты (требует запущенное приложение)
npm run test:e2e

# Lint проверка
npm run lint

# Lint с исправлением
npm run lint:fix
```

### 4. Lighthouse проверка

```bash
cd src

# Запустить приложение
npm start

# В отдельном терминале запустить Lighthouse
npm run lighthouse
```

---

## API Endpoints

### Получить все статьи

```
GET /api/posts
```

**Ответ (200):**

```json
[
  {
    "id": 1,
    "title": "Первая статья",
    "content": "Содержание...",
    "date": "2025-12-10"
  }
]
```

### Получить статью по ID

```
GET /api/posts/:id
```

### Создать статью

```
POST /api/posts
Content-Type: application/json

{
  "title": "Новая статья",
  "content": "Содержание статьи"
}
```

**Ответ (201):**

```json
{
  "id": 3,
  "title": "Новая статья",
  "content": "Содержание статьи",
  "date": "2025-12-18"
}
```

### Обновить статью

```
PUT /api/posts/:id
Content-Type: application/json

{
  "title": "Обновленное название",
  "content": "Обновленное содержание"
}
```

### Удалить статью

```
DELETE /api/posts/:id
```

**Ответ (200):**

```json
{ "success": true }
```

---

## Заключение

В ходе выполнения лабораторной работы №8 была реализована полнофункциональная блог-платформа с комплексным подходом к обеспечению качества:

**Достигнутые результаты:**

- ✅ Реализованы unit, интеграционные и E2E тесты
- ✅ Приложение контейнеризировано с Docker и docker-compose
- ✅ Настроен полный CI/CD pipeline на GitHub Actions
- ✅ Проведена проверка качества через Lighthouse
- ✅ Настроены инструменты для контроля качества кода (ESLint, Prettier)
- ✅ Создана полная документация проекта

**Приобретённые навыки:**

- Написание тестов разных уровней (unit, интеграция, E2E)
- Контейнеризация приложений в Docker
- Автоматизация процессов CI/CD
- Проверка и оптимизация веб-приложений
- Использование инструментов для контроля качества кода

**Используемые инструменты:**

- Jest для unit и интеграционных тестов
- Cypress для E2E тестирования
- Docker и Docker Compose для контейнеризации
- GitHub Actions для CI/CD автоматизации
- Lighthouse для анализа производительности и доступности
- ESLint и Prettier для контроля качества кода

Проект полностью функционален, протестирован и готов к развёртыванию.

---

**Дата выполнения:** 18 декабря 2025 г.

**Студентка:** Козловская Анна Геннадьевна

**Группа:** АС-63

**Преподаватель:** Несюк А. Н.
