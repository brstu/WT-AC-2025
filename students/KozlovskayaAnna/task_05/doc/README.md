# Лабораторная работа №5: REST API для подкастов и эпизодов

<p align="center">Министерство образования Республики Беларусь</p>
<p align="center">Учреждение образования</p>
<p align="center">“Брестский Государственный технический университет”</p>
<p align="center">Кафедра ИИТ</p>
<br><br><br><br><br><br>
<p align="center"><strong>Лабораторная работа №5</strong></p>
<p align="center"><strong>По дисциплине:</strong> “Веб-технологии”</p>
<p align="center"><strong>Тема:</strong> “API подкастов/эпизодов.”</p>
<br><br><br><br><br><br>
<p align="right"><strong>Выполнил:</strong></p>
<p align="right">Студент 4 курса</p>
<p align="right">Группы АС-63</p>
<p align="right">Козловская А.Г.></p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А.Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

## Описание проекта

Профессиональное серверное REST API на Express.js для управления подкастами (каналами) и их эпизодами. Проект реализует полный CRUD-функционал с валидацией данных, обработкой ошибок, пагинацией, поиском и фильтрацией.

## Цели

- Разработать REST API для управления подкастами и эпизодами
- Обеспечить полный CRUD с валидацией и обработкой ошибок
- Реализовать поиск, фильтрацию и пагинацию результатов
- Описать и протестировать API через Swagger UI
- Поддержать версионирование API под базовым префиксом `/api/v1`

## Тема

API подкастов/эпизодов на Express.js, с валидацией через Zod и интерактивной документацией Swagger.

## Реализованные компоненты

- Маршруты: [src/routes/podcasts.js](src/routes/podcasts.js), [src/routes/episodes.js](src/routes/episodes.js)
- Контроллеры: [src/controllers/podcastController.js](src/controllers/podcastController.js), [src/controllers/episodeController.js](src/controllers/episodeController.js)
- Схемы данных: [src/schemas/podcastSchemas.js](src/schemas/podcastSchemas.js), [src/schemas/episodeSchemas.js](src/schemas/episodeSchemas.js)
- Middleware: [src/middleware/validate.js](src/middleware/validate.js), [src/middleware/errorHandler.js](src/middleware/errorHandler.js)
- Начальные данные: [src/data/seed.js](src/data/seed.js)
- Точка входа и конфигурация Swagger: [src/index.js](src/index.js)

## Доступность

- Сервер: <http://localhost:3000>
- Документация: <http://localhost:3000/docs>
- База URL API: <http://localhost:3000/api/v1>
- Ответы в формате JSON, CORS включён

## Примечание

- Данные хранятся в памяти (см. [src/data/seed.js](src/data/seed.js)); при перезапуске сервера сбрасываются
- Проект учебный; постоянная БД не используется
- Порт задаётся через переменную окружения `PORT` (по умолчанию 3000)

## Особенности и реализованные требования

### Основной функционал

- ✅ **Полный CRUD** для подкастов и эпизодов
- ✅ **Валидация данных** с помощью Zod с кастомными сообщениями на русском
- ✅ **Централизованная обработка ошибок** (ApiError + errorHandler)
- ✅ **Swagger UI документация** по адресу `/docs`
- ✅ **Версионирование API**: все эндпоинты под `/api/v1`

### Архитектура

- Модульная структура: routes → controllers → data
- Middleware для валидации и обработки ошибок
- Чистый код с комментариями
- ES Modules (import/export)

## API Эндпоинты

### Подкасты (`/api/v1/podcasts`)

| Метод  | URL                    | Описание                          |
|--------|------------------------|-----------------------------------|
| GET    | `/api/v1/podcasts`     | Список подкастов (поиск, пагинация) |
| POST   | `/api/v1/podcasts`     | Создать подкаст                   |
| GET    | `/api/v1/podcasts/:id` | Детали подкаста                   |
| PATCH  | `/api/v1/podcasts/:id` | Обновить подкаст                  |
| DELETE | `/api/v1/podcasts/:id` | Удалить подкаст и его эпизоды     |

#### Параметры запроса (GET `/api/v1/podcasts`)

- `q` — поиск по названию или автору
- `limit` — количество элементов (по умолчанию 10)
- `offset` — смещение для пагинации (по умолчанию 0)

### Эпизоды (`/api/v1/podcasts/:podcastId/episodes`)

| Метод  | URL                                                  | Описание                          |
|--------|------------------------------------------------------|-----------------------------------|
| GET    | `/api/v1/podcasts/:podcastId/episodes`               | Список эпизодов подкаста          |
| POST   | `/api/v1/podcasts/:podcastId/episodes`               | Создать эпизод                    |
| GET    | `/api/v1/podcasts/:podcastId/episodes/:episodeId`    | Детали эпизода                    |
| PATCH  | `/api/v1/podcasts/:podcastId/episodes/:episodeId`    | Обновить эпизод                   |
| DELETE | `/api/v1/podcasts/:podcastId/episodes/:episodeId`    | Удалить эпизод                    |

#### Параметры запроса (GET эпизодов)

- `q` — поиск по названию эпизода
- `season` — фильтр по номеру сезона
- `limit` — количество элементов (по умолчанию 10)
- `offset` — смещение для пагинации (по умолчанию 0)

## Модели данных

### Подкаст (Podcast)

```json
{
  "id": 1,
  "title": "TechBit - Технологии и инновации",
  "author": "Алексей Петров",
  "description": "Описание подкаста...",
  "coverUrl": "https://images.unsplash.com/photo-123.jpg",
  "category": "Technology",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

### Эпизод (Episode)

```json
{
  "id": 1,
  "podcastId": 1,
  "title": "Искусственный интеллект в 2024",
  "description": "Описание эпизода...",
  "duration": 2340,
  "audioUrl": "https://example.com/audio.mp3",
  "publishedAt": "2024-01-22T10:00:00.000Z",
  "season": 1,
  "episodeNumber": 1
}
```

ы

### Создать эпизод

```bash
POST http://localhost:3000/api/v1/podcasts/1/episodes
Content-Type: application/json

{
  "title": "Новый эпизод",
  "description": "Описание эпизода",
  "duration": 1800,
  "audioUrl": "https://example.com/episode.mp3",
  "season": 1,
  "episodeNumber": 5
}
```

## Технологии и зависимости

- **express** — веб-фреймворк
- **zod** — валидация схем данных
- **swagger-jsdoc** — генерация OpenAPI спецификации
- **swagger-ui-express** — интерактивная документация
- **cors** — поддержка CORS
- **morgan** — логирование HTTP-запросов
- **dotenv** — управление переменными окружения
- **nodemon** (dev) — автоперезагрузка сервера

## Особенности реализации

1. **Безопасность**: Стек-трейсы не утекают в ответах API
2. **Валидация**: Zod-схемы с детальными сообщениями ошибок
3. **Ошибки**: Кастомный класс `ApiError` с HTTP-статусами
4. **Документация**: Полные JSDoc-аннотации для Swagger
5. **Начальные данные**: 4 подкаста разных категорий с реалистичными данными

## Ссылка на гитхаб

Ссылка <https://github.com/annkrq/WT-AC-2025/tree/main/students/KozlovskayaAnna/task_04>
