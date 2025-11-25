// ============================================
// Конфигурация
// ============================================
const CONFIG = {
    BASE_URL: 'https://api.tvmaze.com',
    PAGE_SIZE: 12,
    RETRY_ATTEMPTS: 3,
    RETRY_BACKOFF_MS: 1000,
    TIMEOUT_MS: 10000,
    CACHE_TTL_MS: 5 * 60 * 1000 // 5 минут
};

// ============================================
// Простой кэш с TTL (Time To Live)
// ============================================
class SimpleCache {
    constructor(ttl) {
        this.cache = new Map();
        this.ttl = ttl;
    }

    set(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
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
async function fetchWithRetry(url, options = {}) {
    const {
        retries = CONFIG.RETRY_ATTEMPTS,
        backoffMs = CONFIG.RETRY_BACKOFF_MS,
        timeoutMs = CONFIG.TIMEOUT_MS,
        signal
    } = options;

    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
        // Создаём AbortController для таймаута
        const timeoutController = new AbortController();
        const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

        // Объединяем сигналы отмены
        const combinedSignal = signal || timeoutController.signal;

        try {
            updateRetryInfo(attempt, retries);

            const response = await fetch(url, {
                ...options,
                signal: combinedSignal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            clearTimeout(timeoutId);
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

function updateRetryInfo(attempt, maxRetries) {
    const retryInfoEl = document.getElementById('retryInfo');
    if (attempt > 0) {
        retryInfoEl.textContent = `Повторная попытка ${attempt}/${maxRetries}...`;
    } else {
        retryInfoEl.textContent = '';
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

        let data = await fetchWithRetry(url, {
            signal: this.abortController.signal
        });

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

        // Сохраняем в кэш
        this.cache.set(cacheKey, data);
        updateCacheStats(this.cache.size());

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
        
        this.initElements();
        this.attachEventListeners();
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
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        
        this.refreshBtn.addEventListener('click', () => this.handleRefresh());
        this.clearCacheBtn.addEventListener('click', () => this.handleClearCache());
        
        this.prevBtn.addEventListener('click', () => this.handlePrevPage());
        this.nextBtn.addEventListener('click', () => this.handleNextPage());
    }

    async handleSearch() {
        this.currentSearch = this.searchInput.value.trim();
        this.currentPage = 1;
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
        this.errorMessage.textContent = `❌ Ошибка: ${message}`;
        this.errorMessage.style.display = 'block';
        this.gamesList.innerHTML = '';
        this.hidePagination();
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
            <div class="game-card">
                <img 
                    src="${posterPath}" 
                    alt="${game.name}"
                    class="game-image"
                    loading="lazy"
                >
                <div class="game-content">
                    <h3 class="game-title">${game.name}</h3>
                    <div class="game-rating">
                        <span class="rating-value">${rating.toFixed(1)}</span>
                        <span class="rating-stars">${stars}</span>
                    </div>
                    <div class="game-meta">
                        📅 ${premiered} | 📺 ${status}
                    </div>
                    <div class="game-platforms">
                        ${genres.map(g => `<span class="platform-tag">${g}</span>`).join('')}
                        ${language ? `<span class="platform-tag">${language}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    updatePagination(data) {
        const totalResults = data.total || 0;
        this.totalPages = Math.ceil(totalResults / CONFIG.PAGE_SIZE) || 20; // По умолчанию 20 страниц
        
        this.pageInfo.textContent = `Страница ${this.currentPage} из ${Math.min(this.totalPages, 20)}`;
        this.prevBtn.disabled = this.currentPage === 1;
        this.nextBtn.disabled = this.currentPage >= 20; // Ограничиваем 20 страницами
        
        this.pagination.style.display = 'flex';
    }

    hidePagination() {
        this.pagination.style.display = 'none';
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
