# Лабораторная работа №05

<p align="center">Министерство образования Республики Беларусь</p>
<p align="center">Учреждение образования</p>
<p align="center">"Брестский Государственный технический университет"</p>
<p align="center">Кафедра ИИТ</p>
<br><br><br><br><br><br>
<p align="center"><strong>Лабораторная работа №05</strong></p>
<p align="center"><strong>По дисциплине:</strong> "Веб-технологии"</p>
<p align="center"><strong>Тема:</strong> Серверное REST API на Node.js + Express</p>
<br><br><br><br><br><br>
<p align="right"><strong>Выполнил:</strong></p>
<p align="right">Студент 4 курса</p>
<p align="right">Группы АС-63</p>
<p align="right">Грицук П. Э.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Нестюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Реализовать базовую структуру Express-приложения и CRUD эндпоинты для ресурса библиотеки книг. Добавить валидацию входных данных, обработку ошибок и документацию Swagger.

---

### Вариант №4 - API библиотеки книг с отзывами

## Ход выполнения работы

### 1. Структура проекта

Структура проекта следующая:

```
task_05/
├── doc/
│   ├── README.md
│   └── screenshots/
│       ├── swagger-ui.png
│       ├── get-books.png
│       ├── post-book.png
│       └── delete-book.png
└── src/
    ├── index.js
    ├── package.json
    └── .env
```

- `index.js` — основной файл приложения с Express сервером и всеми эндпоинтами
- `package.json` — конфигурация npm проекта и зависимости
- `.env` — переменные окружения (PORT, NODE_ENV)

### 2. Реализованные элементы

В работе реализованы следующие функциональные возможности:

- Express-приложение с middleware (json, cors, morgan)
- CRUD операции для ресурса "books":
  - GET `/books` - получение списка книг с поддержкой поиска (параметр `q`), пагинации (`limit`, `offset`)
  - GET `/books/:id` - получение книги по ID
  - POST `/books` - создание новой книги
  - PUT `/books/:id` - обновление существующей книги
  - DELETE `/books/:id` - удаление книги
- Базовые эндпоинты для отзывов:
  - GET `/reviews` - получение всех отзывов
  - POST `/reviews` - создание отзыва
- Валидация входных данных с использованием Joi для POST запросов
- Хранение данных в памяти (массивы books и reviews)
- Swagger документация на `/docs`
- Обработка основных ошибок (404, 400, 500)

### 3. Скриншоты выполненной лабораторной работы

#### Swagger UI

![Swagger UI](https://via.placeholder.com/800x400/4A90E2/FFFFFF?text=Swagger+UI+Documentation)

#### GET /books - Получение списка книг

![GET /books](https://via.placeholder.com/800x300/7ED321/FFFFFF?text=GET+/books+-+List+of+Books)

#### POST /books - Создание новой книги

![POST /books](https://via.placeholder.com/800x300/F5A623/FFFFFF?text=POST+/books+-+Create+New+Book)

#### DELETE /books/:id - Удаление книги

![DELETE /books](https://via.placeholder.com/800x300/D0021B/FFFFFF?text=DELETE+/books+-+Remove+Book)

---

## Таблица критериев

| Критерий                                | Выполнено |
|------------------------------------------|-----------|
| Структура/семантика API | ✅ |
| Функциональность CRUD | ✅ |
| Качество интерфейса API (валидация, ошибки, статус-коды) | ✅ |
| Качество кода/архитектуры | ✅ |
| Тесты/проверки | ❌ |
| Документация/инструкция | ✅ |

### Дополнительные бонусы

| Бонус                                     | Выполнено |
|-------------------------------------------|-----------|
| Фильтрация/поиск/сортировка               | ✅ |
| Пагинация с метаданными                   | ✅ |
| Версионирование API                       | ❌ |

---

## Инструкция по запуску

1. Перейти в директорию `src`:

   ```bash
   cd src
   ```

2. Установить зависимости:

   ```bash
   npm install
   ```

3. Запустить сервер в режиме разработки:

   ```bash
   npm run dev
   ```

   Или в обычном режиме:

   ```bash
   npm start
   ```

4. Открыть браузер и перейти по адресу:
   - API: <http://localhost:3000>
   - Swagger документация: <http://localhost:3000/docs>

## Примеры использования API

### Получить все книги

```bash
GET http://localhost:3000/books
```

### Получить книгу по ID

```bash
GET http://localhost:3000/books/1
```

### Создать новую книгу

```bash
POST http://localhost:3000/books
Content-Type: application/json

{
  "title": "Мастер и Маргарита",
  "author": "Михаил Булгаков",
  "year": 1967,
  "isbn": "978-5-17-098347-3"
}
```

### Обновить книгу

```bash
PUT http://localhost:3000/books/1
Content-Type: application/json

{
  "available": false
}
```

### Удалить книгу

```bash
DELETE http://localhost:3000/books/1
```

## Вывод

В ходе выполнения лабораторной работы было создано REST API для библиотеки книг на базе Node.js и Express. Реализованы основные CRUD операции для работы с книгами, добавлена валидация входных данных с помощью библиотеки Joi, настроена документация API через Swagger UI. Приложение использует middleware для обработки CORS, логирования запросов и парсинга JSON. Данные хранятся в памяти приложения в виде массивов. Освоены навыки работы с Express, создания RESTful API, валидации данных и документирования API.
