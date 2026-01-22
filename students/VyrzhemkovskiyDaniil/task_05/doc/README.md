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
<p align="right">Выржемковский Д. И.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Создание REST API для микроблога с постами и комментариями на Express с:

- Валидацией входных данных (Zod)
- Централизованной обработкой ошибок
- Документацией OpenAPI/Swagger UI

---

## Вариант №2

### API постов/комментариев для микроблога

---

## Ход выполнения работы

### 1. Структура проекта

```bash
microblog-api/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config.js
│   ├── routes.js
│   ├── controllers.js
│   ├── services.js
│   ├── middlewares.js
│   ├── utils/
│   │   ├── AppError.js
│   │   ├── validation.js
│   │   └── swagger.js
│   └── generateOpenApi.js
├── docs/
│   └── openapi.json
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### 2. Реализованные элементы

#### 2.1 Базовая структура Express-приложения

- npm-проект с корректным `package.json`
- Скрипты `dev` (nodemon) и `start` (node)
- Middleware: `express.json()`, `cors`, `morgan`
- Четкая архитектура с разделением ответственности

#### 2.2 Ресурсы API

**Посты (`/api/v1/posts`):**

- `GET /` — список постов с параметрами `q`, `limit`, `offset`
- `GET /:id` — получение поста по ID
- `POST /` — создание нового поста
- `PUT /:id` — обновление поста
- `DELETE /:id` — удаление поста

**Комментарии:**

- `GET /posts/:postId/comments` — комментарии к посту
- `POST /posts/:postId/comments` — добавление комментария
- `DELETE /comments/:id` — удаление комментария

**Дополнительные endpoint'ы:**

- `GET /api-docs` — документация Swagger UI

#### 2.3 Валидация данных

Использована библиотека **Zod** для строгой валидации:

```javascript
const postSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
  author: z.string().min(1).max(50)
});

const commentSchema = z.object({
  author: z.string().min(1).max(50),
  content: z.string().min(1).max(500)
});
```

#### 2.4 Централизованная обработка ошибок

Реализован кастомный класс `AppError` и middleware для обработки:

- Валидационные ошибки (422)
- Ошибки "Не найдено" (404)
- Серверные ошибки (500)

#### 2.5 Документация Swagger

Автоматически генерируемая документация по OpenAPI 3.0:

- Полное описание всех endpoint'ов
- Примеры запросов и ответов
- Описание схем данных
- Доступ через `/api-docs` endpoint

#### 2.6 Дополнительные функции

- **Поиск**: по тексту в заголовке, содержании и авторе
- **Пагинация**: с метаданными (total, limit, offset)
- **Версионирование API**: `/api/v1/` префикс

### 3. Примеры использования API

**Создание поста:**

```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Мой первый пост",
    "content": "Это содержание моего первого поста в микроблоге",
    "author": "Иван Иванов"
  }'
```

**Получение постов с поиском:**

```bash
curl "http://localhost:3000/api/v1/posts?q=первый&limit=5&offset=0"
```

**Ответ с пагинацией:**

```json
{
  "data": [...],
  "total": 42,
  "limit": 5,
  "offset": 0
}
```

### 4. Тестирование

**Ручное тестирование через curl:**

```bash
# Health check
curl http://localhost:3000/health

# Создание тестового поста
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "content": "Content", "author": "Author"}'

# Получение всех постов
curl http://localhost:3000/api/v1/posts
```

### 5. Инструкция по запуску

**Установка и запуск:**

```bash
# 1. Клонировать проект
git clone <repository-url>
cd microblog-api

# 2. Установить зависимости
npm install

# 3. Создать .env файл из примера
cp .env.example .env

# 4. Запустить в режиме разработки
npm run dev

# 5. Сгенерировать OpenAPI спецификацию
npm run generate-openapi
```

**Доступ к API:**

- **Основное API**: `http://localhost:3000/api/v1/`
- **Документация**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs.json`

### 6. Технологии

- **Node.js 18+** — среда выполнения
- **Express.js 4.x** — веб-фреймворк
- **Zod 3.x** — валидация схем
- **Swagger (OpenAPI 3.0)** — документация API
- **CORS** — кросс-доменные запросы
- **Morgan** — логирование HTTP-запросов
- **UUID** — генерация уникальных идентификаторов

### 7. Вывод

В ходе выполнения лабораторной работы было успешно создано REST API для микроблога с постами и комментариями.

**Основные достижения:**

1. Реализовано полнофункциональное CRUD API для постов и комментариев
2. Внедрена строгая валидация данных с помощью библиотеки Zod
3. Создана централизованная система обработки ошибок
4. Реализована автоматическая генерация документации по OpenAPI
5. Соблюдены все требования задания
6. Создана четкая архитектура проекта

API готово к использованию и может быть легко расширено для добавления новых функций, таких как аутентификация пользователей, лайки или интеграция с базами данных.
