class RecipeManager {
    constructor() {
        this.baseUrl = 'https://www.themealdb.com/api/json/v1/1';
        this.cache = new Map();
        this.cacheTtl = 120000;
        this.eTagCache = new Map();
        this.randomRecipeCache = new Set();
        this.allIngredients = [];
        
        this.activeController = null;
        this.requestCount = 0;
        this.cachedRequestsCount = 0;
        this.canceledRequestsCount = 0;
        this.etagSavingsCount = 0;

        this.currentOffset = 0;
        this.itemsPerPage = 9;
        this.hasMore = true;
        this.isLoading = false;
        this.allRecipes = [];
        this.currentSearchType = 'name';

        this.initializeElements();
        this.attachEventListeners();
        this.loadCategories();
        this.loadIngredients();
        this.loadRecipes();
    }

    initializeElements() {
        this.searchInput = document.getElementById('search-input');
        this.ingredientFilter = document.getElementById('ingredient-filter');
        this.ingredientSuggestions = document.getElementById('ingredient-suggestions');
        this.categoryFilter = document.getElementById('category-filter');
        this.refreshBtn = document.getElementById('refresh-btn');
        this.clearCacheBtn = document.getElementById('clear-cache-btn');
        this.retryBtn = document.getElementById('retry-btn');
        this.searchTypeName = document.getElementById('search-type-name');
        this.searchTypeIngredient = document.getElementById('search-type-ingredient');
        this.cacheToggle = document.getElementById('cache-toggle');
        
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.errorIndicator = document.getElementById('error-indicator');
        this.errorMessage = document.getElementById('error-message');
        this.recipesGrid = document.getElementById('recipes-grid');
        this.emptyState = document.getElementById('empty-state');
        this.requestCountElement = document.getElementById('request-count');
        this.cachedCountElement = document.getElementById('cached-count');
        this.canceledCountElement = document.getElementById('canceled-count');
        this.etagSavingsElement = document.getElementById('etag-savings');
        this.ariaLiveRegion = document.getElementById('aria-live-region');

        this.infiniteScrollLoader = document.createElement('div');
        this.infiniteScrollLoader.id = 'infinite-scroll-loader';
        this.infiniteScrollLoader.className = 'infinite-scroll-loader hidden';
        this.infiniteScrollLoader.innerHTML = `
            <div class="spinner" aria-hidden="true"></div>
            <span>Loading more recipes...</span>
        `;
        document.querySelector('.content').appendChild(this.infiniteScrollLoader);
    }

    attachEventListeners() {
        this.searchInput.addEventListener('input', this.debounce(() => {
            this.resetInfiniteScroll();
            this.announceToScreenReader(`Searching for recipes with name: ${this.searchInput.value}`);
            this.loadRecipes(this.getFilters());
        }, 400));

        this.ingredientFilter.addEventListener('input', this.debounce(() => {
            this.resetInfiniteScroll();
            this.announceToScreenReader(`Searching for recipes with ingredient: ${this.ingredientFilter.value}`);
            this.loadRecipes(this.getFilters());
        }, 400));

        this.categoryFilter.addEventListener('change', () => {
            this.resetInfiniteScroll();
            this.announceToScreenReader(`Filtering by category: ${this.categoryFilter.value || 'All'}`);
            this.loadRecipes(this.getFilters());
        });

        this.searchTypeName.addEventListener('click', () => {
            this.setSearchType('name');
        });

        this.searchTypeIngredient.addEventListener('click', () => {
            this.setSearchType('ingredient');
        });

        this.refreshBtn.addEventListener('click', () => {
            this.resetInfiniteScroll();
            this.randomRecipeCache.clear();
            this.announceToScreenReader('Refreshing recipes...');
            this.loadRecipes(this.getFilters(), true);
        });
        
        this.clearCacheBtn.addEventListener('click', () => {
            this.clearCache();
            this.announceToScreenReader('Cache cleared');
        });
        
        this.retryBtn.addEventListener('click', () => {
            this.resetInfiniteScroll();
            this.announceToScreenReader('Retrying to load recipes...');
            this.loadRecipes(this.getFilters());
        });

        this.ingredientFilter.addEventListener('focus', () => {
            if (this.allIngredients.length > 0 && !this.ingredientSuggestions.hasChildNodes()) {
                this.populateIngredientSuggestions();
            }
        });

        window.addEventListener('scroll', this.debounce(() => {
            this.checkInfiniteScroll();
        }, 100));

        this.searchInput.focus();
    }

    setSearchType(type) {
        this.currentSearchType = type;
        
        document.querySelectorAll('.search-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (type === 'name') {
            this.searchTypeName.classList.add('active');
            this.searchInput.style.display = 'block';
            this.ingredientFilter.style.display = 'none';
            this.searchInput.focus();
        } else {
            this.searchTypeIngredient.classList.add('active');
            this.searchInput.style.display = 'none';
            this.ingredientFilter.style.display = 'block';
            this.ingredientFilter.focus();
        }
        
        this.announceToScreenReader(`Now searching by ${type}`);
        this.resetInfiniteScroll();
        this.loadRecipes(this.getFilters());
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
        this.announceToScreenReader('Loading more recipes...');

        try {
            this.currentOffset += this.itemsPerPage;
            const recipesToShow = this.allRecipes.slice(this.currentOffset, this.currentOffset + this.itemsPerPage);
            
            if (recipesToShow.length > 0) {
                this.displayMoreRecipes(recipesToShow);
                
                if (this.currentOffset + this.itemsPerPage >= this.allRecipes.length) {
                    this.hasMore = false;
                    this.showEndOfResults();
                    this.announceToScreenReader('All recipes loaded');
                }
            } else {
                this.hasMore = false;
            }
        } catch (error) {
            console.error('Error loading next page:', error);
            this.hasMore = false;
            this.announceToScreenReader('Error loading more recipes');
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

        this.announceToScreenReader(`Added ${recipes.length} more recipes`);
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
        const searchValue = this.currentSearchType === 'name' 
            ? this.searchInput.value.trim()
            : this.ingredientFilter.value.trim();
            
        return {
            search: searchValue,
            category: this.categoryFilter.value,
            searchType: this.currentSearchType
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
            forceRefresh = false,
            signal: externalSignal = null
        } = options;

        const cacheKey = url;
        const useETag = this.cacheToggle?.checked || false;
        const eTagCacheKey = `etag_${url}`;

        if (!ignoreCache && !forceRefresh) {
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                this.cachedRequestsCount++;
                this.updateStats();
                return cached.data;
            }
        }

        const headers = {
            'Accept': 'application/json'
        };

        if (useETag && !forceRefresh) {
            const eTagData = this.eTagCache.get(eTagCacheKey);
            if (eTagData && eTagData.etag) {
                headers['If-None-Match'] = eTagData.etag;
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
                    headers: headers
                });

                clearTimeout(timer);

                if (response.status === 304) {
                    this.etagSavingsCount++;
                    this.updateStats();
                    
                    const cached = this.getFromCache(cacheKey);
                    if (cached) {
                        this.cachedRequestsCount++;
                        this.updateStats();
                        return cached.data;
                    }
                }

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                this.requestCount++;

                const etag = response.headers.get('ETag');
                if (etag && useETag) {
                    this.eTagCache.set(eTagCacheKey, {
                        etag: etag,
                        timestamp: Date.now()
                    });
                }

                if (!ignoreCache) {
                    this.setToCache(cacheKey, data);
                }

                this.updateStats();

                return data;
            } catch (err) {
                clearTimeout(timer);

                if (err.name === 'AbortError') {
                    if (attempt >= retries) {
                        throw new Error(`Timeout exceeded (${timeoutMs}ms)`);
                    }
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
        const onAbort = () => {
            controller.abort();
            if (external) external.removeEventListener('abort', onAbort);
            if (internal) internal.removeEventListener('abort', onAbort);
        };
        
        if (external) external.addEventListener('abort', onAbort);
        if (internal) internal.addEventListener('abort', onAbort);
        
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
        this.eTagCache.clear();
        this.randomRecipeCache.clear();
        this.cachedRequestsCount = 0;
        this.etagSavingsCount = 0;
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
            this.announceToScreenReader('Error loading categories');
        }
    }

    async loadIngredients() {
        try {
            const cacheKey = `${this.baseUrl}/list.php?i=list`;
            let ingredientsData = this.getFromCache(cacheKey);
            
            if (!ingredientsData) {
                ingredientsData = await this.fetchWithRetry(cacheKey);
            }

            if (ingredientsData && ingredientsData.meals) {
                this.allIngredients = ingredientsData.meals.map(item => item.strIngredient);
                this.populateIngredientSuggestions();
            }
        } catch (error) {
            console.error('Error loading ingredients:', error);
        }
    }

    populateIngredientSuggestions() {
        if (this.allIngredients.length === 0) return;
        
        this.ingredientSuggestions.innerHTML = '';
        this.allIngredients.slice(0, 50).forEach(ingredient => {
            const option = document.createElement('option');
            option.value = ingredient;
            this.ingredientSuggestions.appendChild(option);
        });
    }

    async loadRecipes(filters = {}, forceRefresh = false) {
        if (this.activeController) {
            this.activeController.abort();
            this.canceledRequestsCount++;
            this.updateStats();
        }
        this.activeController = new AbortController();

        this.showLoading();
        this.hideError();
        this.hideInfiniteScrollLoader();

        try {
            const { search, category, searchType } = filters || this.getFilters();
            let recipes = [];

            if (forceRefresh && !search && !category) {
                this.randomRecipeCache.clear();
            }

            if (search) {
                if (searchType === 'ingredient') {
                    recipes = await this.searchRecipesByIngredient(search, forceRefresh);
                } else {
                    recipes = await this.searchRecipes(search, forceRefresh);
                }
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
                this.announceToScreenReader(`Found ${recipes.length} recipes`);
            } else {
                this.showEmptyState();
                this.hasMore = false;
                this.announceToScreenReader('No recipes found');
            }
        } catch (error) {
            if (error.message && error.message.includes('Timeout exceeded')) {
                this.showError('Timeout: server response took too long. Please try again.');
            } else if (error.message && error.message.includes('AbortError')) {
                console.log('Request was aborted');
            } else {
                this.showError(error.message || 'Error loading recipes');
            }
            this.hideLoading();
            this.announceToScreenReader('Error loading recipes');
        } finally {
            this.activeController = null;
            this.updateStats();
        }
    }

    async searchRecipes(query, forceRefresh = false) {
        if (!query || query.trim() === '') {
            return await this.getRandomRecipes(forceRefresh);
        }
        
        const cacheKey = `${this.baseUrl}/search.php?s=${encodeURIComponent(query)}`;
        const data = await this.fetchWithRetry(cacheKey, {
            forceRefresh: forceRefresh,
            signal: this.activeController.signal
        });
        return data.meals || [];
    }

    async searchRecipesByIngredient(ingredient, forceRefresh = false) {
        if (!ingredient || ingredient.trim() === '') {
            return await this.getRandomRecipes(forceRefresh);
        }
        
        const cacheKey = `${this.baseUrl}/filter.php?i=${encodeURIComponent(ingredient)}`;
        const data = await this.fetchWithRetry(cacheKey, {
            forceRefresh: forceRefresh,
            signal: this.activeController.signal
        });
        
        if (!data.meals) return [];
        
        const limitedMeals = data.meals.slice(0, 20);
        
        const detailedRecipes = await Promise.all(
            limitedMeals.map(meal => 
                this.getRecipeDetails(meal.idMeal, forceRefresh)
            )
        );
        
        return detailedRecipes.filter(recipe => recipe !== null);
    }

    async getRandomRecipes(forceRefresh = false) {
        if (forceRefresh) {
            this.randomRecipeCache.clear();
        }
        
        const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
        const randomLetters = [];
        
        for (let i = 0; i < 4; i++) {
            const randomIndex = Math.floor(Math.random() * letters.length);
            randomLetters.push(letters[randomIndex]);
            letters.splice(randomIndex, 1);
        }
        
        try {
            const requests = randomLetters.map(letter => 
                this.fetchWithRetry(`${this.baseUrl}/search.php?f=${letter}`, {
                    ignoreCache: forceRefresh,
                    signal: this.activeController.signal
                })
            );
            
            const results = await Promise.all(requests);
            
            let allRecipes = [];
            results.forEach(result => {
                if (result.meals) {
                    allRecipes = allRecipes.concat(result.meals);
                }
            });
            
            allRecipes = this.shuffleArray(allRecipes);
            
            const uniqueRecipes = [];
            const seenIds = new Set();
            
            for (const recipe of allRecipes) {
                if (recipe && recipe.idMeal && !seenIds.has(recipe.idMeal)) {
                    uniqueRecipes.push(recipe);
                    seenIds.add(recipe.idMeal);
                    this.randomRecipeCache.add(recipe.idMeal);
                    
                    if (uniqueRecipes.length >= 12) {
                        break;
                    }
                }
            }
            
            if (uniqueRecipes.length === 0) {
                console.log('No recipes found by letter search');
                return [];
            }
            
            console.log('Random recipes found by letter search:', uniqueRecipes.length);
            return uniqueRecipes;
        } catch (error) {
            console.error('Error fetching random recipes by letter:', error);
            
            try {
                const fallbackRequests = Array.from({ length: 12 }, (_, index) => {
                    const cacheKey = `${this.baseUrl}/random.php?t=${Date.now()}_${index}`;
                    return this.fetchWithRetry(cacheKey, {
                        ignoreCache: true,
                        signal: this.activeController.signal
                    });
                });
                
                const fallbackResults = await Promise.all(fallbackRequests);
                return fallbackResults.map(result => result.meals ? result.meals[0] : null).filter(meal => meal);
            } catch (fallbackError) {
                console.error('Fallback random recipe fetch failed:', fallbackError);
                return [];
            }
        }
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    async getRecipesByCategory(category, forceRefresh = false) {
        const cacheKey = `${this.baseUrl}/filter.php?c=${encodeURIComponent(category)}`;
        const data = await this.fetchWithRetry(cacheKey, {
            forceRefresh: forceRefresh,
            signal: this.activeController.signal
        });
        
        if (!data.meals) return [];
        
        const limitedMeals = data.meals.slice(0, 20);
        
        const detailedRecipes = await Promise.all(
            limitedMeals.map(meal => 
                this.getRecipeDetails(meal.idMeal, forceRefresh)
            )
        );
        
        return detailedRecipes.filter(recipe => recipe !== null);
    }

    async getRecipeDetails(mealId, forceRefresh = false) {
        const cacheKey = `${this.baseUrl}/lookup.php?i=${mealId}`;
        try {
            const data = await this.fetchWithRetry(cacheKey, {
                forceRefresh: forceRefresh,
                signal: this.activeController.signal
            });
            return data.meals ? data.meals[0] : null;
        } catch (error) {
            console.error('Error fetching recipe details:', error);
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
        
    }

    createRecipeCard(recipe) {
        if (!recipe) return null;

        const card = document.createElement('article');
        card.className = 'recipe-card';
        card.tabIndex = 0;
        card.setAttribute('aria-label', `Recipe: ${recipe.strMeal}`);
        card.setAttribute('role', 'article');

        const ingredients = this.extractIngredients(recipe);
        const tags = recipe.strTags ? recipe.strTags.split(',') : [];

        card.innerHTML = `
            <div class="recipe-image" aria-hidden="true">
                ${recipe.strMealThumb ? 
                    `<img src="${recipe.strMealThumb}" alt="${this.escapeHtml(recipe.strMeal)}" class="recipe-image" loading="lazy">` : 
                    '🍳'
                }
            </div>
            <div class="recipe-info">
                <h3 class="recipe-title">${this.escapeHtml(recipe.strMeal)}</h3>
                
                <div class="recipe-meta">
                    <span class="meta-item recipe-category" aria-label="Category: ${this.escapeHtml(recipe.strCategory)}">
                        <span aria-hidden="true">📁</span> ${this.escapeHtml(recipe.strCategory)}
                    </span>
                    <span class="meta-item recipe-area" aria-label="Area: ${this.escapeHtml(recipe.strArea)}">
                        <span aria-hidden="true">🌍</span> ${this.escapeHtml(recipe.strArea)}
                    </span>
                </div>

                ${tags.length > 0 ? `
                    <div class="recipe-tags" aria-label="Tags">
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

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.announceToScreenReader(`Showing details for ${recipe.strMeal}`);
            }
        });

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
        this.announceToScreenReader('Loading recipes...');
    }

    createSkeleton(count = 6) {
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'recipe-card skeleton';
            skeleton.setAttribute('aria-hidden', 'true');
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
        this.errorIndicator.focus();
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
        this.etagSavingsElement.textContent = this.etagSavingsCount;
    }

    announceToScreenReader(message) {
        this.ariaLiveRegion.textContent = message;
        setTimeout(() => {
            this.ariaLiveRegion.textContent = '';
        }, 1000);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => new RecipeManager());