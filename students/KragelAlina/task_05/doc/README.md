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
<p align="right">Крагель А.М.</p>
<p align="right"><strong>Проверил:</strong></p>
<p align="right">Несюк А. Н.</p>
<br><br><br><br><br>
<p align="center"><strong>Брест 2025</strong></p>

---

## Цель работы

Создание полноценного REST API для управления киберспортивными турнирами и командами на Express с:

- Валидацией входных данных (Zod)
- Централизованной обработкой ошибок
- Документацией OpenAPI/Swagger UI
- Поддержкой фильтрации, поиска, сортировки и пагинации

---

### Вариант №10

#### API артов/галерей с лайками

---

## Ход выполнения работы

### 1. Структура проекта

```text
src/
├── data/
│   └── storage.js    
├── middleware/
│   ├── errors.js      
│   ├── errorHandler.js 
│   └── validate.js     
├── routes/
│   ├── tournaments.js     
│   └── teams.js           
├── tests/
│   ├── tournaments.test.js 
│   └── teams.test.js       
├── validators/
│   ├── tournamentValidator.js  
│   └── teamValidator.js       
├── index.js                
├── swagger.js              
├── package.json
├── OpenAPI.json            
├── .env                    
└── .env.example            
```

### 2. Реализованные элементы

#### 2.1 Базовая структура Express-приложения

- ✅ npm-проект с корректным `package.json`
- ✅ Скрипты `dev` (nodemon) и `start` (node)
- ✅ Middleware: `express.json()`, `cors`, `morgan`
- ✅ Переменные окружения через `.env` и `dotenv`

### 2.2 Ресурсы API

**Арты (`/api/v1/teams`):**

- `GET /` — список артов с параметрами `q`, `artType`, `origin`, `isFeatured`, `limit`, `offset`, `sortBy`, `order`
- `GET /:id` — получение арта по ID
- `POST /` — создание нового арта
- `PUT /:id` — полное обновление арта
- `PATCH /:id` — частичное обновление арта
- `DELETE /:id` — удаление арта
- `POST /:id/like` — добавить лайк арту

**Галереи (`/api/v1/tournaments`):**

- `GET /` — список галерей с параметрами `q`, `artType`, `category`, `limit`, `offset`, `sortBy`, `order`
- `GET /:id` — получение галереи по ID
- `POST /` — создание новой галереи
- `PUT /:id` — полное обновление галереи
- `PATCH /:id` — частичное обновление галереи
- `DELETE /:id` — удаление галереи
- `POST /:id/like` — добавить лайк галерее

### 3. Инструкция по запуску

#### Установка зависимостей

```bash
cd src
npm install
```

#### Настройка окружения

```bash
cp .env.example .env
# Отредактируйте .env при необходимости
```

#### Запуск в режиме разработки

```bash
npm run dev
```

#### Запуск в production

```bash
npm start
```

#### Запуск тестов

```bash
npm test
```

После запуска сервер будет доступен по адресу `http://localhost:3000`.

Документация API: `http://localhost:3000/docs`

### 4. Примеры запросов

#### Получить все галереи

```bash
curl http://localhost:3000/api/v1/tournaments
```

#### Получить галереи по типу искусства Painting с сортировкой по лайкам

```bash
curl "http://localhost:3000/api/v1/tournaments?game=CS2&sortBy=prizePool&order=desc"
```

#### Создать новую галерею

```bash
curl -X POST http://localhost:3000/api/v1/tournaments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Major Championship 2025",
    "game": "CS2",
    "startDate": "2025-05-01T10:00:00Z",
    "endDate": "2025-05-15T20:00:00Z",
    "prizePool": 1000000,
    "maxTeams": 32
  }'
```

---

## Таблица критериев

| Критерий                                | Баллы | Выполнено |
|-----------------------------------------|-------|-----------|
| Структура/семантика API                 | 20    | ✅        |
| Функциональность CRUD                   | 25    | ✅        |
| Качество интерфейса API                 | 20    | ✅        |
| Качество кода/архитектуры               | 15    | ✅        |
| Тесты/проверки (supertest)              | 10    | ✅        |
| Документация/инструкция                 | 10    | ✅        |

### Дополнительные бонусы (+10)

| Бонус                                    | Баллы | Выполнено |
|------------------------------------------|-------|-----------|
| Фильтрация/поиск/сортировка              | +3    | ✅        |
| Пагинация с метаданными                  | +3    | ✅        |
| Версионирование API (/api/v1)            | +4    | ✅        |

---

## Технологии

- **Node.js** — среда выполнения JavaScript
- **Express.js** — веб-фреймворк
- **Zod** — валидация данных
- **swagger-jsdoc** — генерация OpenAPI спецификации
- **swagger-ui-express** — интерактивная документация
- **Morgan** — логирование HTTP-запросов
- **CORS** — поддержка кросс-доменных запросов
- **Jest + Supertest** — тестирование
- **Nodemon** — автоматический перезапуск в dev-режиме

---

## Вывод

В ходе выполнения лабораторной работы было создано полноценное REST API для управления артами и галереями с поддержкой лайков.
