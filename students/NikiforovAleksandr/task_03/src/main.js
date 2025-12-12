class Cache {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 5 * 60 * 1000;
    }

    set(key, data, ttl = this.defaultTTL) {
        const item = {
            data,
            expiresAt: Date.now() + ttl,
            createdAt: Date.now()
        };
        this.cache.set(key, item);
        console.log(`Кэш: сохранено ${key}, TTL: ${ttl}ms`);
        this.updateCacheStatus();
    }

    get(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            console.log(`Кэш: промах для ${key}`);
            this.updateCacheStatus();
            return null;
        }

        if (Date.now() > item.expiresAt) {
            console.log(`Кэш: истек срок для ${key}`);
            this.cache.delete(key);
            this.updateCacheStatus();
            return null;
        }

        console.log(`Кэш: попадание для ${key}, осталось: ${item.expiresAt - Date.now()}ms`);
        this.updateCacheStatus();
        return item.data;
    }

    delete(key) {
        this.cache.delete(key);
        console.log(`Кэш: удалено ${key}`);
        this.updateCacheStatus();
    }

    clear() {
        const count = this.cache.size;
        this.cache.clear();
        console.log(`Кэш: очищен, удалено ${count} элементов`);
        this.updateCacheStatus();
        return count;
    }

    getStats() {
        const now = Date.now();
        let valid = 0;
        let expired = 0;
        let totalSize = 0;

        for (const [key, item] of this.cache.entries()) {
            const dataSize = JSON.stringify(item.data).length;
            totalSize += dataSize;
            
            if (now > item.expiresAt) {
                expired++;
            } else {
                valid++;
            }
        }

        return {
            total: this.cache.size,
            valid,
            expired,
            memoryUsage: `${(totalSize / 1024).toFixed(2)} KB`
        };
    }

    has(key) {
        return this.cache.has(key);
    }

    updateCacheStatus() {
        const stats = this.getStats();
        const cacheStatus = document.getElementById('cache-status');
        
        if (cacheStatus) {
            cacheStatus.textContent = `Кэш: ${stats.valid} элементов (${stats.memoryUsage})`;
        }
    }

    showCacheContents() {
        console.group('Содержимое кэша:');
        for (const [key, item] of this.cache.entries()) {
            const remaining = item.expiresAt - Date.now();
            const isExpired = remaining <= 0;
            console.log(
                `Ключ: ${key}, ` +
                `Создан: ${new Date(item.createdAt).toLocaleTimeString()}, ` +
                `Осталось: ${Math.floor(remaining / 1000)} сек, ` +
                `Размер: ${JSON.stringify(item.data).length} байт, ` +
                `Статус: ${isExpired ? 'Истек' : 'Активен'}`
            );
        }
        console.groupEnd();
    }
}

const appCache = new Cache();

const API_BASE_URL = 'https://rickandmortyapi.com/api';
let abortController = null;

async function fetchWithRetry(url, options = {}) {
    const {
        retries = 2,
        backoffMs = 1000,
        timeoutMs = 5000,
        useCache = true,
        ignoreCache = false
    } = options;

    const startTime = Date.now();
    const cacheKey = `api:${url}`;
    
    if (!ignoreCache && useCache) {
        const cachedData = appCache.get(cacheKey);
        if (cachedData) {
            const elapsed = Date.now() - startTime;
            updateRequestInfo(elapsed, 'success', 'cache');
            return cachedData;
        }
    }

    if (abortController) {
        abortController.abort();
        showRetryIndicator(false);
    }
    
    abortController = new AbortController();
    let timeoutId = null;
    
    if (timeoutMs > 0) {
        timeoutId = setTimeout(() => {
            abortController.abort();
            console.log(`Таймаут запроса через ${timeoutMs}ms: ${url}`);
        }, timeoutMs);
    }

    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            if (attempt > 0) {
                showRetryIndicator(true);
                console.log(`Попытка ${attempt + 1}/${retries + 1} для ${url}`);
                
                await new Promise(resolve => 
                    setTimeout(resolve, backoffMs * Math.pow(2, attempt - 1))
                );
            }

            const response = await fetch(url, {
                signal: abortController.signal,
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                error.status = response.status;
                throw error;
            }

            const data = await response.json();
            const elapsed = Date.now() - startTime;

            if (useCache) {
                appCache.set(cacheKey, data);
            }

            updateRequestInfo(elapsed, 'success', 'network');
            
            if (attempt > 0) {
                console.log(`Успех после ${attempt + 1} попыток`);
            }
            
            showRetryIndicator(false);
            return data;

        } catch (error) {
            lastError = error;
            
            if (error.name === 'AbortError') {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                console.log(`Запрос отменен: ${url}`);
                updateRequestInfo(Date.now() - startTime, 'aborted', 'network');
                showRetryIndicator(false);
                throw error;
            }

            console.log(`Ошибка (попытка ${attempt + 1}/${retries + 1}): ${error.message}`);
            
            if (attempt < retries) {
                showRetryIndicator(true);
            }
        }
    }

    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    showRetryIndicator(false);
    
    const elapsed = Date.now() - startTime;
    updateRequestInfo(elapsed, 'error', 'network');
    
    console.log(`Все попытки завершились ошибкой для ${url}`);
    throw lastError;
}

async function fetchCharacters(page = 1, name = '', options = {}) {
    let url = `${API_BASE_URL}/character?page=${page}`;
    if (name) {
        url += `&name=${encodeURIComponent(name)}`;
    }
    
    return await fetchWithRetry(url, options);
}

async function fetchCharacter(id, options = {}) {
    const url = `${API_BASE_URL}/character/${id}`;
    return await fetchWithRetry(url, options);
}

function updateRequestInfo(elapsed, status, source) {
    const requestTime = document.getElementById('request-time');
    const requestStatus = document.getElementById('request-status');
    const requestSource = document.getElementById('request-source');
    
    if (requestTime) {
        requestTime.textContent = `${elapsed}ms`;
        requestTime.className = elapsed < 1000 ? 'cache-hit' : 
                               elapsed < 3000 ? '' : 'cache-expired';
    }
    
    if (requestStatus) {
        requestStatus.textContent = status === 'success' ? 'Успех' :
                                   status === 'error' ? 'Ошибка' :
                                   status === 'aborted' ? 'Отменен' : 'В процессе';
        requestStatus.className = status === 'success' ? 'cache-hit' :
                                 status === 'error' ? 'cache-miss' : '';
    }
    
    if (requestSource) {
        requestSource.textContent = source === 'cache' ? 'Кэш' :
                                   source === 'network' ? 'Сеть' : '-';
        requestSource.className = source === 'cache' ? 'cache-hit' : '';
    }
}

function showRetryIndicator(show) {
    const retryIndicator = document.getElementById('retry-indicator');
    if (retryIndicator) {
        retryIndicator.classList.toggle('hidden', !show);
    }
}

function cancelCurrentRequest() {
    if (abortController) {
        abortController.abort();
        abortController = null;
        console.log('Текущий запрос отменен');
    }
}

let currentSearch = '';
let isInitialLoad = true;

let searchInput, searchBtn, clearBtn, refreshBtn;
let charactersContainer, resultsContainer, errorContainer, emptyContainer;
let prevBtn, nextBtn, pageInfo, resultsTitle;
let skeletonContainer, loadingIndicator;
let retryBtn, characterModal, closeModal;

document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setupEventListeners();
    loadInitialData();
    setupDemoButtons();
});

function initializeElements() {
    searchInput = document.getElementById('search-input');
    searchBtn = document.getElementById('search-btn');
    clearBtn = document.getElementById('clear-btn');
    refreshBtn = document.getElementById('refresh-btn');
    
    charactersContainer = document.getElementById('characters-container');
    resultsContainer = document.getElementById('results-container');
    errorContainer = document.getElementById('error-container');
    emptyContainer = document.getElementById('empty-container');
    skeletonContainer = document.getElementById('skeleton-container');
    
    prevBtn = document.getElementById('prev-btn');
    nextBtn = document.getElementById('next-btn');
    pageInfo = document.getElementById('page-info');
    resultsTitle = document.getElementById('results-title');
    
    loadingIndicator = document.getElementById('loading-indicator');
    
    retryBtn = document.getElementById('retry-btn');
    
    characterModal = document.getElementById('character-modal');
    closeModal = document.getElementById('close-modal');
}

function setupEventListeners() {
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentSearch = '';
        loadCharacters();
    });
    
    refreshBtn.addEventListener('click', () => {
        loadCharacters(true);
    });
    
    
    retryBtn.addEventListener('click', loadCharacters);
    
    closeModal.addEventListener('click', () => {
        characterModal.classList.add('hidden');
    });
    
    characterModal.addEventListener('click', (e) => {
        if (e.target === characterModal) {
            characterModal.classList.add('hidden');
        }
    });
    
    setupSearchDebounce();
}

function setupSearchDebounce() {
    let timeout;
    searchInput.addEventListener('input', () => {
        const debounceIndicator = document.createElement('div');
        debounceIndicator.textContent = 'Поиск через 0.5с...';
        debounceIndicator.style.cssText = 'position: absolute; background: yellow; padding: 5px;';
        
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            if (searchInput.value !== currentSearch) {
                performSearch();
            }
            debounceIndicator.remove();
        }, 500);
    });
}

document.getElementById('demo-timeout').addEventListener('click', () => {
    showNotification('Демонстрация таймаута: устанавливаем таймаут 2 секунды', 'info'); // Было 1 секунда
    
    const originalTimeout = document.getElementById('timeout').value;
    
    document.getElementById('timeout').value = '2'; // Это 2 секунды, а не 1
    
    loadCharacters(true).finally(() => {
        setTimeout(() => {
            document.getElementById('timeout').value = originalTimeout;
            showNotification('Таймаут восстановлен', 'success');
        }, 2000);
    });
});
    
    document.getElementById('demo-retry').addEventListener('click', async () => {
        showNotification('Демонстрация ретраев: запрос к несуществующему URL', 'info');
        
        try {
            await fetchWithRetry('https://rickandmortyapi.com/api/nonexistent', {
                retries: 3,
                backoffMs: 1000,
                timeoutMs: 3000,
                useCache: false
            });
        } catch (error) {
            showNotification(`После нескольких попыток: ${error.message}`, 'error');
        }
    });
    
    document.getElementById('demo-abort').addEventListener('click', () => {
        showNotification('Отмена текущего запроса...', 'warning');
        cancelCurrentRequest();
    });
    
    document.getElementById('demo-cache').addEventListener('click', () => {
        const stats = appCache.getStats();
        const message = `Кэш содержит: ${stats.total} элементов\n` +
                       `Активных: ${stats.valid}\n` +
                       `Истекших: ${stats.expired}\n` +
                       `Использовано памяти: ${stats.memoryUsage}`;
        
        showNotification(message, 'info');
        console.log('Статистика кэша:', stats);
        appCache.showCacheContents();
    });
    
    document.getElementById('demo-clear-cache').addEventListener('click', () => {
        const cleared = appCache.clear();
        showNotification(`Кэш очищен. Удалено ${cleared} элементов.`, 'success');
    });

async function loadInitialData() {
    showLoading(true);
    try {
        await loadCharacters();
        isInitialLoad = false;
    } catch (error) {
        showError('Не удалось загрузить первоначальные данные');
    } finally {
        showLoading(false);
    }
}

function performSearch() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm !== currentSearch) {
        currentSearch = searchTerm;
        loadCharacters();
    }
}

async function loadCharacters(ignoreCache = false) {
    cancelCurrentRequest();
    
    if (!characterModal.classList.contains('hidden')) {
        characterModal.classList.add('hidden');
    }
    
    hideAllContainers();
    
    if (!isInitialLoad) {
        skeletonContainer.classList.remove('hidden');
    }
    
    showLoading(true);
    
    try {
        const retries = parseInt(document.getElementById('retry-count').value);
        const timeout = parseInt(document.getElementById('timeout').value) * 1000;
        
        const data = await fetchCharacters(1, currentSearch, {
            retries,
            timeoutMs: timeout,
            ignoreCache,
            useCache: !ignoreCache
        });
        
        if (!data || !data.info || !data.results) {
            throw new Error('Некорректный формат данных от API');
        }
        
        const allResults = data.results || [];
        const limitedResults = allResults.slice(0, 20);
        
        updatePagination();
        
        displayCharacters(limitedResults);
        
        const totalCount = currentSearch ? Math.min(data.info.count || 0, 20) : Math.min(allResults.length, 20);
        updateResultsTitle(totalCount);
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Запрос был отменен пользователем');
            return;
        }
        
        console.error('Ошибка загрузки персонажей:', error);
        
        if (currentSearch && (error.status === 404 || error.message.includes('404') || error.message.includes('HTTP 404'))) {
            showEmpty();
        } else {
            showError(`Ошибка: ${error.message}`);
        }
    } finally {
        showLoading(false);
        skeletonContainer.classList.add('hidden');
    }
}

function displayCharacters(characters) {
    charactersContainer.innerHTML = '';
    
    if (characters.length === 0) {
        showEmpty();
        return;
    }
    
    characters.forEach(character => {
        const characterCard = createCharacterCard(character);
        charactersContainer.appendChild(characterCard);
    });
    
    resultsContainer.classList.remove('hidden');
}

function createCharacterCard(character) {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.dataset.id = character.id;
    
    card.innerHTML = `
        <img src="${character.image}" alt="${character.name}" class="character-image">
        <div class="character-info">
            <h3 class="character-name">${character.name}</h3>
            <div class="character-details">
                <span>${character.species}</span>
                <span>${character.status}</span>
                <span>${character.gender}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => openCharacterModal(character.id));
    
    return card;
}

async function openCharacterModal(characterId) {
    showLoading(true);
    
    try {
        const character = await fetchCharacter(characterId);
        
        if (!character) {
            throw new Error('Данные персонажа не получены');
        }
        
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <div class="modal-character">
                <img src="${character.image || ''}" alt="${character.name || 'Персонаж'}">
                <h2>${character.name || 'Неизвестно'}</h2>
                <div class="modal-character-details">
                    <p><strong>Статус:</strong> ${character.status || 'Неизвестно'}</p>
                    <p><strong>Вид:</strong> ${character.species || 'Неизвестно'}</p>
                    <p><strong>Пол:</strong> ${character.gender || 'Неизвестно'}</p>
                    <p><strong>Происхождение:</strong> ${character.origin?.name || 'Неизвестно'}</p>
                    <p><strong>Местоположение:</strong> ${character.location?.name || 'Неизвестно'}</p>
                    <p><strong>Появился в эпизодах:</strong> ${character.episode?.length || 0}</p>
                </div>
            </div>
        `;
        
        characterModal.classList.remove('hidden');
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Запрос деталей персонажа был отменен');
            return;
        }
        
        console.error('Ошибка загрузки деталей персонажа:', error);
        showNotification(`Не удалось загрузить детали: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function updateResultsTitle(count) {
    let title = 'Персонажи';
    if (currentSearch) {
        title = `Найдено персонажей: ${count}`;
    }
    resultsTitle.textContent = title;
}

function updatePagination() {
    document.querySelector('.pagination').classList.add('hidden');
}

function showLoading(show) {
    loadingIndicator.classList.toggle('hidden', !show);
}

function showError(message) {
    hideAllContainers();
    errorContainer.classList.remove('hidden');
    document.getElementById('error-message').textContent = message;
}

function showEmpty() {
    hideAllContainers();
    emptyContainer.classList.remove('hidden');
}

function hideAllContainers() {
    resultsContainer.classList.add('hidden');
    errorContainer.classList.add('hidden');
    emptyContainer.classList.add('hidden');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    
    const colors = {
        success: 'linear-gradient(135deg, #2ecc71, #27ae60)',
        error: 'linear-gradient(135deg, #e74c3c, #c0392b)',
        warning: 'linear-gradient(135deg, #f39c12, #d35400)',
        info: 'linear-gradient(135deg, #3498db, #2980b9)'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}
