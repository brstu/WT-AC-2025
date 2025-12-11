import { BooksAPI } from './api.js';
import { EnhancedCache } from './cache.js';
import { BooksUI } from './ui.js';

class BooksApp {
  constructor() {
    this.api = new BooksAPI('https://my-json-server.typicode.com/catsker/books-api-lab3');
    this.cache = new EnhancedCache('books_app_cache');
    this.ui = new BooksUI();

    // Конфигурация
    this.config = {
      pageSize: 10,
      debounceDelay: 300,
      retries: 3,
      backoffMs: 1000,
      timeoutMs: 8000
    };

    this.debounceTimer = null;
    this.init();
  }

  /**
   * Инициализация приложения
   */
  init() {
    this.bindEvents();
    this.loadBooks();
  }

  /**
   * Привязка событий
   */
  bindEvents() {
    const { ui } = this;

    // Поиск с дебаунсом
    ui.elements.searchInput.addEventListener('input', (e) => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        // Проверяем, изменился ли поиск
        if (e.target.value !== this.currentSearch) {
          this.currentPage = 1;
          this.currentSearch = e.target.value;
          this.loadBooks();
        }
      }, this.config.debounceDelay);
    });

    // Очистка поиска
    ui.elements.clearSearch.addEventListener('click', () => {
      ui.clearSearch();
      this.currentPage = 1;
      this.currentSearch = '';
      this.loadBooks();
    });

    // Фильтр по жанру
    ui.elements.genreFilter.addEventListener('change', (e) => {
      // Проверяем, изменился ли жанр
      if (e.target.value !== this.currentGenre) {
        this.currentPage = 1;
        this.currentGenre = e.target.value;
        this.loadBooks();
      }
    });

    // Пагинация
    ui.elements.prevBtn.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadBooks();
      }
    });

    ui.elements.nextBtn.addEventListener('click', () => {
      this.currentPage++;
      this.loadBooks();
    });

    // Обновить (игнорируя кэш)
    ui.elements.refreshBtn.addEventListener('click', () => {
      this.loadBooks(true);
    });

    // Отменить запрос
    ui.elements.cancelBtn.addEventListener('click', () => {
      this.api.cancelRequest();
      ui.addDebugLog('Запрос отменен пользователем');
    });

    // Повторить при ошибке
    ui.elements.retryBtn.addEventListener('click', () => {
      this.loadBooks();
    });

    // Обработка ретраев (демонстрация)
    const originalFetchWithRetry = this.api.fetchWithRetry.bind(this.api);
    this.api.fetchWithRetry = async (...args) => {
      try {
        const result = await originalFetchWithRetry(...args);
        return result;
      } catch (error) {
        if (error.message.includes('попытка')) {
          const match = error.message.match(/Попытка (\d+)\/(\d+)/);
          if (match) {
            ui.showRetryIndicator(match[1], match[2]);
          }
        }
        throw error;
      }
    };
  }

  /**
   * Загрузка книг
   */
  async loadBooks(ignoreCache = false) {
    const { ui, api, config } = this;

    // Отменяем предыдущий запрос
    api.cancelRequest();

    ui.showLoading();
    ui.addDebugLog(`Загрузка страницы ${this.currentPage}, поиск: "${this.currentSearch}", жанр: "${this.currentGenre}"`);

    try {
      const options = {
        retries: config.retries,
        backoffMs: config.backoffMs,
        timeoutMs: config.timeoutMs,
        ignoreCache
      };

      // Используем кэш с ETag при возможности
      if (!ignoreCache) {
        const cacheKey = `books_page_${this.currentPage}_${this.currentSearch}_${this.currentGenre}`;
        const cachedResult = await this.cache.checkWithETag(
          `${api.baseURL}/books?_page=${this.currentPage}&_limit=${config.pageSize}&q=${this.currentSearch}&genre=${this.currentGenre}`
        );

        if (cachedResult.cached) {
          ui.updateBooks(cachedResult.data);
          ui.updateCacheIndicator(true);
          ui.addDebugLog('Данные загружены из кэша');
          return;
        }
      }

      // Загрузка с API
      const result = await api.getBooks(
        this.currentPage,
        config.pageSize,
        this.currentSearch,
        this.currentGenre
      );

      // Если результат null (запрос отменен), просто выходим
      if (!result) {
        ui.addDebugLog('Запрос был отменен');
        return;
      }

      ui.updateBooks(result.data);
      ui.updatePagination(result.data.length, config.pageSize);
      ui.updateCacheIndicator(result.fromCache);

      ui.addDebugLog(`Загружено ${result.data.length} книг ${result.fromCache ? 'из кэша' : 'с сервера'}`);

    } catch (error) {
      console.error('Ошибка загрузки книг:', error);
      ui.showError(this.getErrorMessage(error));
      ui.addDebugLog(`Ошибка: ${error.message}`);
    }
  }

  /**
   * Преобразование ошибки в читаемое сообщение
   */
  getErrorMessage(error) {
    if (error.message.includes('Запрос отменен')) {
      return 'Запрос был отменен по таймауту';
    }

    if (error.message.includes('Failed to fetch')) {
      return 'Нет соединения с сервером. Проверьте подключение к интернету.';
    }

    if (error.message.includes('404')) {
      return 'Сервер не найден. Возможно, неправильный адрес API.';
    }

    return `Ошибка: ${error.message}`;
  }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
  const app = new BooksApp();

  // Экспортируем для отладки
  window.booksApp = app;
});
