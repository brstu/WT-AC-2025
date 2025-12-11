/**
 * Расширенный кэш с поддержкой ETag и If-None-Match
 */
export class EnhancedCache {
  constructor(namespace = 'books_cache') {
    this.namespace = namespace;
    this.cache = new Map();
    this.loadFromStorage();
  }

  /**
   * Получить данные из кэша
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) return null;

    // Проверяем TTL
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return null;
    }

    return item;
  }

  /**
   * Сохранить данные в кэш
   */
  set(key, data, etag = null, ttl = 5 * 60 * 1000) {
    const item = {
      data,
      etag,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };

    this.cache.set(key, item);
    this.saveToStorage();
  }

  /**
   * Проверить актуальность данных через ETag
   */
  async checkWithETag(url, options = {}) {
    const cached = this.get(url);

    if (!cached) {
      return { cached: false };
    }

    // Если есть ETag в кэше, добавляем If-None-Match
    if (cached.etag) {
      options.headers = {
        ...options.headers,
        'If-None-Match': cached.etag
      };
    }

    try {
      const response = await fetch(url, options);

      if (response.status === 304) {
        console.log('Данные не изменились (304), используем кэш');
        return { cached: true, data: cached.data };
      }

      const data = await response.json();
      const etag = response.headers.get('ETag');

      // Обновляем кэш с новым ETag
      this.set(url, data, etag);

      return { cached: false, data };

    } catch (error) {
      console.warn('Ошибка при проверке ETag:', error);
      return { cached: true, data: cached.data };
    }
  }

  /**
   * Удалить данные из кэша
   */
  delete(key) {
    this.cache.delete(key);
    this.saveToStorage();
  }

  /**
   * Очистить весь кэш
   */
  clear() {
    this.cache.clear();
    localStorage.removeItem(this.namespace);
  }

  /**
   * Получить статистику кэша
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Загрузить кэш из localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.namespace);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cache = new Map(parsed);
      }
    } catch (error) {
      console.warn('Не удалось загрузить кэш из хранилища:', error);
    }
  }

  /**
   * Сохранить кэш в localStorage
   */
  saveToStorage() {
    try {
      const serialized = JSON.stringify(Array.from(this.cache.entries()));
      localStorage.setItem(this.namespace, serialized);
    } catch (error) {
      console.warn('Не удалось сохранить кэш в хранилище:', error);
    }
  }
}
