# REST API для управления спортивными лигами и матчами на Node.js + Express

Вариант - 17.
Выполнил - Поплавский Владислав.

RESTful API для управления спортивными лигами и матчами с валидацией, обработкой ошибок и документацией Swagger.

## Запуск проекта

### Требования

* Node.js 16+
* npm

### Установка

npm install

### Запуск в режиме разработки

npm run dev

### Запуск в production

npm start

### Переменные окружения

Создайте файл .env в корне проекта:

PORT=3000
NODE_ENV=development
API_VERSION=v1

## API Endpoints

### Спортивные лиги (/api/v1/leagues)

* GET /api/v1/leagues - получить список лиг (поддерживает поиск и пагинацию)
* GET /api/v1/leagues/:id - получить лигу по ID
* POST /api/v1/leagues - создать новую лигу
* PUT /api/v1/leagues/:id - обновить лигу
* DELETE /api/v1/leagues/:id - удалить лигу

### Матчи (/api/v1/leagues/:leagueId/matches)

* GET /api/v1/leagues/:leagueId/matches - получить матчи лиги
* GET /api/v1/leagues/:leagueId/matches/:matchId - получить матч по ID
* POST /api/v1/leagues/:leagueId/matches - создать новый матч
* PUT /api/v1/leagues/:leagueId/matches/:matchId - обновить матч
* DELETE /api/v1/leagues/:leagueId/matches/:matchId - удалить матч

### Вспомогательные эндпоинты

* GET /api/v1/health - проверка работоспособности сервера
* POST /api/v1/leagues/seed - заполнить начальными данными (только для разработки)

## Документация API

* Документация Swagger доступна по адресу: /api/v1/docs
* Валидация данных
* Лиги (Sports League)

* name: строка, 1-100 символов
* sport: строка, 1-50 символов
* country: строка, 1-50 символов
* season: строка, 1-20 символов
* startDate: строка в формате ISO 8601 (дата в будущем)
* endDate: строка в формате ISO 8601 (после startDate)
* teamsCount: число, 1-100

### Матчи (Match)

* homeTeam: строка, 1-50 символов
* awayTeam: строка, 1-50 символов
* matchDate: строка в формате ISO 8601
* venue: строка, 1-100 символов
* homeScore: число, 0-100 (опционально, по умолчанию 0)
* awayScore: число, 0-100 (опционально, по умолчанию 0)
* status: строка, одно из: scheduled, live, completed, cancelled (по умолчанию scheduled)

## Коды ответов

* 200 - успешный запрос
* 201 - ресурс создан
* 204 - ресурс удален
* 400 - неверный запрос
* 404 - ресурс не найден
* 422 - ошибка валидации
* 500 - внутренняя ошибка сервера

## Хранение данных

Данные хранятся в памяти (in-memory storage) и сбрасываются при перезапуске сервера.

## Фильтрация и пагинация

### Для лиг (GET /api/v1/leagues)

* q - поиск по названию и стране
* sport - фильтр по виду спорта
* country - фильтр по стране
* season - фильтр по сезону
* limit - количество элементов (по умолчанию 10, максимум 100)
* offset - смещение (по умолчанию 0)

### Для матчей (GET /api/v1/leagues/:leagueId/matches)

* status - фильтр по статусу матча
* team - поиск по названию команды
* fromDate - фильтр по дате от
* toDate - фильтр по дате до
* limit - количество элементов
* offset - смещение

## Структура проекта

src/
├── app.js
├── server.js
├── config/
│   └── constants.js
├── controllers/
│   └── leagueController.js
├── docs/
│   └── swagger.js
├── middleware/
│   ├── errorHandler.js
│   ├── notFound.js
│   └── validation.js
├── routes/
│   └── leagues.js
├── services/
│   └── leagueService.js
├── utils/
│   └── errors.js
└── validators/
    └── leagueValidator.js
