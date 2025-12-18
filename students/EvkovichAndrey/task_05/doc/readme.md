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

### Запуск в режиме разработки
```bash
npm run dev
```

### Переменные окружения
Создайте файл .env в корне проекта:

```
PORT=3000
NODE_ENV=development
```

# API Endpoints

## Bookings (`/api/bookings`)
- **GET /api/bookings** — получить список бронирований (поддерживает поиск и фильтрацию по типу, датам, статусу)  
- **GET /api/bookings/:id** — получить бронирование по ID  
- **POST /api/bookings** — создать новое бронирование  
- **PATCH /api/bookings/:id** — обновить бронирование  
- **DELETE /api/bookings/:id** — удалить бронирование  

## Hotels (`/api/hotels`)
- **GET /api/hotels** — получить список отелей (поиск по названию, фильтрация по городу, рейтингу, цене)  
- **GET /api/hotels/:id** — получить отель по ID  
- **POST /api/hotels** — добавить новый отель  
- **PATCH /api/hotels/:id** — обновить данные отеля  
- **DELETE /api/hotels/:id** — удалить отель  

## Flights (`/api/flights`)
- **GET /api/flights** — получить список перелётов (поиск по маршруту, фильтрация по дате, авиакомпании, цене)  
- **GET /api/flights/:id** — получить перелёт по ID  
- **POST /api/flights** — добавить новый перелёт  
- **PATCH /api/flights/:id** — обновить данные перелёта  
- **DELETE /api/flights/:id** — удалить перелёт  

## Health Check
- **GET /health** — проверка работоспособности сервера  

## Документация API
Swagger доступен по адресу: `/docs`

---

# Валидация данных

## Бронирование (Booking)
- `customerName`: строка, 1–100 символов  
- `type`: строка, одно из значений (`hotel`, `flight`)  
- `checkInDate`: строка в формате ISO 8601 (для отелей)  
- `checkOutDate`: строка в формате ISO 8601 (для отелей)  
- `flightDate`: строка в формате ISO 8601 (для перелётов)  
- `status`: строка, одно из значений (`confirmed`, `pending`, `cancelled`)  
- `price`: число, >0  

## Отель (Hotel)
- `name`: строка, 1–100 символов  
- `city`: строка, 1–100 символов  
- `rating`: число, 1–5  
- `pricePerNight`: число, >0  

## Перелёт (Flight)
- `airline`: строка, 1–100 символов  
- `origin`: строка, 1–100 символов  
- `destination`: строка, 1–100 символов  
- `departureDate`: строка в формате ISO 8601  
- `arrivalDate`: строка в формате ISO 8601  
- `price`: число, >0  

---

# Коды ответов
- **200** — успешный запрос  
- **201** — ресурс создан  
- **204** — ресурс удалён  
- **400** — неверный запрос  
- **404** — ресурс не найден  
- **422** — ошибка валидации  
- **500** — внутренняя ошибка сервера  

---

# Хранение данных
Данные хранятся в памяти (**in-memory storage**) и сбрасываются при перезапуске сервера.

---

# Пример роутера (Bookings)
```js
import { Router } from 'express';
import {
    getBookings, getBookingById, createBooking,
    updateBooking, deleteBooking
} from '../controllers/bookings.controller.js';
import { validate } from '../middleware/validate.js';
import { createBookingSchema, updateBookingSchema } from '../schemas/booking.schema.js';

const router = Router();

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Получить список бронирований
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [confirmed, pending, cancelled] }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Список бронирований
 */
router.get('/', getBookings);

router.get('/:id', getBookingById);
router.post('/', validate(createBookingSchema), createBooking);
router.patch('/:id', validate(updateBookingSchema), updateBooking);
router.delete('/:id', deleteBooking);

export default router;
```
