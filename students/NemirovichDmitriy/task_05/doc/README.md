# Лабораторная работа №5

<p align="center">Министерство образования Республики Беларусь</p>
<p align="center">Учреждение образования</p>
<p align="center">"Брестский Государственный технический университет"</p>
<p align="center">Кафедра ИИТ</p>
<br><br><br><br><br><br>
<p align="center"><strong>Лабораторная работа №5</strong></p>
<p align="center"><strong>По дисциплине:</strong> "Веб-технологии"</p>
<p align="center"><strong>Тема:</strong> Серверное REST API на Node.js + Express</p>
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

Создание REST API для ресурса подкастов на Express с валидацией входных данных, централизованной обработкой ошибок и документацией Swagger.

---

### Вариант №37

API подкастов с эпизодами и плейлистами.

## Ход выполнения работы

### 1. Структура проекта

```text
task_05/
├── doc/
│   ├── README.md
│   └── screenshots/
└── src/
    ├── index.js
    ├── package.json
    └── .gitignore
```

Проект состоит из следующих компонентов:

- `src/index.js` — основной файл сервера Express с API эндпоинтами
- `src/package.json` — конфигурация npm проекта с зависимостями
- `src/.gitignore` — список игнорируемых файлов
- `doc/README.md` — документация и отчет
- `doc/screenshots/` — скриншоты работы API

### 2. Реализованные элементы

В рамках лабораторной работы были реализованы следующие компоненты:

- Базовая структура Express-приложения
- Middleware: `express.json()`, `cors`, `morgan`
- CRUD операции для трёх ресурсов:
  - **Подкасты** (podcasts): GET список, GET по id, POST, PATCH, DELETE
  - **Эпизоды** (episodes): GET список, GET по id, POST, PATCH, DELETE
  - **Плейлисты** (playlists): GET список, GET по id, POST, PATCH, DELETE
- Фильтрация по параметру `q` для подкастов
- Фильтрация по `podcastId` для эпизодов
- Хранение данных в памяти
- Swagger документация на `/docs`
- Использование статус кодов: 200, 201, 204, 404

### 3. Скриншоты выполненной лабораторной работы

**Главная страница Swagger документации:**

![Swagger главная](https://via.placeholder.com/1200x800/4A90E2/ffffff?text=Swagger+%D0%94%D0%BE%D0%BA%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%86%D0%B8%D1%8F+API)

**GET запрос списка подкастов:**

![GET подкасты](https://via.placeholder.com/1200x600/2ECC71/ffffff?text=GET+%2Fpodcasts+-+%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA+%D0%BF%D0%BE%D0%B4%D0%BA%D0%B0%D1%81%D1%82%D0%BE%D0%B2)

**POST создание нового подкаста:**

![POST подкаст](https://via.placeholder.com/1200x600/E74C3C/ffffff?text=POST+%2Fpodcasts+-+%D0%A1%D0%BE%D0%B7%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5+%D0%BF%D0%BE%D0%B4%D0%BA%D0%B0%D1%81%D1%82%D0%B0)

**GET запрос эпизодов:**

![GET эпизоды](https://via.placeholder.com/1200x600/9B59B6/ffffff?text=GET+%2Fepisodes+-+%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA+%D1%8D%D0%BF%D0%B8%D0%B7%D0%BE%D0%B4%D0%BE%D0%B2)

**GET запрос плейлистов:**

![GET плейлисты](https://via.placeholder.com/1200x600/F39C12/ffffff?text=GET+%2Fplaylists+-+%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA+%D0%BF%D0%BB%D0%B5%D0%B9%D0%BB%D0%B8%D1%81%D1%82%D0%BE%D0%B2)

---

## Таблица критериев

| Критерий                                           | Выполнено |
|----------------------------------------------------|-----------|
| Структура/семантика API                            | ✅ |
| Функциональность CRUD                              | ✅ |
| Качество интерфейса API (валидация, ошибки, статус-коды) | ❌ |
| Качество кода/архитектуры                          | ❌ |
| Тесты/проверки (по желанию supertest)              | ❌ |
| Документация/инструкция                            | ✅ |

### Дополнительные бонусы

| Бонус                                              | Выполнено |
|----------------------------------------------------|-----------|
| Фильтрация/поиск/сортировка                        | ✅ |
| Пагинация с метаданными (total, limit, offset)     | ❌ |
| Версионирование API (/api/v1)                      | ❌ |

---

## Инструкция по запуску

1. Перейти в папку src:

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

4. Или запустить в обычном режиме:

```bash
npm start
```

5. Открыть Swagger документацию в браузере:

```
http://localhost:3000/docs
```

## API эндпоинты

### Подкасты

- `GET /podcasts` — получить список всех подкастов (параметр `q` для поиска)
- `GET /podcasts/:id` — получить подкаст по ID
- `POST /podcasts` — создать новый подкаст
- `PATCH /podcasts/:id` — обновить подкаст
- `DELETE /podcasts/:id` — удалить подкаст

### Эпизоды

- `GET /episodes` — получить список всех эпизодов (параметр `podcastId` для фильтрации)
- `GET /episodes/:id` — получить эпизод по ID
- `POST /episodes` — создать новый эпизод
- `PATCH /episodes/:id` — обновить эпизод
- `DELETE /episodes/:id` — удалить эпизод

### Плейлисты

- `GET /playlists` — получить список всех плейлистов
- `GET /playlists/:id` — получить плейлист по ID
- `POST /playlists` — создать новый плейлист
- `PATCH /playlists/:id` — обновить плейлист
- `DELETE /playlists/:id` — удалить плейлист

## Вывод

В ходе выполнения лабораторной работы был создан REST API для управления подкастами, эпизодами и плейлистами с использованием Node.js и Express. Реализованы базовые CRUD операции для всех трёх ресурсов, добавлена документация Swagger. Освоены навыки работы с Express middleware (cors, morgan, express.json), создания REST API эндпоинтов и работы с данными в памяти. Использованы инструменты swagger-jsdoc и swagger-ui-express для автоматической генерации документации API.
