# REST API для управления бронированиями (отели/перелёты)

## Описание
RESTful API для управления бронированиями отелей и перелётов с поддержкой поиска, фильтрации, валидации данных, обработкой ошибок и документацией Swagger.

## Запуск проекта

### Требования
- Node.js 16+
- npm

### Установка
```bash
npm install
```
API Endpoints
Bookings (/api/bookings)
GET /api/bookings — получить список бронирований (поддерживает поиск и фильтрацию по типу, датам, статусу)

GET /api/bookings/:id — получить бронирование по ID

POST /api/bookings — создать новое бронирование

PATCH /api/bookings/:id — обновить бронирование

DELETE /api/bookings/:id — удалить бронирование

Hotels (/api/hotels)
GET /api/hotels — получить список отелей (поиск по названию, фильтрация по городу, рейтингу, цене)

GET /api/hotels/:id — получить отель по ID

POST /api/hotels — добавить новый отель

PATCH /api/hotels/:id — обновить данные отеля

DELETE /api/hotels/:id — удалить отель

Flights (/api/flights)
GET /api/flights — получить список перелётов (поиск по маршруту, фильтрация по дате, авиакомпании, цене)

GET /api/flights/:id — получить перелёт по ID

POST /api/flights — добавить новый перелёт

PATCH /api/flights/:id — обновить данные перелёта

DELETE /api/flights/:id — удалить перелёт

Health Check
GET /health — проверка работоспособности сервера

Документация API
Swagger доступен по адресу: /docs

Валидация данных
Бронирование (Booking)
customerName: строка, 1–100 символов

type: строка, одно из значений (hotel, flight)

checkInDate: строка в формате ISO 8601 (для отелей)

checkOutDate: строка в формате ISO 8601 (для отелей)

flightDate: строка в формате ISO 8601 (для перелётов)

status: строка, одно из значений (confirmed, pending, cancelled)

price: число, >0

Отель (Hotel)
name: строка, 1–100 символов

city: строка, 1–100 символов

rating: число, 1–5

pricePerNight: число, >0

Перелёт (Flight)
airline: строка, 1–100 символов

origin: строка, 1–100 символов

destination: строка, 1–100 символов

departureDate: строка в формате ISO 8601

arrivalDate: строка в формате ISO 8601

price: число, >0
