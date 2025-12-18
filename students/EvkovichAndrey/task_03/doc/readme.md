# Лабораторная работа 03. Асинхронность и HTTP‑кэш

**Студент:** Евкович Андрей

## Кэш‑подход

- **Тип:** In-memory кэш (Map) + localStorage
- **TTL:** 1 минута
- **Ключ:** `stations:v1`
- **Инвалидация:** Временная на основе TTL

```js

function getCache(key) {
  const inMem = memoryCache.get(key);
  if (inMem && inMem.expiresAt > Date.now()) return inMem.data;

  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt > Date.now()) {
      memoryCache.set(key, parsed);
      return parsed.data;
    } else {
      localStorage.removeItem(key);
    }
  } catch {}
  return null;
}

```

Ретраи

Попытки: 3 (первая + 2 повторные)

Задержка: Экспоненциальный бэкофф (300 → 600 → 1200 мс)

Условия: Таймауты, сетевые ошибки, ответы сервера 5xx

Таймауты
Лимит: 5000 мс

Механизм: AbortController

Действие: Автоматическая отмена запроса при превышении лимита

Отмена запросов
Сценарий: Новый поиск или переключение страниц при активном запросе

Реализация: currentAbort.abort()

Цель: Предотвращение "гонки запросов" и отображения устаревших данных

DevTools — наблюдения
Первый запрос:

Status: 200 OK

Size: данные с сервера (~3 KB JSON)

Time: ~35 мс

Источник: сеть

Повторный запрос:

Status: (нет сетевого запроса, данные из кэша)

Size: memory cache

Time: ~5 мс

Источник: память
