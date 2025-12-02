# Mock API Server для трекера погоды

Mock REST API сервер на базе **json-server** с поддержкой ETag кэширования.

## Возможности

- ✅ Автоматическая генерация REST API из JSON файла
- ✅ Поддержка ETag заголовков (If-None-Match, 304 Not Modified)
- ✅ Пагинация (`_page`, `_limit`)
- ✅ Поиск (`name_like`, `q`)
- ✅ Фильтрация, сортировка
- ✅ Задержка ответа (имитация сети)

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск сервера

```bash
npm start
```

Сервер запустится на `http://localhost:3001`

## Доступные эндпоинты

### Получить все города (с пагинацией)

```http
GET http://localhost:3001/cities?_page=1&_limit=10
```

**Ответ:**
- `X-Total-Count` заголовок с общим количеством
- `Link` заголовок с ссылками на следующую/предыдущую страницы
- `ETag` заголовок для кэширования

### Поиск городов по имени

```http
GET http://localhost:3001/cities?name_like=Moscow
```

### Получить город по ID

```http
GET http://localhost:3001/cities/1
```

### Условный запрос с ETag

```http
GET http://localhost:3001/cities?_page=1&_limit=10
If-None-Match: "abc123"
```

**Ответ:** `304 Not Modified` если данные не изменились

## Структура данных

### City

```json
{
  "id": 1,
  "name": "Moscow",
  "country": "RU",
  "population": 12500000
}
```

## Настройка

### Изменение порта

В `package.json`:

```json
{
  "scripts": {
    "start": "json-server --watch db.json --port 3002 --delay 300"
  }
}
```

### Изменение задержки

`--delay 300` — задержка 300мс для имитации сети

### Отключение задержки

```bash
json-server --watch db.json --port 3001
```

## Особенности ETag

json-server автоматически:

1. Генерирует ETag для каждого ответа
2. Проверяет заголовок `If-None-Match`
3. Возвращает `304 Not Modified` если ETag совпадает
4. Экономит трафик (не отправляет body при 304)

## Отладка

### Просмотр всех городов

Откройте в браузере: http://localhost:3001/cities

### Консоль с логами

json-server показывает все запросы в консоли:

```
GET /cities?_page=1&_limit=10 200 15.123 ms - 1234
GET /cities?_page=2&_limit=10 304 2.456 ms
```

## Примеры запросов

### cURL

```bash
# Первый запрос
curl -i http://localhost:3001/cities?_page=1&_limit=10

# Повторный запрос с ETag
curl -i http://localhost:3001/cities?_page=1&_limit=10 \
  -H "If-None-Match: \"abc123\""
```

### JavaScript (fetch)

```javascript
// Первый запрос
const response = await fetch('http://localhost:3001/cities?_page=1&_limit=10');
const etag = response.headers.get('ETag');
const data = await response.json();

// Повторный запрос с ETag
const response2 = await fetch('http://localhost:3001/cities?_page=1&_limit=10', {
  headers: { 'If-None-Match': etag }
});

if (response2.status === 304) {
  console.log('Данные не изменились, используем кэш');
}
```

## Остановка сервера

Нажмите `Ctrl+C` в терминале

## Сброс данных

Если нужно вернуть исходные данные, просто перезапустите сервер. json-server не изменяет `db.json` при GET запросах.

## Документация json-server

Полная документация: https://github.com/typicode/json-server
