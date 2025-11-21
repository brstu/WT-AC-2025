// /mnt/data/main.js
class PokemonCatalog {
    constructor() {
        this.baseUrl = 'http://localhost:3001';
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.searchQuery = '';
        this.lastController = null; // текущий AbortController
        this.cache = new Map(); // key -> { data, totalCount, timestamp }
        this.cacheTTL = 30000; // 30s
        this.totalCount = 0;

        this.initializeElements();
        this.bindEvents();
        this.loadPokemons();
    }

    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.pageInfo = document.getElementById('pageInfo');
        this.pokemonGrid = document.getElementById('pokemonGrid');
        this.loadingState = document.getElementById('loadingState');
        this.errorState = document.getElementById('errorState');
        this.emptyState = document.getElementById('emptyState');
        this.contentState = document.getElementById('contentState');
        this.retryBtn = document.getElementById('retryBtn');
        this.retryIndicator = document.getElementById('retryIndicator');
        this.errorText = document.getElementById('errorText');
    }

    bindEvents() {
        this.searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        this.refreshBtn.addEventListener('click', this.handleRefresh.bind(this));
        this.prevBtn.addEventListener('click', this.handlePrevious.bind(this));
        this.nextBtn.addEventListener('click', this.handleNext.bind(this));
        this.retryBtn.addEventListener('click', () => this.loadPokemons(true));
    }

    debounce(fn, ms = 300) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), ms);
        };
    }

    // fetchWithRetry: returns { data, headers }
    async fetchWithRetry(url, { retries = 3, backoffMs = 500, timeoutMs = 5000 } = {}) {
        let attempt = 0;
        while (true) {
            attempt++;
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);

            try {
                // cancel previous request (if any) to avoid race conditions
                if (this.lastController) {
                    try { this.lastController.abort(); } catch (e) { /* ignore */ }
                }
                this.lastController = controller;

                if (attempt > 1) this.showRetryIndicator(attempt);

                const response = await fetch(url, { signal: controller.signal });
                clearTimeout(timer);

                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

                const data = await response.json();
                this.hideRetryIndicator();
                return { data, headers: response.headers };
            } catch (err) {
                clearTimeout(timer);

                // aborts should be propagated
                if (err.name === 'AbortError') {
                    this.lastController = null;
                    this.hideRetryIndicator();
                    throw err;
                }

                if (attempt >= retries) {
                    this.lastController = null;
                    this.hideRetryIndicator();
                    throw err;
                }

                const delay = backoffMs * Math.pow(2, attempt - 1);
                await new Promise(res => setTimeout(res, delay));
                // next attempt
            }
        }
    }

    getFromCache(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        if ((Date.now() - entry.timestamp) < this.cacheTTL) return entry;
        this.cache.delete(key);
        return null;
    }

    setToCache(key, dataArray, totalCount) {
        this.cache.set(key, { data: dataArray, totalCount: Number.isFinite(totalCount) ? totalCount : 0, timestamp: Date.now() });
    }

    showRetryIndicator(attempt = 1) {
        if (!this.retryIndicator) return;
        const span = this.retryIndicator.querySelector('span');
        if (span) span.textContent = `Retrying... (${attempt})`;
        this.retryIndicator.classList.remove('hidden');
    }
    hideRetryIndicator() { if (this.retryIndicator) this.retryIndicator.classList.add('hidden'); }

    buildApiUrl() {
        const url = `${this.baseUrl}/pokemons`;
        const params = new URLSearchParams();
        if (this.searchQuery) params.append('name_like', this.searchQuery);
        params.append('_page', this.currentPage);
        params.append('_limit', this.itemsPerPage);
        return `${url}?${params.toString()}`;
    }

    async loadPokemons(forceRefresh = false) {
        this.showLoading();
        const url = this.buildApiUrl();

        try {
            if (!forceRefresh) {
                const cached = this.getFromCache(url);
                if (cached) {
                    this.totalCount = cached.totalCount || 0;
                    this.displayPokemons(cached.data);
                    this.updatePagination();
                    return;
                }
            }

            const { data, headers } = await this.fetchWithRetry(url, { retries: 3, backoffMs: 1000, timeoutMs: 8000 });

            // read X-Total-Count from headers (json-server)
            const totalHeader = headers ? headers.get('X-Total-Count') : null;
            const total = totalHeader ? parseInt(totalHeader, 10) : null;
            if (Number.isFinite(total)) this.totalCount = total;
            else this.totalCount = (this.currentPage - 1) * this.itemsPerPage + (Array.isArray(data) ? data.length : 0);

            this.setToCache(url, data, this.totalCount);

            this.displayPokemons(data);
            this.updatePagination();
        } catch (err) {
            this.handleError(err);
        } finally {
            this.lastController = null;
        }
    }

    updatePagination() {
        const maxPage = this.totalCount > 0 ? Math.ceil(this.totalCount / this.itemsPerPage) : null;
        this.pageInfo.textContent = maxPage ? `Page ${this.currentPage} of ${maxPage}` : `Page ${this.currentPage}`;
        this.prevBtn.disabled = this.currentPage === 1;
        if (maxPage) this.nextBtn.disabled = this.currentPage >= maxPage;
        else {
            const currentItems = this.pokemonGrid.querySelectorAll('.pokemon-card').length;
            this.nextBtn.disabled = currentItems < this.itemsPerPage;
        }
    }

    // UI states
    showLoading() { this.hideAllStates(); if (this.loadingState) this.loadingState.classList.remove('hidden'); }
    showError(msg) { this.hideAllStates(); if (this.errorText) this.errorText.textContent = msg; if (this.errorState) this.errorState.classList.remove('hidden'); }
    showEmpty() { this.hideAllStates(); if (this.emptyState) this.emptyState.classList.remove('hidden'); }
    showContent() { this.hideAllStates(); if (this.contentState) this.contentState.classList.remove('hidden'); }
    hideAllStates() { if (this.loadingState) this.loadingState.classList.add('hidden'); if (this.errorState) this.errorState.classList.add('hidden'); if (this.emptyState) this.emptyState.classList.add('hidden'); if (this.contentState) this.contentState.classList.add('hidden'); }

    displayPokemons(pokemons) {
        const list = Array.isArray(pokemons) ? pokemons : (pokemons && pokemons.data) || [];
        this.pokemonGrid.innerHTML = '';

        if (!list || list.length === 0) {
            // show empty only if server returned zero results
            this.showEmpty();
            return;
        }

        this.showContent();
        list.forEach(p => this.pokemonGrid.appendChild(this.createPokemonCard(p)));
    }

    createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
            <div class="pokemon-name">${this.escapeHtml(pokemon.name || '')}</div>
            <div class="pokemon-type">${this.escapeHtml(pokemon.type || '')}</div>
            <div class="pokemon-id">#${String(pokemon.id || '').padStart(3, '0')}</div>
        `;
        return card;
    }

    escapeHtml(str) {
        return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'", '&#39;');
    }

    handleError(err) {
        console.error('[PokemonCatalog]', err);
        if (!err) return this.showError('Unknown error');
        if (err.name === 'AbortError') return this.showError('Request was cancelled.');
        if (err.name === 'TypeError' && err.message && err.message.includes('Failed to fetch')) return this.showError('Network error: check server/connection.');
        if (err.message && (err.message.includes('HTTP 4') || err.message.includes('HTTP 5'))) return this.showError(`Server error: ${err.message}`);
        this.showError(err.message || 'Failed to load data');
    }

    handleSearch(e) {
        this.searchQuery = e.target.value.trim();
        this.currentPage = 1;
        if (this.lastController) { try { this.lastController.abort(); } catch (e) {} this.lastController = null; }
        this.loadPokemons();
    }

    handleRefresh() { this.loadPokemons(true); }
    handlePrevious() { if (this.currentPage > 1) { this.currentPage--; this.loadPokemons(); } }
    handleNext() {
        const maxPage = this.totalCount > 0 ? Math.ceil(this.totalCount / this.itemsPerPage) : null;
        if (maxPage && this.currentPage >= maxPage) return;
        this.currentPage++;
        this.loadPokemons();
    }
}

document.addEventListener('DOMContentLoaded', () => new PokemonCatalog());
