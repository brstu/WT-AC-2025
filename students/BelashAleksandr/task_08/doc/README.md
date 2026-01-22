# Лабораторная работа №08

<p align="center">Министерство образования Республики Беларусь</p>
<p align="center">Учреждение образования</p>
<p align="center">"Брестский Государственный технический университет"</p>
<p align="center">Кафедра ИИТ</p>
<br><br><br><br><br><br>
<p align="center"><strong>Лабораторная работа №08</strong></p>
<p align="center"><strong>По дисциплине:</strong> "Веб-технологии"</p>
<p align="center"><strong>Тема:</strong> Качество и деплой: тесты, Docker, CI/CD, Lighthouse</p>
<br><br><br><br><br><br>
<p align="right"><strong>Выполнил:</strong></p>
<p align="right">Студент 4 курса</p>
<p align="right">Группы АС-64</p>
<p align="right">Белаш А. О.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Настройка качества проекта: тесты, контейнеризация, базовый CI/CD и проверка качества через Lighthouse/Web Vitals.

---

### Вариант №25

**Тема:** Тестирование и деплой питомцев из приюта

## Ход выполнения работы

### 1. Структура проекта

```
task_08/
├── doc/
│   ├── README.md
│   └── screenshots/
│       ├── lighthouse-performance.png.txt
│       ├── app-screenshot.png.txt
│       └── tests-result.png.txt
└── src/
    ├── .github/
    │   └── workflows/
    │       └── ci.yml
    ├── __tests__/
    │   └── app.test.js
    ├── index.html
    ├── app.js
    ├── package.json
    ├── jest.config.js
    ├── Dockerfile
    ├── docker-compose.yml
    └── .dockerignore
```

**Основные файлы:**

- `index.html` — главная страница приложения
- `app.js` — логика работы с питомцами
- `__tests__/app.test.js` — unit тесты
- `Dockerfile` — конфигурация Docker контейнера
- `docker-compose.yml` — настройка docker-compose
- `.github/workflows/ci.yml` — CI/CD pipeline

### 2. Реализованные элементы

**Приложение:**

- Простое веб-приложение для просмотра питомцев из приюта
- Загрузка изображений питомцев через публичные API (Dog API, Cat API)
- Функционал поиска питомцев
- Возможность "забрать" питомца

**Тестирование:**

- Настроен Jest для unit тестирования
- Реализовано 4 unit теста в файле `app.test.js`
- Тесты проверяют базовую функциональность

**Docker:**

- Создан Dockerfile для контейнеризации приложения
- Использован nginx для раздачи статических файлов
- Настроен docker-compose для локального запуска

**CI/CD:**

- Настроен GitHub Actions workflow
- Pipeline включает:
  - Установку зависимостей (npm install)
  - Запуск тестов (npm test)
- Автоматический запуск при push и pull request

**Качество:**

- Приложение доступно для проверки через Lighthouse

### 3. Скриншоты выполненой лабораторной работы

**Скриншот приложения:**

![Приложение](./screenshots/app-screenshot.png.txt)

**Результаты тестов:**

![Тесты](./screenshots/tests-result.png.txt)

**Lighthouse Performance:**

![Lighthouse](./screenshots/lighthouse-performance.png.txt)

---

## Таблица критериев

| Критерий                                | Выполнено |
|------------------------------------------|-----------|
| Тесты — 20                              | ✅        |
| Контейнеризация — 20                    | ✅        |
| CI (сборка/тесты) — 20                  | ✅        |
| Качество интерфейса/показатели Lighthouse — 20 | ✅   |
| Качество кода/конфигураций — 10         | ✅        |
| Документация/инструкции — 10            | ✅        |

### Дополнительные бонусы

| Бонус                                     | Выполнено |
|-------------------------------------------|-----------|
| CD: автодеплой в Pages/Netlify/Vercel    | ❌        |
| Мониторинг ошибок (Sentry)               | ❌        |
| Проверка типов (TypeScript, strict)      | ❌        |

---

## Инструкции по запуску

### Локальный запуск

1. Открыть `index.html` в браузере
2. Или запустить локальный сервер:

```bash
cd src
python -m http.server 8000
```

### Запуск через Docker

```bash
cd src
docker-compose up
```

Приложение будет доступно по адресу: `http://localhost:8080`

### Запуск тестов

```bash
cd src
npm install
npm test
```

---

## Вывод

В ходе выполнения лабораторной работы был создан проект "Приют для питомцев" с применением современных практик разработки. Были реализованы unit тесты с использованием Jest, настроена контейнеризация через Docker и Docker Compose, создан CI pipeline в GitHub Actions для автоматической проверки кода и запуска тестов.

Приложение использует публичные API для получения изображений питомцев, что позволяет динамически отображать контент. Реализован базовый функционал поиска и взаимодействия с питомцами.

В процессе работы были освоены следующие навыки:

- Написание и настройка unit тестов
- Работа с Docker и Docker Compose
- Настройка CI/CD pipeline в GitHub Actions
- Проверка качества веб-приложения через Lighthouse

Использованные инструменты: HTML, CSS, JavaScript, Jest, Docker, GitHub Actions, Nginx, Dog API, Cat API.
