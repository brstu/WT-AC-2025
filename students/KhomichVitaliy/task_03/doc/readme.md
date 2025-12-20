# Лабораторная работа 03. Асинхронность и HTTP‑кэш

**Вариант:** 42  
**Студент**: Хомич Виталий  

## Афиша мероприятий города

### Кэш-подход

- **Тип**: In-memory кэш (Map)  
- **TTL**: 5 минут  
- **Ключ**: URL + параметры фильтра (например, категория или поиск)  
- **Инвалидация**: Временная на основе TTL или принудительная при нажатии кнопки «Обновить»

```js
getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
        return cached.data;
    }
    return null;
}
