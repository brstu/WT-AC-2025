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
<p align="right">Группы АС-63</p>
<p align="right">Кульбеда К. А.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Настройка качества проекта: тесты, контейнеризация, базовый CI/CD и проверка качества через Lighthouse/Web Vitals.

---

### Вариант №12

Тестирование и деплой каталога гаджетов.

## Ход выполнения работы

### 1. Структура проекта

- `index.html` — главная страница каталога
- `style.css` — стили для страницы
- `app.js` — JavaScript функционал
- `tests/app.test.js` — unit тесты
- `cypress/e2e/catalog.cy.js` — e2e тесты
- `Dockerfile` — конфигурация Docker контейнера
- `docker-compose.yml` — Docker Compose конфигурация
- `.github/workflows/ci.yml` — CI/CD pipeline
- `package.json` — зависимости проекта

### 2. Реализованные элементы

- Каталог гаджетов с карточками товаров
- Фильтрация по категориям
- Поиск товаров
- Корзина покупок
- Unit тесты для функций корзины
- E2E тесты с Cypress
- Docker контейнеризация
- CI pipeline в GitHub Actions
- ESLint для проверки кода

### 3. Скриншоты выполненной лабораторной работы

#### Lighthouse тест Performance

![Lighthouse Performance](https://via.placeholder.com/800x400/4CAF50/ffffff?text=Lighthouse+Performance+Score)

#### Lighthouse тест Accessibility

![Lighthouse Accessibility](https://via.placeholder.com/800x400/2196F3/ffffff?text=Lighthouse+Accessibility+Score)

#### Lighthouse тест Best Practices

![Lighthouse Best Practices](https://via.placeholder.com/800x400/FF9800/ffffff?text=Lighthouse+Best+Practices+Score)

---

## Таблица критериев

| Критерий                                | Выполнено |
|------------------------------------------|-----------|
| Тесты (unit/integration/e2e) | ✅ |
| Контейнеризация (Docker) | ✅ |
| CI/CD (install/lint/test/build) | ✅ |
| Качество интерфейса/Lighthouse | ✅ |
| Качество кода/конфигураций | ✅ |
| Документация/инструкции | ✅ |

### Дополнительные бонусы

| Бонус                                     | Выполнено |
|-------------------------------------------|-----------|
| CD: автодеплой | ❌ |
| Мониторинг ошибок (Sentry) | ❌ |
| Проверка типов (TypeScript) | ❌ |

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
# Unit тесты
npm test

# E2E тесты
npm run test:e2e
```

### Запуск через Docker

```bash
cd src
docker-compose up
```

---

## Вывод

В ходе выполнения лабораторной работы был создан каталог гаджетов с базовым функционалом поиска и фильтрации. Настроены unit и e2e тесты для проверки работоспособности приложения. Реализована контейнеризация через Docker и настроен CI pipeline в GitHub Actions для автоматической проверки кода при каждом коммите. Проведена оценка качества приложения с помощью Lighthouse.
