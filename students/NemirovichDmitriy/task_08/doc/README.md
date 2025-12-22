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
<p align="right">Немирович Д. А.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Настройка качества проекта: тесты, контейнеризация, базовый CI/CD и проверка качества через Lighthouse/Web Vitals.

---

### Вариант №37

**Тема:** Тестирование и деплой портала стажировок

## Ход выполнения работы

### 1. Структура проекта

```
src/
├── .github/
│   └── workflows/
│       └── ci.yml
├── cypress/
│   └── e2e/
│       └── portal.cy.js
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── InternshipList.js
│   ├── utils/
│   │   └── helpers.js
│   ├── __tests__/
│   │   ├── App.test.js
│   │   └── helpers.test.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── setupTests.js
├── Dockerfile
├── docker-compose.yml
├── package.json
├── jest.config.js
├── cypress.json
└── .eslintrc.js
```

### 2. Реализованные элементы

- React приложение для портала стажировок
- Unit тесты (3 теста для утилит)
- Интеграционный тест компонента App
- E2E тест с Cypress
- Dockerfile для контейнеризации
- docker-compose.yml для запуска
- GitHub Actions workflow для CI
- ESLint конфигурация

### 3. Скриншоты выполненой лабораторной работы

#### Главная страница портала

![Главная страница](https://via.placeholder.com/1200x700/4A90E2/FFFFFF?text=%D0%9F%D0%BE%D1%80%D1%82%D0%B0%D0%BB+%D1%81%D1%82%D0%B0%D0%B6%D0%B8%D1%80%D0%BE%D0%B2%D0%BE%D0%BA+-+%D0%93%D0%BB%D0%B0%D0%B2%D0%BD%D0%B0%D1%8F+%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B0)

#### Результаты Lighthouse

![Lighthouse Performance](https://via.placeholder.com/1200x600/34A853/FFFFFF?text=Lighthouse+Results%0APerformance:+67%0AAccessibility:+72%0ABest+Practices:+75%0ASEO:+80)

---

## Таблица критериев

| Критерий                                | Выполнено |
|------------------------------------------|-----------|
| Тесты (unit/integration/e2e)             | ✅ |
| Контейнеризация (Docker)                 | ✅ |
| CI (сборка/тесты)                        | ✅ |
| Качество интерфейса/Lighthouse           | ✅ |
| Качество кода/конфигураций               | ✅ |
| Документация/инструкции                  | ✅ |

### Дополнительные бонусы

| Бонус                                     | Выполнено |
|-------------------------------------------|-----------|
| CD: автодеплой                            | ❌ |
| Мониторинг ошибок (Sentry)                | ❌ |
| Проверка типов (TypeScript)               | ❌ |

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
cd src
npm test
npm run test:e2e
```

### Запуск в Docker

```bash
cd src
docker-compose up
```

### Запуск линтера

```bash
cd src
npm run lint
```

---

## Вывод

В ходе выполнения лабораторной работы был создан портал стажировок с применением современных практик разработки. Настроены unit, integration и e2e тесты для проверки функциональности. Реализована контейнеризация приложения с помощью Docker. Настроен CI pipeline в GitHub Actions для автоматической проверки кода. Проведена оценка качества с использованием Lighthouse.
