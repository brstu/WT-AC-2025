# Лабораторная работа — Вариант 27: «API плейлистов/музыки (Express + Swagger)»

## 1) Описание
В рамках лабораторной работы реализован REST API для **плейлистов/музыкальных подборок** на **Node.js + Express** (без БД, временное хранение в JSON-файле и in-memory кэше).  
Проект соответствует требованиям задания и включает:

- базовую структуру npm-проекта + скрипты **dev/start**
- middleware: **express.json()**, **cors**, **morgan**
- ресурс **/api/playlists** с CRUD:
  - `GET` список (поддержка **q, limit, offset**)
  - `GET` по **id**
  - `POST` создание
  - `PUT` полная замена
  - `PATCH` частичное обновление
  - `DELETE` удаление
- валидацию тела запроса:
  - `title` длина **1..100**
  - `done` **boolean**
  - `dueDate` ISO-дата **YYYY-MM-DD**
- обработку ошибок через **кастомные классы ошибок** и **централизованный error handler**
- документацию API через **swagger-jsdoc + swagger-ui-express**:
  - **Swagger UI:** `/docs`
  - **OpenAPI JSON:** `/openapi.json`
  - (опционально) генерация `openapi.json` в корень проекта

## 2) Метаданные
- ФИО: Будник Анна  
- Группа: АС-64  
- StudentID: 220033  
- GitHub: annettebb  
- Вариант: №27  
- Дата: 20.12.2025  

## 3) Параметры варианта
- Тема: **API плейлистов/музыки**
- Ресурс: `playlists` (плейлисты/подборки)
- Базовый URL: `/api/playlists`
- Источник данных: **JSON-файл** `data/playlists.json` + **in-memory cache**
- Поля сущности Playlist:
  - `id`: **uuid**
  - `title`: строка **1..100**
  - `done`: **boolean** (например, “готов/прослушан”)
  - `dueDate`: **YYYY-MM-DD** или `null`
  - `createdAt`, `updatedAt`: ISO datetime
- Поиск/пагинация:
  - `q` — поиск по подстроке в `title` (case-insensitive)
  - `limit` — ограничение (0..100), по умолчанию **10**
  - `offset` — смещение (>=0), по умолчанию **0**
- Статус-коды (по требованиям):
  - `200` — успешный GET/PUT/PATCH
  - `201` — успешный POST
  - `204` — успешный DELETE (без тела)
  - `400` — ошибка параметров запроса (например, `limit/offset` не числа)
  - `404` — не найдено (ресурс/ID/роут)
  - `422` — ошибка валидации тела
  - `500` — внутренняя ошибка сервера

## 4) Реализация и архитектура
Проект разделён на слои, чтобы отделить HTTP-логику от бизнес-логики и хранения данных:

- **routes** (`src/routes/playlists.routes.js`)  
  Описывает маршруты `/api/playlists` и `/api/playlists/:id`, содержит JSDoc-аннотации для Swagger.
- **controllers** (`src/controllers/playlists.controller.js`)  
  Парсит query-параметры, вызывает сервис, формирует ответы и корректные статус-коды.
- **service** (`src/services/playlists.service.js`)  
  Реализует CRUD, фильтрацию по `q`, пагинацию `limit/offset`, генерацию `uuid`, обновление timestamps, а также **валидацию create/update**.
- **repository** (`src/repositories/playlists.repo.js`)  
  Чтение/запись в JSON-файл (`DATA_FILE`) + in-memory кэш, создание файла при отсутствии.
- **errors + middleware**  
  Кастомные ошибки: `BadRequestError (400)`, `NotFoundError (404)`, `ValidationError (422)` и общий `HttpError`.  
  Централизованный обработчик `errorHandler` возвращает единый формат JSON-ошибок.

## 5) Валидация
Реализованы отдельные схемы/проверки:

- **Create (POST)**:  
  - `title` обязателен, длина **1..100**  
  - `done` опционально (если передан — boolean)  
  - `dueDate` опционально (если передан — валидная дата `YYYY-MM-DD`)

- **Update (PATCH)**:  
  - разрешены только поля `title/done/dueDate`  
  - тело не может быть пустым  
  - каждый переданный параметр проверяется по типу/формату

- **Replace (PUT)**:  
  - строгая логика “замены”: `title` обязателен + `done` обязателен (boolean), `dueDate` опционально

При ошибках валидации API возвращает **422** и список ошибок по полям.

## 6) Документация (Swagger / OpenAPI)
Документация автоматически формируется из JSDoc-комментариев:

- `/docs` — Swagger UI для ручного тестирования эндпоинтов
- `/openapi.json` — JSON-спецификация OpenAPI 3.0
- `npm run openapi` — генерация файла `openapi.json` в корень проекта (артефакт для сдачи при необходимости)

## 7) Примеры запросов (ручная проверка)

### Создание плейлиста
```bash
curl -X POST http://localhost:3000/api/playlists \
  -H "Content-Type: application/json" \
  -d '{"title":"Workout Mix","done":false,"dueDate":"2026-01-15"}'
