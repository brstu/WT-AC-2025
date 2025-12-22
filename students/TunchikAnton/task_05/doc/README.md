# Отчет по лабораторной работе

<p align="center">Министерство образования Республики Беларусь</p>
<p align="center">Учреждение образования</p>
<p align="center">"Брестский Государственный технический университет"</p>
<p align="center">Кафедра ИИТ</p>
<br><br><br><br><br><br>
<p align="center"><strong>Лабораторная работа №05</strong></p>
<p align="center"><strong>По дисциплине:</strong> "Веб-технологии"</p>
<p align="center"><strong>Тема:</strong> Серверное REST API на Node.js + Express (валидация, ошибки, Swagger)</p>
<br><br><br><br><br><br>
<p align="right"><strong>Выполнил:</strong></p>
<p align="right">Студент 4 курса</p>
<p align="right">Группы АС-63</p>
<p align="right">Тунчик А.Д.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Создание полноценного REST API для управления рейтингами и топ-листами на Express с:

- Валидацией входных данных (Zod)
- Централизованной обработкой ошибок
- Документацией OpenAPI/Swagger UI
- Поддержкой фильтрации, поиска, сортировки и пагинации

---

### Вариант №21

#### API рейтингов/топ‑листов

---

## Ход выполнения работы

## 1. Структура проекта

```text
src/
├── src/
│   ├── controllers/
│   │   └── ratingsController.js      # Логика обработки запросов
│   ├── middleware/
│   │   ├── errorHandler.js           # Централизованная обработка ошибок
│   │   └── validate.js               # Валидация входящих данных
│   ├── routes/
│   │   └── ratings.js                # Маршруты API
│   ├── schemas/
│   │   └── ratingSchema.js           # Zod-схемы валидации
│   ├── utils/
│   │   └── ApiError.js               # Кастомные классы ошибок
│   ├── app.js                        # Конфигурация Express приложения
│   └── server.js                     # Точка входа, запуск сервера
├── package.json                      # Зависимости и скрипты                
├── .gitignore                        # Исключения для Git
```

### 2. Реализованные элементы

#### 2.1 Базовая структура Express-приложения

- npm-проект с корректным `package.json`
- Скрипты `dev` (nodemon) и `start` (node)
- Middleware: `express.json()`, `cors`, `morgan`
- Четкая архитектура MVC с разделением ответственности

#### 2.2 Ресурсы API

**Рейтинги/Топ-листы (`/api/v1/ratings`):**

- `GET /` — список рейтингов с параметрами `q`, `category`, `limit`, `offset`, `sortBy`, `order`
- `GET /:id` — получение рейтинга по ID
- `POST /` — создание нового рейтинга
- `PATCH /:id` — частичное обновление рейтинга
- `DELETE /:id` — удаление рейтинга

**Дополнительные endpoint'ы:**

- `GET /health` — проверка работоспособности API
- `GET /docs` — интерактивная документация Swagger UI

### 2.3 Валидация данных

Использована библиотека **Zod** для строгой валидации:

```javascript
const ratingSchema = z.object({
  title: z.string().min(1).max(100),           // Название 1-100 символов
  description: z.string().max(500).optional(), // Описание до 500 символов
  rating: z.number().min(0).max(10),          // Оценка от 0 до 10
  category: z.enum(['movies', 'games', 'books', 'music', 'other']),
  tags: z.array(z.string()).max(10).optional(), // До 10 тегов
  isPublic: z.boolean().default(true),         // Видимость
  dueDate: z.string().refine(val => !isNaN(Date.parse(val))) // Дата ISO
});
```

### 2.4 Централизованная обработка ошибок

Реализован кастомный класс `ApiError` и middleware для обработки:

- Валидационные ошибки (422)
- Ошибки "Не найдено" (404)
- Ошибки клиента (400)
- Серверные ошибки (500)

### 2.5 Документация Swagger

Автоматически генерируемая документация на основе JSDoc комментариев:

- Полное описание всех endpoint'ов
- Примеры запросов и ответов
- Описание схем данных
- Параметры запросов и валидация
- Доступ через `/docs` endpoint

### 2.6 Дополнительные функции (бонусы)

- **Фильтрация и поиск**: по категории, тексту, тегам
- **Сортировка**: по названию, рейтингу, дате создания
- **Пагинация**: с метаданными (total, limit, offset, hasMore)
- **Версионирование API**: `/api/v1/` префикс

## 3. Примеры использования API

## Создание рейтинга фильма

```bash
curl -X POST http://localhost:3000/api/v1/ratings \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Inception",
    "description": "Mind-bending sci-fi thriller",
    "rating": 9.2,
    "category": "movies",
    "tags": ["sci-fi", "thriller", "dream"],
    "isPublic": true,
    "dueDate": "2024-12-31T23:59:59Z"
  }'
```

## Получение рейтингов с фильтрацией

```bash
curl "http://localhost:3000/api/v1/ratings?category=movies&limit=5&offset=0&sortBy=rating&order=desc"
```

## Ответ с пагинацией

```json
{
  "status": "success",
  "data": [...],
  "meta": {
    "total": 42,
    "limit": 5,
    "offset": 0,
    "hasMore": true
  }
}
```

## 4. Тестирование

## Ручное тестирование через скрипт

```bash
#!/bin/bash
# test-api.sh

echo "1. Health check:"
curl -s http://localhost:3000/health

echo -e "\n2. Create test rating:"
curl -s -X POST http://localhost:3000/api/v1/ratings \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "rating": 8.5, "category": "movies"}'

echo -e "\n3. Get all ratings:"
curl -s http://localhost:3000/api/v1/ratings
```

## Автоматическое тестирование (опционально)

```bash
# Установить тестовые зависимости
npm install --save-dev jest supertest

# Запустить тесты
npm test
```

## 5. Инструкция по запуску

## Установка и запуск

```bash
# 1. Клонировать или создать проект
mkdir ratings-api
cd ratings-api

# 2. Установить зависимости
npm install express cors morgan zod swagger-jsdoc swagger-ui-express
npm install --save-dev nodemon

# 3. Создать структуру файлов из кода выше

# 4. Запустить в режиме разработки
npm run dev
# Или в production режиме
npm start
```

## Доступ к API

- **Основное API**: `http://localhost:3000/api/v1/ratings`
- **Документация**: `http://localhost:3000/docs`
- **Health check**: `http://localhost:3000/health`

## 6. Технологии

- **Node.js 18+** — среда выполнения JavaScript
- **Express.js 4.x** — минималистичный веб-фреймворк
- **Zod 3.x** — библиотека для декларативной валидации схем
- **Swagger (OpenAPI 3.0)** — спецификация и документация API
- **swagger-jsdoc + swagger-ui-express** — генерация и отображение документации
- **CORS** — middleware для кросс-доменных запросов
- **Morgan** — middleware для логирования HTTP-запросов
- **Nodemon** — утилита для автоматического перезапуска в dev-режиме

## 7. Вывод

В ходе выполнения лабораторной работы было успешно создано REST API для управления рейтингами и топ-листами с использованием современных технологий и лучших практик разработки.

**Основные достижения:**
1. Реализовано полнофункциональное CRUD API с поддержкой фильтрации, сортировки и пагинации
2. Внедрена строгая валидация данных с помощью библиотеки Zod
3. Создана централизованная система обработки ошибок с кастомными классами
4. Реализована автоматическая генерация документации по OpenAPI спецификации
5. Соблюдены все требования задания и добавлены бонусные функции
6. Создана четкая архитектура проекта с разделением ответственности

API готово к использованию и может быть легко расширено для добавления новых функций, таких как аутентификация пользователей, система комментариев или интеграция с внешними сервисами. Все компоненты системы слабо связаны, что позволяет легко модифицировать и масштабировать приложение в будущем.
