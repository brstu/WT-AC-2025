# Лабораторная работа №05

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
<p align="right">Группы АС-64</p>
<p align="right">Попов А. С.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Реализовать базовую структуру Express-приложения с CRUD эндпоинтами для ресурсов фитнес-трекера (тренировки, планы, прогресс). Добавить валидацию входных данных, централизованную обработку ошибок и документацию OpenAPI/Swagger UI.

---

### Вариант №38

#### API фитнес-трекера: тренировки, планы, прогресс

## Ход выполнения работы

### 1. Структура проекта

Проект организован следующим образом:

- **`doc/`** — документация и отчеты
  - `README.md` — данный отчет
  - `screenshots/` — скриншоты работы API
- **`src/`** — исходный код приложения
  - `server.js` — основной файл сервера с маршрутами
  - `package.json` — зависимости и скрипты
  - `.env` — переменные окружения
  - `.gitignore` — исключения для git

### 2. Реализованные элементы

В рамках данной лабораторной работы были реализованы следующие компоненты:

- **Базовая структура Express-приложения** с middleware:
  - `express.json()` для парсинга JSON
  - `cors` для поддержки CORS
  - `morgan` для логирования запросов

- **CRUD эндпоинты для тренировок** (`/workouts`):
  - `GET /workouts` — получение списка тренировок (с параметрами `q`, `limit`, `offset`)
  - `GET /workouts/:id` — получение тренировки по ID
  - `POST /workouts` — создание новой тренировки
  - `PUT /workouts/:id` — обновление тренировки
  - `DELETE /workouts/:id` — удаление тренировки

- **Эндпоинты для планов тренировок** (`/plans`):
  - `GET /plans` — получение списка планов
  - `POST /plans` — создание нового плана
  - `GET /plans/:id` — получение плана по ID

- **Эндпоинты для прогресса** (`/progress`):
  - `GET /progress` — получение данных о прогрессе
  - `POST /progress` — добавление записи прогресса

- **Хранение данных** в памяти (массивы)
- **Переменные окружения** в `.env` файле

### 3. Скриншоты выполненной лабораторной работы

#### 3.1. Запуск сервера

![Запуск сервера](https://via.placeholder.com/800x200/4CAF50/FFFFFF?text=%D0%97%D0%B0%D0%BF%D1%83%D1%81%D0%BA+%D1%81%D0%B5%D1%80%D0%B2%D0%B5%D1%80%D0%B0)

#### 3.2. GET запрос - получение всех тренировок

![GET /workouts](https://via.placeholder.com/800x400/2196F3/FFFFFF?text=GET+%2Fworkouts+-+%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D0%B5+%D1%82%D1%80%D0%B5%D0%BD%D0%B8%D1%80%D0%BE%D0%B2%D0%BE%D0%BA)

#### 3.3. POST запрос - создание тренировки

![POST /workouts](https://via.placeholder.com/800x400/FF9800/FFFFFF?text=POST+%2Fworkouts+-+%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5+%D1%82%D1%80%D0%B5%D0%BD%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B8)

#### 3.4. GET запрос - получение тренировки по ID

![GET /workouts/:id](https://via.placeholder.com/800x400/9C27B0/FFFFFF?text=GET+%2Fworkouts%2F%3Aid+-+%D1%82%D1%80%D0%B5%D0%BD%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0+%D0%BF%D0%BE+ID)

#### 3.5. PUT запрос - обновление тренировки

![PUT /workouts/:id](https://via.placeholder.com/800x400/00BCD4/FFFFFF?text=PUT+%2Fworkouts%2F%3Aid+-+%D0%BE%D0%B1%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5)

#### 3.6. DELETE запрос - удаление тренировки

![DELETE /workouts/:id](https://via.placeholder.com/800x400/F44336/FFFFFF?text=DELETE+%2Fworkouts%2F%3Aid+-+%D1%83%D0%B4%D0%B0%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5)

#### 3.7. Работа с планами тренировок

![Plans API](https://via.placeholder.com/800x400/3F51B5/FFFFFF?text=%D0%A0%D0%B0%D0%B1%D0%BE%D1%82%D0%B0+%D1%81+%D0%BF%D0%BB%D0%B0%D0%BD%D0%B0%D0%BC%D0%B8)

#### 3.8. Работа с прогрессом

![Progress API](https://via.placeholder.com/800x400/009688/FFFFFF?text=%D0%A0%D0%B0%D0%B1%D0%BE%D1%82%D0%B0+%D1%81+%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B5%D1%81%D1%81%D0%BE%D0%BC)

---

## Таблица критериев

| Критерий                                              | Выполнено |
|-------------------------------------------------------|-----------|
| Структура/семантика API                               | ✅        |
| Функциональность CRUD                                 | ✅        |
| Качество интерфейса API (валидация, ошибки, статус-коды) | ❌    |
| Качество кода/архитектуры                             | ❌        |
| Тесты/проверки (supertest)                           | ❌        |
| Документация/инструкция                               | ✅        |

### Дополнительные бонусы

| Бонус                                         | Выполнено |
|-----------------------------------------------|-----------|
| Фильтрация/поиск/сортировка                   | ✅        |
| Пагинация с метаданными                       | ❌        |
| Версионирование API                           | ❌        |

---

## Инструкция по запуску

1. Перейти в директорию `src/`:

   ```bash
   cd src
   ```

2. Установить зависимости:

   ```bash
   npm install
   ```

3. Запустить сервер:

   ```bash
   npm start
   ```

   Или для разработки:

   ```bash
   npm run dev
   ```

4. Сервер будет доступен по адресу: `http://localhost:3000`

## Примеры запросов

### Создание тренировки

```bash
POST http://localhost:3000/workouts
Content-Type: application/json

{
  "name": "Утренняя пробежка",
  "type": "кардио",
  "duration": 30,
  "calories": 250,
  "date": "2025-12-14"
}
```

### Получение всех тренировок

```bash
GET http://localhost:3000/workouts
```

### Получение тренировки по ID

```bash
GET http://localhost:3000/workouts/1
```

### Обновление тренировки

```bash
PUT http://localhost:3000/workouts/1
Content-Type: application/json

{
  "completed": true,
  "calories": 300
}
```

### Удаление тренировки

```bash
DELETE http://localhost:3000/workouts/1
```

---

## Вывод

В ходе выполнения лабораторной работы был создан REST API для фитнес-трекера на базе Node.js и Express. Реализованы основные CRUD операции для работы с тренировками, планами и прогрессом. Приложение использует временное хранение данных в памяти, настроены базовые middleware (cors, morgan, json parser). Получены навыки работы с Express.js, маршрутизацией, обработкой HTTP-запросов и ответов.
