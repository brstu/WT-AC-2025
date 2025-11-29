// ============================================
// Конфигурация
// ============================================
const CONFIG = {
    BASE_URL: 'https://api.tvmaze.com',
    PAGE_SIZE: 12,
    RETRY_ATTEMPTS: 3,
    RETRY_BACKOFF_MS: 1000,
    TIMEOUT_MS: 10000,
    CACHE_TTL_MS: 5 * 60 * 1000, // 5 минут
    DEBOUNCE_DELAY: 300, // задержка дебаунса
    PREFETCH_THRESHOLD: 0.8 // prefetch при 80% прокрутки
};

// ============================================
// Простой кэш с TTL (Time To Live)
// ============================================
class SimpleCache {
    constructor(ttl) {
        this.cache = new Map();
        this.etagCache = new Map(); // ETag кэш
        this.ttl = ttl;
    }

    set(key, value, etag = null) {
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            etag
        });
        if (etag) {
            this.etagCache.set(key, etag);
        }
    }

    getETag(key) {
        const item = this.cache.get(key);
        return item?.etag || null;
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        const age = Date.now() - item.timestamp;
        if (age > this.ttl) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    has(key) {
        return this.get(key) !== null;
    }

    clear() {
        this.cache.clear();
        this.etagCache.clear();
    }

    size() {
        // Удаляем устаревшие записи перед подсчётом
        for (const [key, item] of this.cache.entries()) {
            const age = Date.now() - item.timestamp;
            if (age > this.ttl) {
                this.cache.delete(key);
            }
        }
        return this.cache.size;
    }
}

// ============================================
// Fetch с retry, timeout и AbortController
// ============================================
async function fetchWithRetry(url, options = {}, returnResponse = false) {
    const {
        retries = CONFIG.RETRY_ATTEMPTS,
        backoffMs = CONFIG.RETRY_BACKOFF_MS,
        timeoutMs = CONFIG.TIMEOUT_MS,
        signal,
        headers = {}
    } = options;

    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
        // Создаём AbortController для таймаута
        const timeoutController = new AbortController();
        const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

        // Правильное объединение сигналов
        const combinedController = new AbortController();
        
        const abortHandler = () => combinedController.abort();
        if (signal) {
            signal.addEventListener('abort', abortHandler);
        }
        timeoutController.signal.addEventListener('abort', abortHandler);

        try {
            updateRetryInfo(attempt, retries);

            const response = await fetch(url, {
                ...options,
                headers,
                signal: combinedController.signal
            });

            clearTimeout(timeoutId);
            if (signal) {
                signal.removeEventListener('abort', abortHandler);
            }

            if (!response.ok && response.status !== 304) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Возвращаем response или JSON
            return returnResponse ? response : await response.json();

        } catch (error) {
            clearTimeout(timeoutId);
            if (signal) {
                signal.removeEventListener('abort', abortHandler);
            }
            lastError = error;

            // Если запрос отменён пользователем - не повторяем
            if (error.name === 'AbortError') {
                throw new Error('Запрос отменён');
            }

            // Последняя попытка - бросаем ошибку
            if (attempt === retries) {
                break;
            }

            // Экспоненциальная задержка: 1s, 2s, 4s
            const delay = backoffMs * Math.pow(2, attempt);
            await sleep(delay);
        }
    }

    throw new Error(`Не удалось загрузить данные после ${retries + 1} попыток: ${lastError.message}`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Дебаунс функция с возможностью отмены
function debounce(func, wait) {
    let timeout;
    const executedFunction = function(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
    
    executedFunction.cancel = function() {
        clearTimeout(timeout);
    };
    
    return executedFunction;
}

function updateRetryInfo(attempt, maxRetries) {
    const retryInfoEl = document.getElementById('retry-info');
    if (retryInfoEl) {
        if (attempt > 0) {
            retryInfoEl.textContent = `Повторная попытка ${attempt}/${maxRetries}...`;
            announceToScreenReader(`Повторная попытка ${attempt} из ${maxRetries}`);
        } else {
            retryInfoEl.textContent = '';
        }
    }
}

// Функция для анонсирования screen reader'ам
function announceToScreenReader(message) {
    const announcer = document.getElementById('status-announcer');
    if (announcer) {
        announcer.textContent = message;
        // Очищаем через некоторое время
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }
}

// ============================================
// API клиент
// ============================================
class GamesAPI {
    constructor() {
        this.cache = new SimpleCache(CONFIG.CACHE_TTL_MS);
        this.abortController = null;
        this.requestCount = 0;
    }

    buildUrl(endpoint, params = {}) {
        const url = new URL(`${CONFIG.BASE_URL}${endpoint}`);
        
        for (const [key, value] of Object.entries(params)) {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, value);
            }
        }
        
        return url.toString();
    }

    async fetchGames(searchQuery = '', page = 1, ignoreCache = false) {
        // Отменяем предыдущий запрос
        if (this.abortController) {
            this.abortController.abort();
        }

        this.abortController = new AbortController();

        const cacheKey = `shows_${searchQuery}_${page}`;

        // Проверяем кэш
        if (!ignoreCache && this.cache.has(cacheKey)) {
            console.log('✅ Данные взяты из кэша:', cacheKey);
            announceToScreenReader('Данные загружены из кэша');
            return this.cache.get(cacheKey);
        }

        let url;
        
        if (searchQuery) {
            // Поиск по названию
            url = this.buildUrl('/search/shows', { q: searchQuery });
        } else {
            // Получаем популярные шоу (через schedule)
            url = `${CONFIG.BASE_URL}/shows?page=${page - 1}`;
        }

        this.requestCount++;
        updateRequestStats(this.requestCount);

        console.log('🌐 Запрос к API:', url);

        // Подготовка заголовков для ETag
        const headers = {};
        const cachedETag = this.cache.getETag(cacheKey);
        if (cachedETag && !ignoreCache) {
            headers['If-None-Match'] = cachedETag;
        }

        let response;
        try {
            response = await fetchWithRetry(url, {
                signal: this.abortController.signal,
                headers
            }, true); // возвращаем response, не JSON
        } catch (error) {
            throw error;
        }

        // Обработка 304 Not Modified
        if (response.status === 304) {
            console.log('✅ 304 Not Modified - данные не изменились');
            announceToScreenReader('Данные актуальны, используем кэш');
            return this.cache.get(cacheKey);
        }

        const etag = response.headers.get('ETag');
        let data = await response.json();

        // Нормализуем ответ для поиска
        if (searchQuery && Array.isArray(data)) {
            // Результат поиска возвращает массив с {show: ...}
            data = {
                results: data.slice((page - 1) * CONFIG.PAGE_SIZE, page * CONFIG.PAGE_SIZE).map(item => item.show),
                total: data.length
            };
        } else if (Array.isArray(data)) {
            // Обычный список шоу
            const startIdx = (page - 1) * CONFIG.PAGE_SIZE;
            data = {
                results: data.slice(0, CONFIG.PAGE_SIZE),
                total: 250 // TVMaze имеет 250 страниц
            };
        }

        // Сохраняем в кэш с ETag
        this.cache.set(cacheKey, data, etag);
        updateCacheStats(this.cache.size());
        announceToScreenReader(`Данные загружены: ${data.results?.length || 0} результатов`);

        return data;
    }

    clearCache() {
        this.cache.clear();
        updateCacheStats(0);
        console.log('🗑️ Кэш очищен');
    }

    getCacheSize() {
        return this.cache.size();
    }
}

// ============================================
// UI управление
// ============================================
class GamesUI {
    constructor(api) {
        this.api = api;
        this.currentPage = 1;
        this.currentSearch = '';
        this.totalPages = 1;
        this.prefetchedPages = new Set();
        
        this.initElements();
        this.attachEventListeners();
        this.setupInfiniteScroll();
        
        // Дебаунс для поиска
        this.debouncedSearch = debounce(() => {
            this.handleSearch();
        }, CONFIG.DEBOUNCE_DELAY);
        
        // Intersection Observer для более эффективного prefetch
        this.setupIntersectionObserver();
    }

    initElements() {
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.refreshBtn = document.getElementById('refresh-btn');
        this.clearCacheBtn = document.getElementById('clear-cache-btn');
        this.gamesList = document.getElementById('games-list');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.errorMessage = document.getElementById('error-message');
        this.emptyState = document.getElementById('empty-state');
        this.pagination = document.getElementById('pagination');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.pageInfo = document.getElementById('page-info');
    }

    attachEventListeners() {
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        
        // Дебаунс для поиска при вводе
        this.searchInput.addEventListener('input', () => {
            this.debouncedSearch();
        });
        
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                // Отменяем дебаунс и ищем сразу при Enter
                this.debouncedSearch.cancel?.();
                this.handleSearch();
            }
        });
        
        this.refreshBtn.addEventListener('click', () => this.handleRefresh());
        this.clearCacheBtn.addEventListener('click', () => this.handleClearCache());
        
        this.prevBtn.addEventListener('click', () => this.handlePrevPage());
        this.nextBtn.addEventListener('click', () => this.handleNextPage());
    }

    async handleSearch() {
        this.currentSearch = this.searchInput.value.trim();
        this.currentPage = 1;
        this.prefetchedPages.clear(); // Очищаем prefetch при новом поиске
        await this.loadGames();
    }

    async handleRefresh() {
        await this.loadGames(true);
    }

    handleClearCache() {
        this.api.clearCache();
        this.showMessage('Кэш успешно очищен', 'success');
    }

    async handlePrevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            await this.loadGames();
        }
    }

    async handleNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            await this.loadGames();
        }
    }

    async loadGames(ignoreCache = false) {
        try {
            this.showLoading();
            this.hideError();
            this.hideEmpty();

            const data = await this.api.fetchGames(this.currentSearch, this.currentPage, ignoreCache);

            if (!data.results || data.results.length === 0) {
                this.showEmpty();
                this.hidePagination();
            } else {
                this.renderGames(data.results);
                this.updatePagination(data);
            }

        } catch (error) {
            console.error('Ошибка загрузки:', error);
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        this.loadingIndicator.style.display = 'block';
        this.gamesList.innerHTML = this.createSkeletons(6);
    }

    hideLoading() {
        this.loadingIndicator.style.display = 'none';
    }

    showError(message) {
        const errorText = `❌ Ошибка: ${message}`;
        this.errorMessage.textContent = errorText;
        this.errorMessage.style.display = 'block';
        this.gamesList.innerHTML = '';
        this.hidePagination();
        
        // Анонсируем ошибку для screen readers
        announceToScreenReader(`Ошибка: ${message}`);
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }

    showEmpty() {
        this.emptyState.style.display = 'block';
        this.gamesList.innerHTML = '';
    }

    hideEmpty() {
        this.emptyState.style.display = 'none';
    }

    showMessage(message, type = 'info') {
        const msgEl = this.errorMessage;
        msgEl.textContent = message;
        msgEl.style.background = type === 'success' 
            ? 'rgba(16, 185, 129, 0.1)' 
            : 'rgba(239, 68, 68, 0.1)';
        msgEl.style.borderColor = type === 'success' ? '#10b981' : '#ef4444';
        msgEl.style.color = type === 'success' ? '#10b981' : '#ef4444';
        msgEl.style.display = 'block';
        
        // Анонсируем сообщение для screen readers
        announceToScreenReader(message);

        setTimeout(() => {
            msgEl.style.display = 'none';
        }, 3000);
    }

    createSkeletons(count) {
        return Array.from({ length: count }, () => `
            <div class="skeleton-card">
                <div class="skeleton skeleton-image"></div>
                <div class="skeleton-content">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                </div>
            </div>
        `).join('');
    }

    renderGames(games) {
        // Очищаем предыдущие наблюдения
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        this.gamesList.innerHTML = games.map(game => this.createGameCard(game)).join('');
    }

    createGameCard(game) {
        const rating = game.rating?.average || 0;
        const stars = '⭐'.repeat(Math.round(rating / 2));
        const genres = game.genres?.slice(0, 3) || [];
        const premiered = game.premiered ? new Date(game.premiered).getFullYear() : 'N/A';
        const posterPath = game.image?.medium || 'https://via.placeholder.com/210x295?text=No+Image';
        const status = game.status || 'Unknown';
        const language = game.language || 'EN';

        return `
            <article class="game-card" role="article" tabindex="0" 
                     aria-label="Сериал ${game.name}, рейтинг ${rating.toFixed(1)}">
                <img 
                    src="${posterPath}" 
                    alt="Постер сериала ${game.name}"
                    class="game-image"
                    loading="lazy"
                >
                <div class="game-content">
                    <h3 class="game-title">${game.name}</h3>
                    <div class="game-rating" aria-label="Рейтинг ${rating.toFixed(1)} из 10">
                        <span class="rating-value" aria-hidden="true">${rating.toFixed(1)}</span>
                        <span class="rating-stars" aria-hidden="true">${stars}</span>
                    </div>
                    <div class="game-meta">
                        📅 ${premiered} | 📺 ${status}
                    </div>
                    <div class="game-platforms">
                        ${genres.map(g => `<span class="platform-tag">${g}</span>`).join('')}
                        ${language ? `<span class="platform-tag">${language}</span>` : ''}
                    </div>
                </div>
            </article>
        `;
    }



    hidePagination() {
        this.pagination.style.display = 'none';
    }

    // Настройка infinite scroll для prefetch
    setupInfiniteScroll() {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollTop = window.pageYOffset;
                    const windowHeight = window.innerHeight;
                    const docHeight = document.documentElement.scrollHeight;
                    
                    const scrollPercent = (scrollTop + windowHeight) / docHeight;
                    
                    // Prefetch следующей страницы при достижении порога
                    if (scrollPercent >= CONFIG.PREFETCH_THRESHOLD) {
                        this.prefetchNextPage();
                    }
                    
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Intersection Observer для более точного определения видимости
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                        this.prefetchNextPage();
                    }
                });
            }, {
                root: null,
                rootMargin: '200px',
                threshold: 0.5
            });
        }
    }

    // Prefetch следующей страницы
    async prefetchNextPage() {
        const nextPage = this.currentPage + 1;
        
        // Проверяем, что страница еще не prefetch'ed и не превышает лимит
        if (nextPage <= this.totalPages && 
            nextPage <= 20 && 
            !this.prefetchedPages.has(nextPage)) {
            
            this.prefetchedPages.add(nextPage);
            
            try {
                console.log(`🚀 Prefetch страницы ${nextPage}`);
                await this.api.fetchGames(this.currentSearch, nextPage, false);
                announceToScreenReader(`Предзагружена страница ${nextPage}`);
            } catch (error) {
                console.warn('Ошибка prefetch:', error);
                this.prefetchedPages.delete(nextPage);
            }
        }
    }

    // Обновление пагинации с наблюдением за последними элементами
    updatePagination(data) {
        const totalResults = data.total || 0;
        this.totalPages = Math.ceil(totalResults / CONFIG.PAGE_SIZE) || 20;
        
        this.pageInfo.textContent = `Страница ${this.currentPage} из ${Math.min(this.totalPages, 20)}`;
        this.prevBtn.disabled = this.currentPage === 1;
        this.nextBtn.disabled = this.currentPage >= 20;
        
        this.pagination.style.display = 'flex';
        
        // Наблюдаем за последними карточками для prefetch
        if (this.intersectionObserver) {
            const cards = this.gamesList.querySelectorAll('.game-card');
            const lastCards = Array.from(cards).slice(-2); // Последние 2 карточки
            
            lastCards.forEach(card => {
                this.intersectionObserver.observe(card);
            });
        }
    }
}

// ============================================
// Вспомогательные функции для статистики
// ============================================
function updateCacheStats(size) {
    document.getElementById('cache-stats').textContent = `Кэш: ${size} записей`;
}

function updateRequestStats(count) {
    document.getElementById('request-stats').textContent = `Запросов: ${count}`;
}

// ============================================
// Инициализация приложения
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const api = new GamesAPI();
    const ui = new GamesUI(api);
    
    // Загружаем популярные игры при старте
    ui.loadGames();
    
    console.log('✅ Приложение инициализировано');
    console.log('💡 Используйте DevTools → Network для просмотра кэширования');
});
