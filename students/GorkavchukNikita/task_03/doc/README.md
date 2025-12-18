# ЛР-03 — Асинхронность и HTTP-кэш

## Описание

Клиент к OMDb API: список фильмов, поиск, пагинация и детальная страница.

## Как запустить

1. Открывать через локальный сервер, а не `file://`.

1. Пример запуска через Python:

```bash
cd students/GorkavchukNikita/task_03/src
python3 -m http.server 8080
```

1. Открыть в браузере:

```text
http://localhost:8080
```

## Кэширование

Используется in-memory `Map` + `localStorage` с TTL.

```js
const memoryCache = new Map();
```

## Retry / Timeout / Abort

Пример: таймаут через `AbortController` и повторные попытки с backoff.

```js
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), timeoutMs);
```

## Скриншоты

- Первый запрос: `img/first_request.png`
- Повторный запрос: `img/second_request.png`
- Обновить без кэша: `img/refresh_no_cache.png`
