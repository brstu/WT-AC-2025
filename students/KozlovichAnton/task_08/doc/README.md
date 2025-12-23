# Лабораторная работа №8

<p align="center">Министерство образования Республики Беларусь</p>
<p align="center">Учреждение образования</p>
<p align="center">"Брестский Государственный технический университет"</p>
<p align="center">Кафедра ИИТ</p>
<br><br><br><br><br><br>
<p align="center"><strong>Лабораторная работа №8</strong></p>
<p align="center"><strong>По дисциплине:</strong> "Веб-технологии"</p>
<p align="center"><strong>Тема:</strong> Тестирование и деплой галереи артов</p>
<br><br><br><br><br><br>
<p align="right"><strong>Выполнил:</strong></p>
<p align="right">Студент 4 курса</p>
<p align="right">Группы АС-63</p>
<p align="right">Козлович А. А.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Настройка качества проекта: тесты, контейнеризация, базовый CI/CD и проверка качества через Lighthouse/Web Vitals.

---

### Вариант №7

## Ход выполнения работы

### 1. Структура проекта

```
src/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Gallery.js
│   ├── utils/
│   │   └── helpers.js
│   ├── __tests__/
│   │   ├── App.test.js
│   │   └── helpers.test.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── setupTests.js
├── .github/
│   └── workflows/
│       └── ci.yml
├── package.json
├── jest.config.js
├── Dockerfile
└── docker-compose.yml
```

### 2. Реализованные элементы

- React приложение для отображения галереи артов
- Компонент Gallery с загрузкой данных из API
- Unit тесты для компонентов и утилит (Jest + React Testing Library)
- Dockerfile для контейнеризации приложения
- docker-compose для запуска приложения
- GitHub Actions CI pipeline (install, lint, test, build)
- ESLint для проверки кода

### 3. Скриншоты выполненой лабораторной работы

![Главная страница галереи](./screenshots/gallery.png)

![Lighthouse отчет](./screenshots/lighthouse.png)

![GitHub Actions CI](./screenshots/ci.png)

---

## Таблица критериев

| Критерий                                | Выполнено |
|------------------------------------------|-----------|
| Тесты (unit/integration/e2e)            | ✅ |
| Контейнеризация (Docker/docker-compose) | ✅ |
| CI/CD (GitHub Actions)                  | ✅ |
| Качество интерфейса/Lighthouse          | ✅ |
| Качество кода/конфигураций              | ✅ |
| Документация/инструкции                 | ✅ |

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
npm start
```

Приложение будет доступно по адресу <http://localhost:3000>

### Запуск тестов

```bash
cd src
npm test
```

### Запуск линтера

```bash
cd src
npm run lint
```

### Сборка production версии

```bash
cd src
npm run build
```

### Запуск через Docker

```bash
cd src
docker build -t art-gallery .
docker run -p 3000:3000 art-gallery
```

### Запуск через docker-compose

```bash
cd src
docker-compose up
```

---

## Вывод

В ходе выполнения лабораторной работы был разработан проект галереи артов с использованием React. Были настроены тесты с использованием Jest и React Testing Library, создан Dockerfile и docker-compose для контейнеризации приложения, настроен базовый CI pipeline в GitHub Actions. Приложение загружает и отображает арты из открытого API художественного института Чикаго.
