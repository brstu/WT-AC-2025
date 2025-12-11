/**
 * Модуль для работы с API книг
 */
export class BooksAPI {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.abortController = null;
  }

  /**
   * Функция с ретраями, таймаутами и отменой запросов
   */
  async fetchWithRetry(url, options = {}) {
    const {
      retries = 3,
      backoffMs = 1000,
      timeoutMs = 5000,
      ignoreCache = false
    } = options;

    // Создаем новый AbortController для каждого запроса
    const abortController = new AbortController();
    this.currentAbortController = abortController; // Сохраняем ссылку

    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeoutMs);

    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Проверяем, не отменен ли запрос перед началом попытки
        if (abortController.signal.aborted) {
          throw new AbortError('Запрос отменен');
        }

        const cacheKey = `book_api_${url}`;
        const cachedResponse = !ignoreCache ? this.getCachedResponse(cacheKey) : null;

        if (cachedResponse && !this.isCacheExpired(cachedResponse.timestamp)) {
          clearTimeout(timeoutId);
          return { data: cachedResponse.data, fromCache: true };
        }

        const response = await fetch(url, {
          signal: abortController.signal,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          ...options
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Кэшируем успешный ответ
        if (!ignoreCache) {
          this.cacheResponse(cacheKey, data);
        }

        return { data, fromCache: false };

      } catch (error) {
        // Очищаем таймаут при любой ошибке
        clearTimeout(timeoutId);

        // Если запрос отменен - просто выходим без ошибки
        if (error.name === 'AbortError') {
          console.log('Запрос отменен:', url);
          return null; // Возвращаем null вместо выброса ошибки
        }

        lastError = error;

        // Если это последняя попытка - выбрасываем ошибку
        if (attempt === retries) {
          throw error;
        }

        // Логируем попытку ретрая
        console.log(`Попытка ${attempt}/${retries} не удалась, повтор через ${backoffMs}ms`);

        // Увеличиваем задержку для следующей попытки
        const delay = backoffMs * Math.pow(2, attempt - 1);
        await this.delay(delay);
      }
    }

    throw lastError;
  }

  /**
   * Получить список книг с пагинацией
   */
  async getBooks(page = 1, limit = 10, search = '', genre = '') {
    const url = new URL(`${this.baseURL}/books`);
    url.searchParams.append('_page', page);
    url.searchParams.append('_limit', limit);

    if (search) {
      url.searchParams.append('q', search);
    }

    if (genre) {
      url.searchParams.append('genre', genre);
    }

    return this.fetchWithRetry(url.toString());
  }

  /**
   * Получить детальную информацию о книге
   */
  async getBookDetails(id) {
    const url = `${this.baseURL}/books/${id}`;
    return this.fetchWithRetry(url);
  }

  /**
   * Отменить текущий запрос
   */
  cancelRequest() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Вспомогательные методы для кэширования
   */
  cacheResponse(key, data) {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      ttl: 5 * 60 * 1000 // 5 минут
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
  }

  getCachedResponse(key) {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  }

  isCacheExpired(timestamp) {
    return Date.now() - timestamp > 5 * 60 * 1000; // 5 минут
  }

  clearCache() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('book_api_')) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Задержка выполнения
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class AbortError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AbortError';
  }
}
