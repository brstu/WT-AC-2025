class RecipeManager {
    constructor() {
        this.baseUrl = 'https://www.themealdb.com/api/json/v1/1';
        this.cache = new Map();
        this.cacheTtl = 120000;

        this.activeController = null;
        this.requestCount = 0;
        this.cachedRequestsCount = 0;
        this.canceledRequestsCount = 0;

        this.currentOffset = 0;
        this.itemsPerPage = 9;
        this.hasMore = true;
        this.isLoading = false;
        this.allRecipes = [];

        this.initializeElements();
        this.attachEventListeners();
        this.loadCategories();
        this.loadRecipes();
    }

    initializeElements() {
        this.searchInput = document.getElementById('search-input');
        this.categoryFilter = document.getElementById('category-filter');
        this.refreshBtn = document.getElementById('refresh-btn');
        this.clearCacheBtn = document.getElementById('clear-cache-btn');
        this.retryBtn = document.getElementById('retry-btn');

        this.loadingIndicator = document.getElementById('loading-indicator');
        this.errorIndicator = document.getElementById('error-indicator');
        this.errorMessage = document.getElementById('error-message');
        this.recipesGrid = document.getElementById('recipes-grid');
        this.emptyState = document.getElementById('empty-state');
        this.requestCountElement = document.getElementById('request-count');
        this.cachedCountElement = document.getElementById('cached-count');
        this.canceledCountElement = document.getElementById('canceled-count');

        this.infiniteScrollLoader = document.createElement('div');
        this.infiniteScrollLoader.id = 'infinite-scroll-loader';
        this.infiniteScrollLoader.className = 'infinite-scroll-loader hidden';
        this.infiniteScrollLoader.innerHTML = `
            <div class="spinner"></div>
            <span>Loading more recipes...</span>
        `;
        document.querySelector('.content').appendChild(this.infiniteScrollLoader);
    }

    attachEventListeners() {
        this.searchInput.addEventListener('input', this.debounce(() => {
            this.resetInfiniteScroll();
            this.loadRecipes(this.getFilters());
        }, 400));

        this.categoryFilter.addEventListener('change', () => {
            this.resetInfiniteScroll();
            this.loadRecipes(this.getFilters());
        });

        this.refreshBtn.addEventListener('click', () => {
            this.resetInfiniteScroll();
            this.loadRecipes(this.getFilters(), true);
        });
        this.clearCacheBtn.addEventListener('click', () => this.clearCache());
        this.retryBtn.addEventListener('click', () => {
            this.resetInfiniteScroll();
            this.loadRecipes(this.getFilters());
        });

        window.addEventListener('scroll', this.debounce(() => {
            this.checkInfiniteScroll();
        }, 100));
    }

    resetInfiniteScroll() {
        this.currentOffset = 0;
        this.hasMore = true;
        this.isLoading = false;
        this.allRecipes = [];
        this.hideInfiniteScrollLoader();
    }

    checkInfiniteScroll() {
        if (this.isLoading || !this.hasMore || this.allRecipes.length === 0) return;

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollTop + windowHeight >= documentHeight - 500) {
            this.loadNextPage();
        }
    }

    async loadNextPage() {
        if (this.isLoading || !this.hasMore) return;

        this.isLoading = true;
        this.showInfiniteScrollLoader();

        try {
            this.currentOffset += this.itemsPerPage;
            const recipesToShow = this.allRecipes.slice(this.currentOffset, this.currentOffset + this.itemsPerPage);
            
            if (recipesToShow.length > 0) {
                this.displayMoreRecipes(recipesToShow);
                
                if (this.currentOffset + this.itemsPerPage >= this.allRecipes.length) {
                    this.hasMore = false;
                    this.showEndOfResults();
                }
            } else {
                this.hasMore = false;
            }
        } catch (error) {
            console.error('Error loading next page:', error);
            this.hasMore = false;
        } finally {
            this.isLoading = false;
            this.hideInfiniteScrollLoader();
        }
    }

    displayMoreRecipes(recipes) {
        if (!recipes || recipes.length === 0) {
            this.hasMore = false;
            return;
        }

        recipes.forEach(recipe => {
            const recipeCard = this.createRecipeCard(recipe);
            if (recipeCard) {
                this.recipesGrid.appendChild(recipeCard);
            }
        });

        console.log('🍳 Added recipes:', recipes.length, 'Total shown:', this.currentOffset + recipes.length);
    }

    showEndOfResults() {
        const endElement = document.createElement('div');
        endElement.className = 'end-of-results';
        endElement.textContent = 'All recipes loaded';
        this.recipesGrid.appendChild(endElement);
    }

    showInfiniteScrollLoader() {
        this.infiniteScrollLoader.classList.remove('hidden');
    }

    hideInfiniteScrollLoader() {
        this.infiniteScrollLoader.classList.add('hidden');
    }

    getFilters() {
        return {
            search: this.searchInput.value.trim(),
            category: this.categoryFilter.value
        };
    }

    debounce(fn, ms = 300) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), ms);
        };
    }

    truncateText(text, maxLength = 150) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    async fetchWithRetry(url, options = {}) {
        const {
            retries = 3,
            backoffMs = 500,
            timeoutMs = 10000,
            ignoreCache = false,
            signal: externalSignal = null
        } = options;

        const cacheKey = url;

        if (!ignoreCache) {
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                this.cachedRequestsCount++;
                this.updateStats();
                return cached.data;
            }
        }

        let attempt = 0;
        while (attempt < retries) {
            attempt++;

            const controller = new AbortController();
            const combinedSignal = this.mergeSignals(externalSignal, controller.signal);

            const timer = setTimeout(() => controller.abort(), timeoutMs);

            try {
                const response = await fetch(url, {
                    signal: combinedSignal,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                clearTimeout(timer);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                this.requestCount++;
                this.setToCache(cacheKey, data);
                this.updateStats();

                return data;
            } catch (err) {
                clearTimeout(timer);

                if (err.name === 'AbortError') {
                    if (attempt >= retries) throw new Error(`Timeout exceeded (${timeoutMs}ms)`);
                }

                if (attempt >= retries) throw err;

                const delay = Math.floor(backoffMs * Math.pow(2, attempt - 1) + Math.random() * 200);
                await new Promise(r => setTimeout(r, delay));
            }
        }

        throw new Error('Failed to get response after all attempts');
    }

    mergeSignals(external, internal) {
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
        if (cached) {
            this.cache.delete(key);
        }
        return null;
    }

    setToCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
        this.cachedRequestsCount = 0;
        this.updateStats();
    }

    async loadCategories() {
        try {
            const cacheKey = `${this.baseUrl}/categories.php`;
            let categoriesData = this.getFromCache(cacheKey);
            
            if (!categoriesData) {
                categoriesData = await this.fetchWithRetry(cacheKey);
            }

            if (categoriesData && categoriesData.categories) {
                const categorySelect = document.getElementById('category-filter');
                categorySelect.innerHTML = '<option value="">All Categories</option>';
                
                categoriesData.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.strCategory;
                    option.textContent = category.strCategory;
                    categorySelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadRecipes(filters = {}, forceRefresh = false) {
        if (this.activeController) {
            this.activeController.abort();
            this.canceledRequestsCount++;
        }
        this.activeController = new AbortController();

        this.showLoading();
        this.hideError();
        this.hideInfiniteScrollLoader();

        try {
            const { search, category } = filters || this.getFilters();
            let recipes = [];

            if (!search && !category) {
                forceRefresh = true;
            }

            if (search) {
                recipes = await this.searchRecipes(search, forceRefresh);
            } else if (category) {
                recipes = await this.getRecipesByCategory(category, forceRefresh);
            } else {
                recipes = await this.getRandomRecipes(forceRefresh);
            }

            this.hideLoading();
            
            if (recipes && recipes.length > 0) {
                this.allRecipes = recipes;
                this.displayRecipes(recipes);
                this.hasMore = recipes.length > this.itemsPerPage;
            } else {
                this.showEmptyState();
                this.hasMore = false;
            }
        } catch (error) {
            if (error.message && error.message.includes('Timeout exceeded')) {
                this.showError('Timeout: server response took too long. Please try again.');
            } else {
                this.showError(error.message || 'Error loading recipes');
            }
            this.hideLoading();
        } finally {
            this.activeController = null;
            this.updateStats();
        }
    }

    async searchRecipes(query, forceRefresh = false) {
        const cacheKey = `${this.baseUrl}/search.php?s=${encodeURIComponent(query)}`;
        const data = await this.fetchWithRetry(cacheKey, {
            ignoreCache: forceRefresh,
            signal: this.activeController.signal
        });
        return data.meals || [];
    }

    async getRecipesByCategory(category, forceRefresh = false) {
        const cacheKey = `${this.baseUrl}/filter.php?c=${encodeURIComponent(category)}`;
        const data = await this.fetchWithRetry(cacheKey, {
            ignoreCache: forceRefresh,
            signal: this.activeController.signal
        });
        
        if (!data.meals) return [];
        
        const detailedRecipes = await Promise.all(
            data.meals.map(meal => 
                this.getRecipeDetails(meal.idMeal, forceRefresh)
            )
        );
        
        return detailedRecipes.filter(recipe => recipe !== null);
    }

    async getRandomRecipes(forceRefresh = false) {
        const requests = Array.from({ length: 12 }, () => 
            this.fetchWithRetry(`${this.baseUrl}/random.php`, {
                ignoreCache: forceRefresh,
                signal: this.activeController.signal
            })
        );

        const results = await Promise.all(requests);
        return results.map(result => result.meals[0]).filter(meal => meal);
    }

    async getRecipeDetails(mealId, forceRefresh = false) {
        const cacheKey = `${this.baseUrl}/lookup.php?i=${mealId}`;
        try {
            const data = await this.fetchWithRetry(cacheKey, {
                ignoreCache: forceRefresh,
                signal: this.activeController.signal
            });
            return data.meals ? data.meals[0] : null;
        } catch (error) {
            return null;
        }
    }

    displayRecipes(recipes) {
        this.recipesGrid.innerHTML = '';

        if (!recipes || recipes.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        
        const recipesToShow = recipes.slice(0, this.itemsPerPage);
        this.currentOffset = recipesToShow.length;

        recipesToShow.forEach(recipe => {
            const recipeCard = this.createRecipeCard(recipe);
            if (recipeCard) {
                this.recipesGrid.appendChild(recipeCard);
            }
        });

        console.log('🍳 Recipes shown:', recipesToShow.length, 'Total available:', recipes.length);
    }

    createRecipeCard(recipe) {
        if (!recipe) return null;

        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.tabIndex = 0;

        const ingredients = this.extractIngredients(recipe);
        const tags = recipe.strTags ? recipe.strTags.split(',') : [];

        card.innerHTML = `
            <div class="recipe-image">
                ${recipe.strMealThumb ? 
                    `<img src="${recipe.strMealThumb}" alt="${this.escapeHtml(recipe.strMeal)}" class="recipe-image">` : 
                    '🍳'
                }
            </div>
            <div class="recipe-info">
                <h3 class="recipe-title">${this.escapeHtml(recipe.strMeal)}</h3>
                
                <div class="recipe-meta">
                    <span class="meta-item recipe-category">📁 ${this.escapeHtml(recipe.strCategory)}</span>
                    <span class="meta-item recipe-area">🌍 ${this.escapeHtml(recipe.strArea)}</span>
                </div>

                ${tags.length > 0 ? `
                    <div class="recipe-tags">
                        ${tags.slice(0, 3).map(tag => 
                            `<span class="tag">${this.escapeHtml(tag.trim())}</span>`
                        ).join('')}
                    </div>
                ` : ''}

                ${ingredients.length > 0 ? `
                    <div class="recipe-ingredients">
                        <div class="ingredients-title">🛒 Ingredients:</div>
                        <div class="ingredients-list">${this.escapeHtml(ingredients.slice(0, 5).join(', '))}${ingredients.length > 5 ? '...' : ''}</div>
                    </div>
                ` : ''}
            </div>
        `;

        return card;
    }

    extractIngredients(recipe) {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            
            if (ingredient && ingredient.trim()) {
                let fullIngredient = ingredient.trim();
                if (measure && measure.trim()) {
                    fullIngredient = `${fullIngredient} (${measure.trim()})`;
                }
                ingredients.push(fullIngredient);
            }
        }
        return ingredients;
    }

    showLoading() {
        this.loadingIndicator.classList.remove('hidden');
        this.recipesGrid.classList.remove('hidden');
        this.emptyState.classList.add('hidden');
        this.recipesGrid.innerHTML = '';
        this.createSkeleton(this.itemsPerPage);
    }

    createSkeleton(count = 6) {
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'recipe-card skeleton';
            skeleton.innerHTML = `
                <div class="recipe-image skeleton"></div>
                <div class="recipe-info">
                    <div style="height:20px;width:70%" class="s-line"></div>
                    <div style="height:14px;width:40%" class="s-line"></div>
                    <div style="height:12px;width:90%" class="s-line"></div>
                    <div style="height:12px;width:80%" class="s-line"></div>
                </div>
            `;
            this.recipesGrid.appendChild(skeleton);
        }
    }

    hideLoading() {
        this.loadingIndicator.classList.add('hidden');
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorIndicator.classList.remove('hidden');
        this.recipesGrid.classList.add('hidden');
        this.emptyState.classList.add('hidden');
    }

    hideError() {
        this.errorIndicator.classList.add('hidden');
    }

    showEmptyState() {
        this.emptyState.classList.remove('hidden');
        this.recipesGrid.classList.add('hidden');
    }

    hideEmptyState() {
        this.emptyState.classList.add('hidden');
        this.recipesGrid.classList.remove('hidden');
    }

    updateStats() {
        this.requestCountElement.textContent = this.requestCount;
        this.cachedCountElement.textContent = this.cachedRequestsCount;
        this.canceledCountElement.textContent = this.canceledRequestsCount;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => new RecipeManager());