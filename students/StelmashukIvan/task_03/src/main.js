class FilmFestivalManager {
    constructor() {
        this.baseUrl = 'https://my-json-server.typicode.com/KulibinI/Lab3';
        this.cache = new Map();
        this.cacheTtl = 300000;

        this.activeController = null;
        this.requestCount = 0;
        this.cachedRequestsCount = 0;
        this.canceledRequestsCount = 0;

        this.pageSize = 10;
        this.currentPage = 1;

        this.initializeElements();
        this.attachEventListeners();
        this.loadMovies();
    }

    initializeElements() {
        this.searchInput = document.getElementById('search-input');
        this.searchInput.setAttribute('aria-label', 'Поиск по названию фильма');
        this.genreFilter = document.getElementById('genre-filter');
        this.refreshBtn = document.getElementById('refresh-btn');
        this.clearCacheBtn = document.getElementById('clear-cache-btn');
        this.retryBtn = document.getElementById('retry-btn');

        this.loadingIndicator = document.getElementById('loading-indicator');
        this.errorIndicator = document.getElementById('error-indicator');
        this.errorMessage = document.getElementById('error-message');
        this.moviesGrid = document.getElementById('movies-grid');
        this.emptyState = document.getElementById('empty-state');
        this.requestCountElement = document.getElementById('request-count');
        this.cachedCountElement = document.getElementById('cached-count');
        this.canceledCountElement = document.getElementById('canceled-count');

        this.paginationContainer = document.createElement('div');
        this.paginationContainer.className = 'pagination-controls';
        this.paginationContainer.style.marginBottom = '20px';
        this.moviesGrid.parentNode.insertBefore(this.paginationContainer, this.moviesGrid.nextSibling);
    }

    attachEventListeners() {
        this.searchInput.addEventListener('input', this.debounce(() => {
            this.currentPage = 1;
            this.loadMovies(this.getFilters());
        }, 400));

        this.genreFilter.addEventListener('change', () => {
            this.currentPage = 1;
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
            timeoutMs = 7000,
            ignoreCache = false,
            signal: externalSignal = null,
            useETag = true
        } = options;

        const cacheKey = url;

        if (!ignoreCache) {
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                this.cachedRequestsCount++;
                this.updateStats();
                console.log('✅ Возвращаем из кэша:', url);
                return { data: cached.data, totalCount: cached.totalCount || null };
            }
        }

        let attempt = 0;
        while (attempt < retries) {
            attempt++;

            const controller = new AbortController();
            const combinedSignal = this._mergeSignals(externalSignal, controller.signal);

            const timer = setTimeout(() => controller.abort(), timeoutMs);

            try {
                const headers = {};
                const cacheEntry = this.cache.get(cacheKey);
                if (useETag && cacheEntry && cacheEntry.etag) {
                    headers['If-None-Match'] = cacheEntry.etag;
                }

                console.log(`🔄 Попытка ${attempt} => ${url}`);
                const response = await fetch(url, {
                    signal: combinedSignal,
                    headers
                });

                clearTimeout(timer);

                if (response.status === 304) {
                    console.log('304 Not Modified — возвращаем кэш');
                    const cached = this.getFromCache(cacheKey);
                    if (cached) {
                        this.cachedRequestsCount++;
                        this.updateStats();
                        return { data: cached.data, totalCount: cached.totalCount || null };
                    }
                }

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const totalCountHeader = response.headers.get('X-Total-Count');
                const totalCount = totalCountHeader ? parseInt(totalCountHeader, 10) : null;

                const data = await response.json();

                this.requestCount++;
                const etag = response.headers.get('ETag');
                this.setToCache(cacheKey, { data, totalCount }, etag);
                this.updateStats();

                return { data, totalCount };
            } catch (err) {
                clearTimeout(timer);

                if (err.name === 'AbortError') {
                    console.warn('⏱️ Запрос прерван (Abort)');
                    if (attempt >= retries) throw new Error(`Превышено время ожидания (${timeoutMs}мс)`);
                } else {
                    console.warn('❌ Ошибка fetch:', err.message);
                }

                if (attempt >= retries) throw err;

                const delay = Math.floor(backoffMs * Math.pow(2, attempt - 1) + Math.random() * 200);
                await new Promise(r => setTimeout(r, delay));
            }
        }

        throw new Error('Не удалось получить ответ');
    }

    _mergeSignals(external, internal) {
        if (!external) return internal;
        const controller = new AbortController();
        const onAbort = () => controller.abort();
        external.addEventListener('abort', onAbort);
        internal.addEventListener('abort', onAbort);
        return controller.signal;
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
            return cached;
        }
        this.cache.delete(key);
        return null;
    }

    setToCache(key, payload, etag = null) {
        this.cache.set(key, {
            data: payload.data,
            totalCount: payload.totalCount || null,
            timestamp: Date.now(),
            etag
        });
    }

    clearCache() {
        this.cache.clear();
        this.cachedRequestsCount = 0;
        this.updateStats();
        console.log('🧹 Кэш очищен');
    }

    async loadMovies(filters = {}, forceRefresh = false) {
        if (this.activeController) {
            this.activeController.abort();
            this.canceledRequestsCount++;
        }
        this.activeController = new AbortController();

        this.showLoading();
        this.hideError();

        try {
            const params = new URLSearchParams();
            params.append('_limit', this.pageSize);
            params.append('_page', this.currentPage);

            if (filters.search) params.append('q', filters.search);
            if (filters.genre) params.append('genre', filters.genre);

            const url = `${this.baseUrl}/movies?${params.toString()}`;
            console.log('📡 Запрос:', url);

            const { data: movies, totalCount } = await this.fetchWithRetry(url, {
                ignoreCache: forceRefresh,
                signal: this.activeController.signal,
                useETag: true
            });

            this.hideLoading();
            this.displayMovies(movies || []);
            this.renderPagination(totalCount);
        } catch (error) {
            if (error.message && error.message.includes('Превышено время ожидания')) {
                this.showError('Таймаут: слишком долгий ответ от сервера. Попробуйте повторить.');
            } else {
                this.showError(error.message || 'Ошибка загрузки');
            }
            console.error('💥 Ошибка loadMovies:', error);
            this.hideLoading();
        } finally {
            this.activeController = null;
            this.updateStats();
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
        card.tabIndex = 0;

        const genreIcon = this.getGenreIcon(movie.genre);

        card.innerHTML = `
            <div class="movie-poster" aria-hidden="true">
                ${genreIcon}
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${this._escape(movie.title)}</h3>
                <div class="movie-meta">
                    <span class="meta-item">🎬 ${this._escape(movie.director || '—')}</span>
                    <span class="meta-item">📍 ${this._escape(movie.country || '—')}</span>
                    <span class="meta-item">📅 ${this._escape(movie.year || '—')}</span>
                </div>
                <div class="movie-meta">
                    <span class="meta-item">🎭 ${this._escape(movie.genre || '—')}</span>
                    <span class="meta-item">⏱️ ${this._escape(movie.duration || '—')} мин</span>
                </div>
                <p class="movie-description">${this._escape(movie.description || '')}</p>
                <div class="movie-rating">
                    <span>⭐ ${this._escape(movie.rating || '—')}/10</span>
                    <small>(${this._escape(movie.votes || 0)} оценок)</small>
                </div>
            </div>
        `;
        return card;
    }

    renderPagination(totalCount) {
        this.paginationContainer.innerHTML = '';
        if (!totalCount) return;

        const totalPages = Math.ceil(totalCount / this.pageSize);
        const info = document.createElement('div');
        info.textContent = `Страница ${this.currentPage} из ${totalPages} — всего ${totalCount} фильмов`;
        info.style.marginBottom = '8px';
        this.paginationContainer.appendChild(info);

        const controls = document.createElement('div');
        controls.style.display = 'flex';
        controls.style.gap = '8px';

        const prev = document.createElement('button');
        prev.className = 'btn btn-secondary';
        prev.textContent = '← Назад';
        prev.disabled = this.currentPage <= 1;
        prev.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadMovies(this.getFilters());
            }
        });
        controls.appendChild(prev);

        const next = document.createElement('button');
        next.className = 'btn btn-secondary';
        next.textContent = 'Вперёд →';
        next.disabled = this.currentPage >= totalPages;
        next.addEventListener('click', () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.loadMovies(this.getFilters());
            }
        });
        controls.appendChild(next);

        this.paginationContainer.appendChild(controls);
    }

    showLoading() {
        this.loadingIndicator.classList.remove('hidden');
        this.moviesGrid.classList.remove('hidden');
        this.emptyState.classList.add('hidden');
        this.moviesGrid.innerHTML = '';
        this.createSkeleton(Math.min(this.pageSize, 6));
    }

    createSkeleton(count = 4) {
        for (let i = 0; i < count; i++) {
            const sk = document.createElement('div');
            sk.className = 'movie-card skeleton';
            sk.innerHTML = `
                <div class="movie-poster"></div>
                <div class="movie-info">
                    <div style="height:16px;width:60%" class="s-line"></div>
                    <div style="height:12px;width:40%" class="s-line"></div>
                    <div style="height:10px;width:80%" class="s-line"></div>
                </div>
            `;
            this.moviesGrid.appendChild(sk);
        }
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

    getGenreIcon(genre) {
        const icons = {
            'драма': '🎭',
            'комедия': '😂',
            'фантастика': '🚀',
            'триллер': '🔪'
        };
        return icons[genre] || '🎬';
    }

    _escape(s) {
        if (!s) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}

document.addEventListener('DOMContentLoaded', () => new FilmFestivalManager());