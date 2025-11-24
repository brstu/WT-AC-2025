class FilmFestivalManager {
    constructor() {
        this.baseUrl = 'https://my-json-server.typicode.com/KulibinI/Lab3';
        this.cache = new Map();
        this.cacheTtl = 300000;
        this.lastController = null;
        this.requestCount = 0;
        this.cachedRequestsCount = 0;
        this.canceledRequestsCount = 0;

        this.initializeElements();
        this.attachEventListeners();
        this.loadMovies();
    }

    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.genreFilter = document.getElementById('genreFilter');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.clearCacheBtn = document.getElementById('clearCacheBtn');
        this.retryBtn = document.getElementById('retryBtn');
        
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorIndicator = document.getElementById('errorIndicator');
        this.errorMessage = document.getElementById('errorMessage');

        this.moviesGrid = document.getElementById('moviesGrid');
        this.emptyState = document.getElementById('emptyState');

        this.requestCountElement = document.getElementById('requestCount');
        this.cachedCountElement = document.getElementById('cachedCount');
        this.canceledCountElement = document.getElementById('canceledCount');
    }

    attachEventListeners() {
        this.searchInput.addEventListener('input', this.debounce((e) => {
            this.loadMovies(this.getFilters());
        }, 400));

        this.genreFilter.addEventListener('change', () => {
            this.loadMovies(this.getFilters());
        });

        this.refreshBtn.addEventListener('click', () => this.loadMovies(this.getFilters(), true));
        this.clearCacheBtn.addEventListener('click', () => this.clearCache());
        this.retryBtn.addEventListener('click', () => this.loadMovies(this.getFilters()));
    }

    getFilters() {
        return {
            search: this.searchInput.value.trim(),
            genre: this.genreFilter.value
        };
    }

    debounce(fn, ms = 300) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), ms);
        };
    }

    async fetchWithRetry(url, options = {}) {
        const { 
            retries = 3, 
            backoffMs = 500, 
            timeoutMs = 5000, 
            ignoreCache = false 
        } = options;
        
        let attempt = 0;

        const cacheKey = url;
        if (!ignoreCache) {
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                this.cachedRequestsCount++;
                this.updateStats();
                console.log('✅ Данные из кэша:', url);
                return cached;
            }
        }

        while (true) {
            attempt++;

            const controller = new AbortController();
            const timer = setTimeout(() => {
                controller.abort();
            }, timeoutMs);

            if (this.lastController) {
                this.lastController.abort();
                this.canceledRequestsCount++;
                console.log('❌ Предыдущий запрос отменен');
            }
            this.lastController = controller;

            try {
                console.log(`🔄 Попытка ${attempt}: ${url}`);
                const response = await fetch(url, { 
                    signal: controller.signal
                });
                
                clearTimeout(timer);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                this.requestCount++;
                
                this.setToCache(cacheKey, data);
                this.updateStats();
                console.log('✅ Данные получены:', data.length, 'фильмов');
                return data;

            } catch (error) {
                clearTimeout(timer);
                
                if (error.name === 'AbortError') {
                    console.log('⏱️ Таймаут запроса');
                    if (attempt >= retries) {
                        throw new Error(`Превышено время ожидания (${timeoutMs}мс)`);
                    }
                } else {
                    console.log('❌ Ошибка:', error.message);
                }

                if (attempt >= retries) {
                    throw error;
                }

                const delay = backoffMs * Math.pow(2, attempt - 1);
                console.log(`⏳ Повтор через ${delay}мс`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    setToCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
        this.cachedRequestsCount = 0;
        this.updateStats();
        console.log('🧹 Кэш очищен');
    }

    async loadMovies(filters = {}, forceRefresh = false) {
        this.showLoading();
        this.hideError();

        try {
            let url = `${this.baseUrl}/movies`;
            
            const params = new URLSearchParams();
            
            if (filters.search) {
                params.append('q', filters.search);
            }
            
            if (filters.genre) {
                params.append('genre', filters.genre);
            }

            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }

            console.log('📡 Запрос:', url);
            const movies = await this.fetchWithRetry(url, {
                ignoreCache: forceRefresh
            });

            this.hideLoading();
            this.displayMovies(movies);

        } catch (error) {
            this.hideLoading();
            this.showError(error.message);
            console.error('💥 Ошибка загрузки:', error);
        }
    }

    displayMovies(movies) {
        this.moviesGrid.innerHTML = '';
        
        if (!movies || movies.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();

        movies.forEach(movie => {
            const movieCard = this.createMovieCard(movie);
            this.moviesGrid.appendChild(movieCard);
        });

        console.log('🎬 Отображено фильмов:', movies.length);
    }

    createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        const genreIcon = this.getGenreIcon(movie.genre);
        
        card.innerHTML = `
            <div class="movie-poster">
                ${genreIcon}
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-meta">
                    <span class="meta-item">🎬 ${movie.director}</span>
                    <span class="meta-item">📍 ${movie.country}</span>
                    <span class="meta-item">📅 ${movie.year}</span>
                </div>
                <div class="movie-meta">
                    <span class="meta-item">🎭 ${movie.genre}</span>
                    <span class="meta-item">⏱️ ${movie.duration} мин</span>
                </div>
                <p class="movie-description">${movie.description}</p>
                <div class="movie-rating">
                    <span>⭐ ${movie.rating}/10</span>
                    <small>(${movie.votes} оценок)</small>
                </div>
            </div>
        `;

        return card;
    }

    getGenreIcon(genre) {
        const icons = {
            'драма': '🎭',
            'комедия': '😂',
            'фантастика': '🚀',
            'триллер': '🔪'
        };
        return icons[genre] || '🎬';
    }

    showLoading() {
        this.loadingIndicator.classList.remove('hidden');
        this.moviesGrid.classList.add('hidden');
        this.emptyState.classList.add('hidden');
    }

    hideLoading() {
        this.loadingIndicator.classList.add('hidden');
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorIndicator.classList.remove('hidden');
        this.moviesGrid.classList.add('hidden');
        this.emptyState.classList.add('hidden');
    }

    hideError() {
        this.errorIndicator.classList.add('hidden');
    }

    showEmptyState() {
        this.emptyState.classList.remove('hidden');
        this.moviesGrid.classList.add('hidden');
    }

    hideEmptyState() {
        this.emptyState.classList.add('hidden');
        this.moviesGrid.classList.remove('hidden');
    }

    updateStats() {
        this.requestCountElement.textContent = this.requestCount;
        this.cachedCountElement.textContent = this.cachedRequestsCount;
        this.canceledCountElement.textContent = this.canceledRequestsCount;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FilmFestivalManager();
});