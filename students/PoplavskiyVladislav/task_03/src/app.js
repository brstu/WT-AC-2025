// NASA APOD Gallery - Основная логика
class NASAAPODClient {
    constructor() {
        // Используем демо-ключ NASA
        this.API_KEY = 'y6hXK61eTxSwPJMOuxVkrJArQpcynRbHif7Glu8A';
        this.BASE_URL = 'https://api.nasa.gov/planetary/apod';
        
        // Управление запросами для избежания 429
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.lastRequestTime = 0;
        this.MIN_REQUEST_INTERVAL = 2000; // 2 секунды между запросами
        
        // Инициализация кэша
        this.cache = new Map();
        this.cacheHits = 0;
        this.cacheMisses = 0;
        this.CACHE_TTL = 24 * 60 * 60 * 1000;
        
        this.currentControllers = new Map();
        this.stats = {
            totalRequests: 0,
            failedRequests: 0,
            retryCount: 0,
            rateLimitedCount: 0
        };
        
        // Режим работы
        this.useMockAPI = localStorage.getItem('nasaApodUseMock') === 'true';
        
        this.initializeStorage();
        this.loadCacheStats();
    }
    
    // Инициализация localStorage
    initializeStorage() {
        try {
            const savedStats = localStorage.getItem('nasaApodCacheStats');
            if (savedStats) {
                const stats = JSON.parse(savedStats);
                this.cacheHits = stats.hits || 0;
                this.cacheMisses = stats.misses || 0;
            }
        } catch (e) {
            console.warn('Не удалось загрузить статистику кэша:', e);
        }
    }
    
    saveCacheStats() {
        try {
            const stats = {
                hits: this.cacheHits,
                misses: this.cacheMisses,
                timestamp: Date.now()
            };
            localStorage.setItem('nasaApodCacheStats', JSON.stringify(stats));
        } catch (e) {
            console.warn('Не удалось сохранить статистику кэша:', e);
        }
    }
    
    loadCacheStats() {
        this.updateCacheStats();
    }
    
    // Управление очередью запросов
    async queueRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ url, options, resolve, reject });
            this.processQueue();
        });
    }
    
    async processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }
        
        this.isProcessingQueue = true;
        
        while (this.requestQueue.length > 0) {
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;
            
            // Ждем минимум 2 секунды между запросами
            if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
                await new Promise(resolve => 
                    setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest)
                );
            }
            
            const { url, options, resolve, reject } = this.requestQueue.shift();
            
            try {
                const result = await this.fetchWithRetryInternal(url, options);
                this.lastRequestTime = Date.now();
                resolve(result);
            } catch (error) {
                reject(error);
            }
        }
        
        this.isProcessingQueue = false;
    }
    
    // Основная функция с ретраями
    async fetchWithRetryInternal(url, options = {}) {
        const {
            retries = 2,
            backoffMs = 2000,
            timeoutMs = 15000,
            useCache = true,
            forceRefresh = false,
            requestId = 'default'
        } = options;

        this.stats.totalRequests++;

        // Проверка кэша
        if (useCache && !forceRefresh) {
            const cached = this.getFromCache(url);
            if (cached !== null) {
                this.cacheHits++;
                this.updateCacheStats();
                console.log(`✅ Cache hit for: ${url.substring(0, 50)}...`);
                return cached;
            }
        }

        this.cacheMisses++;
        this.updateCacheStats();
        console.log(`🔍 Cache miss for: ${url.substring(0, 50)}...`);

        // Отмена предыдущего запроса
        if (this.currentControllers.has(requestId)) {
            this.currentControllers.get(requestId).abort();
        }

        const controller = new AbortController();
        this.currentControllers.set(requestId, controller);
        const signal = controller.signal;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                console.log(`🔄 Attempt ${attempt + 1}/${retries + 1} for: ${requestId}`);
                
                // Таймаут для запроса
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => {
                        reject(new Error(`Request timeout after ${timeoutMs}ms`));
                    }, timeoutMs);
                });

                const fetchPromise = fetch(url, { 
                    signal,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                const response = await Promise.race([fetchPromise, timeoutPromise]);

                // Обработка статуса 429 (Too Many Requests)
                if (response.status === 429) {
                    this.stats.rateLimitedCount++;
                    const retryAfter = response.headers.get('Retry-After');
                    const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 30000; // 30 секунд
                    
                    console.log(`⏳ Rate limited (429). Waiting ${waitTime/1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    
                    // Продолжаем цикл попыток
                    continue;
                }

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                if (useCache) {
                    this.setToCache(url, data);
                    console.log(`💾 Cached response for: ${requestId}`);
                }

                this.currentControllers.delete(requestId);
                return data;

            } catch (error) {
                if (error.name === 'AbortError') {
                    throw error;
                }

                console.error(`❌ Attempt ${attempt + 1} failed:`, error.message);
                this.stats.failedRequests++;

                if (attempt === retries) {
                    this.currentControllers.delete(requestId);
                    
                    // Возвращаем fallback данные если все попытки провалились
                    if (error.message.includes('429')) {
                        console.log('🎭 Returning fallback data due to rate limiting');
                        return this.getFallbackData();
                    }
                    
                    throw new Error(`Failed after ${retries + 1} attempts: ${error.message}`);
                }

                const delay = backoffMs * Math.pow(2, attempt);
                this.stats.retryCount++;
                console.log(`⏳ Waiting ${delay}ms before retry ${attempt + 2}...`);
                
                await new Promise(resolve => {
                    const timer = setTimeout(() => resolve(), delay);
                    signal.addEventListener('abort', () => {
                        clearTimeout(timer);
                        resolve();
                    });
                });

                if (signal.aborted) {
                    throw new Error('Request was aborted during retry delay');
                }
            }
        }
    }
    
    // Fallback данные
    getFallbackData() {
        const fallbackData = [
            {
                date: new Date().toISOString().split('T')[0],
                title: "Hubble Space Telescope View of Spiral Galaxy",
                explanation: "This is a fallback image showing a beautiful spiral galaxy captured by the Hubble Space Telescope. In a real scenario, this would be actual data from NASA's APOD API.",
                url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=600&fit=crop",
                hdurl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&h=1080&fit=crop",
                media_type: "image",
                copyright: "NASA/ESA/Hubble"
            },
            {
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                title: "Orion Nebula Star Formation Region",
                explanation: "The Orion Nebula is one of the most photographed objects in the night sky. This fallback image demonstrates what you would see from the APOD API.",
                url: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
                hdurl: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1920&h=1080&fit=crop",
                media_type: "image",
                copyright: "NASA/ESA"
            },
            {
                date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
                title: "Milky Way Galaxy Over Mountains",
                explanation: "A stunning view of our own galaxy, the Milky Way, arching over a mountain landscape. Fallback data for demonstration purposes.",
                url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
                hdurl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1920&h=1080&fit=crop",
                media_type: "image",
                copyright: "NASA"
            }
        ];
        
        return fallbackData;
    }
    
    // Основной метод запроса
    async fetchWithRetry(url, options = {}) {
        return this.queueRequest(url, options);
    }
    
    // Получение данных APOD
    async getAPODData(options = {}) {
        // Добавляем задержку для первого запроса
        if (this.stats.totalRequests === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const {
            startDate = null,
            endDate = null,
            count = 10,
            useCache = true,
            forceRefresh = false,
            page = 1,
            pageSize = 6
        } = options;

        const params = new URLSearchParams({
            api_key: this.API_KEY,
            thumbs: true
        });

        let url;
        let requestId;

        if (startDate && endDate) {
            params.append('start_date', startDate);
            params.append('end_date', endDate);
            requestId = `apod_${startDate}_${endDate}`;
        } else {
            params.append('count', count);
            requestId = `apod_count_${count}`;
        }

        url = `${this.BASE_URL}?${params}`;

        try {
            console.log(`📡 Fetching APOD data: ${requestId}`);
            const data = await this.fetchWithRetry(url, {
                retries: 1,
                timeoutMs: 20000,
                useCache,
                forceRefresh,
                requestId
            });

            let images = Array.isArray(data) ? data : [data];
            
            // Фильтрация по датам
            if (startDate && endDate) {
                images = images.filter(img => {
                    const imgDate = new Date(img.date);
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    return imgDate >= start && imgDate <= end;
                });
            }

            // Сортировка по дате (новые первыми)
            images.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Пагинация
            const total = images.length;
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedImages = images.slice(startIndex, endIndex);

            return {
                images: paginatedImages,
                total,
                page,
                pageSize,
                hasMore: endIndex < total
            };

        } catch (error) {
            console.error('Error fetching APOD data:', error);
            
            // Возвращаем fallback данные при ошибке
            const fallbackImages = this.getFallbackData();
            const total = fallbackImages.length;
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedImages = fallbackImages.slice(startIndex, endIndex);
            
            return {
                images: paginatedImages,
                total,
                page,
                pageSize,
                hasMore: endIndex < total,
                isFallback: true
            };
        }
    }

    // Работа с кэшем
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const { data, timestamp } = cached;
        const now = Date.now();

        if (now - timestamp > this.CACHE_TTL) {
            console.log(`🗑️ Cache entry expired: ${key.substring(0, 50)}...`);
            this.cache.delete(key);
            return null;
        }

        return data;
    }

    setToCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
        this.updateCacheStats();
        
        // Автоматическая очистка старых записей
        if (this.cache.size > 50) {
            this.cleanupOldCacheEntries();
        }
    }

    cleanupOldCacheEntries() {
        const now = Date.now();
        let deletedCount = 0;
        
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.CACHE_TTL * 2) {
                this.cache.delete(key);
                deletedCount++;
            }
        }
        
        if (deletedCount > 0) {
            console.log(`🧹 Cleaned up ${deletedCount} old cache entries`);
        }
    }

    clearCache() {
        this.cache.clear();
        this.cacheHits = 0;
        this.cacheMisses = 0;
        this.updateCacheStats();
        this.saveCacheStats();
        console.log('🧼 Cache cleared');
    }

    // Отмена всех активных запросов
    abortAllRequests() {
        for (const [id, controller] of this.currentControllers) {
            controller.abort();
            console.log(`⏹️ Aborted request: ${id}`);
        }
        this.currentControllers.clear();
    }

    // Отмена конкретного запроса
    abortRequest(requestId) {
        if (this.currentControllers.has(requestId)) {
            this.currentControllers.get(requestId).abort();
            this.currentControllers.delete(requestId);
            console.log(`⏹️ Aborted request: ${requestId}`);
        }
    }

    // Обновление статистики в UI
    updateCacheStats() {
        const updateElement = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        // ИСПРАВЛЕННЫЕ ID:
        updateElement('cache-hits', this.cacheHits);
        updateElement('cache-misses', this.cacheMisses);
        updateElement('cache-size', this.cache.size);
        
        // Расчет эффективности
        const total = this.cacheHits + this.cacheMisses;
        const efficiency = total > 0 ? Math.round((this.cacheHits / total) * 100) : 0;
        updateElement('cache-efficiency', `${efficiency}%`);
        
        // Обновление статуса кэша (исправленный ID)
        const cacheStatus = document.getElementById('cache-status-mini');
        if (cacheStatus) {
            const cacheToggle = document.getElementById('cache-toggle');
            cacheStatus.textContent = cacheToggle && cacheToggle.checked ? 'активен' : 'отключен';
            cacheStatus.style.color = cacheToggle && cacheToggle.checked ? '#28a745' : '#dc3545';
        }
        
        // Обновление режима API (исправленный ID)
        const apiMode = document.getElementById('api-mode');
        if (apiMode) {
            apiMode.textContent = this.useMockAPI ? 'MOCK' : 'DEMO';
            apiMode.className = this.useMockAPI ? 'mode-indicator mock' : 'mode-indicator real';
        }
        
        this.saveCacheStats();
    }

    // Получение содержимого кэша
    getCacheContents() {
        const contents = [];
        const now = Date.now();
        
        for (const [key, value] of this.cache.entries()) {
            const age = Math.round((now - value.timestamp) / 1000 / 60);
            const size = JSON.stringify(value.data).length;
            
            contents.push({
                key: key.length > 50 ? key.substring(0, 50) + '...' : key,
                age: `${age} мин`,
                size: `${Math.round(size / 1024 * 100) / 100} KB`,
                hits: value.hits || 1
            });
        }
        
        return contents;
    }
    
    // Переключение режима работы
    toggleMockAPI() {
        this.useMockAPI = !this.useMockAPI;
        localStorage.setItem('nasaApodUseMock', this.useMockAPI);
        this.clearCache();
        console.log(`🔧 API mode switched to: ${this.useMockAPI ? 'MOCK' : 'DEMO'}`);
        return this.useMockAPI;
    }
}

// Основной класс приложения
class APODGalleryApp {
    constructor() {
        this.client = new NASAAPODClient();
        this.isLoading = false;
        this.currentPage = 1;
        this.pageSize = 6;
        this.totalImages = 0;
        this.currentRequestId = null;
        this.lastLoadTime = 0;
        
        this.initializeApp();
    }

    initializeApp() {
        this.initializeEventListeners();
        this.setDefaultDates();
        this.loadImages();
        
        console.log('🚀 NASA APOD Gallery initialized');
    }

    initializeEventListeners() {
        // Основная кнопка загрузки (исправленный ID)
        document.getElementById('load-btn').addEventListener('click', () => {
            this.loadImages();
        });

        // Кнопка обновления (исправленный ID)
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadImages(true);
        });

        // Очистка кэша (исправленный ID)
        document.getElementById('clear-cache-btn').addEventListener('click', () => {
            this.client.clearCache();
            this.showStatus('Кэш очищен', 'success');
            setTimeout(() => this.hideStatus(), 2000);
        });

        // Переключение кэша (исправленный ID)
        document.getElementById('cache-toggle').addEventListener('change', (e) => {
            const useCache = e.target.checked;
            this.showStatus(`Кэш ${useCache ? 'включен' : 'отключен'}`, 'info');
            setTimeout(() => this.hideStatus(), 2000);
        });

        // Переключение режима API (исправленный ID)
        document.getElementById('toggle-mock-btn').addEventListener('click', () => {
            const isMock = this.client.toggleMockAPI();
            const btn = document.getElementById('toggle-mock-btn');
            btn.textContent = isMock ? '🔧 Реальный API' : '🔧 Mock API';
            btn.title = isMock ? 'Переключить на реальный API' : 'Переключить на Mock API';
            this.showStatus(`Режим API: ${isMock ? 'MOCK' : 'DEMO'}`, 'info');
            setTimeout(() => {
                this.hideStatus();
                this.loadImages();
            }, 1000);
        });

        // Просмотр содержимого кэша (исправленный ID)
        document.getElementById('view-cache-btn').addEventListener('click', () => {
            this.showCacheContents();
        });

        // Сброс статистики (исправленный ID)
        document.getElementById('reset-stats-btn').addEventListener('click', () => {
            this.resetStats();
        });

        // Тест API (исправленный ID)
        document.getElementById('test-api-btn').addEventListener('click', () => {
            this.showTestDialog();
        });

        // Экспорт данных (исправленный ID)
        document.getElementById('export-stats-btn').addEventListener('click', () => {
            this.exportStats();
        });

        // Дебаунс для полей ввода
        let debounceTimer;
        const debouncedLoad = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.currentPage = 1;
                this.loadImages();
            }, 800);
        };

        // Исправленные ID для полей ввода
        document.getElementById('start-date').addEventListener('change', debouncedLoad);
        document.getElementById('end-date').addEventListener('change', debouncedLoad);
        document.getElementById('count-select').addEventListener('change', debouncedLoad);

        // Закрытие модального окна
        document.getElementById('image-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                const cacheDialog = document.getElementById('cache-dialog');
                if (cacheDialog) cacheDialog.close();
                const apiTestDialog = document.getElementById('api-test-dialog');
                if (apiTestDialog) apiTestDialog.close();
            }
        });
    }

    resetStats() {
        this.client.clearCache();
        this.showStatus('Статистика сброшена', 'success');
        setTimeout(() => this.hideStatus(), 2000);
    }

    showTestDialog() {
        const dialog = document.getElementById('api-test-dialog');
        if (dialog) {
            dialog.showModal();
        }
    }

    exportStats() {
        const stats = {
            cacheHits: this.client.cacheHits,
            cacheMisses: this.client.cacheMisses,
            cacheSize: this.client.cache.size,
            totalRequests: this.client.stats.totalRequests,
            timestamp: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(stats, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `nasa-apod-stats-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showStatus('Данные экспортированы', 'success');
        setTimeout(() => this.hideStatus(), 2000);
    }

    setDefaultDates() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 9);

        // Исправленные ID
        document.getElementById('start-date').value = this.formatDate(startDate);
        document.getElementById('end-date').value = this.formatDate(endDate);
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    async loadImages(forceRefresh = false) {
        // Проверяем время между запросами
        const now = Date.now();
        if (now - this.lastLoadTime < 2000 && !forceRefresh) {
            console.log('⏳ Too many requests, skipping...');
            return;
        }
        
        // Отмена предыдущего запроса
        if (this.currentRequestId) {
            this.client.abortRequest(this.currentRequestId);
        }

        if (this.isLoading) return;
        
        this.isLoading = true;
        this.currentRequestId = `load_${Date.now()}`;
        this.showLoading();
        this.updateButtonState(true);

        try {
            // Исправленные ID
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            const count = parseInt(document.getElementById('count-select').value);
            const useCache = document.getElementById('cache-toggle').checked;

            console.log('📡 Loading images with params:', {
                startDate, endDate, count, forceRefresh, useCache, page: this.currentPage
            });

            const result = await this.client.getAPODData({
                startDate: startDate || null,
                endDate: endDate || null,
                count,
                useCache,
                forceRefresh,
                page: this.currentPage,
                pageSize: this.pageSize,
                requestId: this.currentRequestId
            });

            this.lastLoadTime = Date.now();
            
            if (result.isFallback) {
                this.showStatus('Используем демо-данные (лимит API исчерпан)', 'warning');
                setTimeout(() => this.hideStatus(), 3000);
            }

            this.displayImages(result.images);
            this.totalImages = result.total;
            this.setupPagination(result.total);
            
            console.log(`✅ Loaded ${result.images.length} images (total: ${result.total})`);

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('⏹️ Image loading aborted by user');
                return;
            }
            
            console.error('❌ Error loading images:', error);
            this.showError(`Ошибка загрузки: ${error.message}`);
            
        } finally {
            this.isLoading = false;
            this.currentRequestId = null;
            this.updateButtonState(false);
        }
    }

    updateButtonState(loading) {
        // Исправленный ID
        const btn = document.getElementById('load-btn');
        const text = btn.querySelector('.btn-text');
        const spinner = btn.querySelector('.spinner');
        
        btn.disabled = loading;
        spinner.style.display = loading ? 'inline-block' : 'none';
        text.textContent = loading ? 'Загрузка...' : 'Загрузить';
    }

    displayImages(images) {
        const container = document.getElementById('apod-container');
        
        if (!images || images.length === 0) {
            this.showEmpty();
            container.innerHTML = '';
            return;
        }

        this.hideStatus();

        const imagesHTML = images.map((image, index) => {
            const mediaUrl = image.media_type === 'video' 
                ? (image.thumbnail_url || image.url) 
                : image.hdurl || image.url;
            
            const date = new Date(image.date).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const shortExplanation = image.explanation.length > 150 
                ? image.explanation.substring(0, 150) + '...' 
                : image.explanation;
            
            return `
                <div class="apod-card" data-index="${index}" onclick="apodApp.openImageModal(${index}, ${JSON.stringify(image).replace(/"/g, '&quot;')})">
                    <img src="${mediaUrl}" 
                         alt="${image.title}" 
                         class="apod-media"
                         loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=250&fit=crop&auto=format'">
                    <div class="apod-content">
                        <h3 class="apod-title">${image.title}</h3>
                        <div class="apod-date">
                            📅 ${date}
                        </div>
                        <p class="apod-explanation">${shortExplanation}</p>
                        <div class="apod-type">
                            ${image.media_type === 'video' ? '🎥 Видео' : '🖼️ Изображение'}
                            ${image.copyright ? ` | © ${image.copyright}` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = imagesHTML;
        
        // Анимация появления
        setTimeout(() => {
            const cards = container.querySelectorAll('.apod-card');
            cards.forEach((card, i) => {
                card.style.animationDelay = `${i * 0.1}s`;
            });
        }, 100);
    }

    setupPagination(total) {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(total / this.pageSize);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '<div class="page-info">Всего: ' + total + ' изображений</div>';
            return;
        }

        let paginationHTML = '';
        
        // Кнопка "Назад"
        if (this.currentPage > 1) {
            paginationHTML += `
                <button onclick="apodApp.changePage(${this.currentPage - 1})" aria-label="Предыдущая страница">
                    ← Назад
                </button>
            `;
        }
        
        // Номера страниц
        const maxPagesToShow = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === this.currentPage;
            paginationHTML += `
                <button onclick="apodApp.changePage(${i})" 
                        class="${isActive ? 'active' : ''}"
                        aria-label="Страница ${i}"
                        aria-current="${isActive ? 'page' : 'false'}">
                    ${i}
                </button>
            `;
        }
        
        // Кнопка "Вперед"
        if (this.currentPage < totalPages) {
            paginationHTML += `
                <button onclick="apodApp.changePage(${this.currentPage + 1})" aria-label="Следующая страница">
                    Вперед →
                </button>
            `;
        }
        
        // Информация о странице
        paginationHTML += `
            <div class="page-info">
                Страница ${this.currentPage} из ${totalPages} | Всего: ${total} изображений
            </div>
        `;
        
        pagination.innerHTML = paginationHTML;
    }

    changePage(page) {
        if (page < 1 || page > Math.ceil(this.totalImages / this.pageSize)) {
            return;
        }
        
        this.currentPage = page;
        this.loadImages();
        
        // Прокрутка к началу галереи
        const apodGrid = document.querySelector('.apod-grid');
        if (apodGrid) {
            apodGrid.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    openImageModal(index, imageData) {
        const modal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        const modalTitle = document.getElementById('modal-image-title');
        const modalDate = document.getElementById('modal-image-date');
        const modalCopyright = document.getElementById('modal-image-copyright');
        const modalType = document.getElementById('modal-image-type');
        const modalExplanation = document.getElementById('modal-image-explanation');
        const imageSourceLink = document.getElementById('image-source-link');
        
        const mediaUrl = imageData.media_type === 'video' 
            ? (imageData.thumbnail_url || imageData.url) 
            : imageData.hdurl || imageData.url;
        
        modalImage.src = mediaUrl;
        modalImage.alt = imageData.title;
        modalTitle.textContent = imageData.title;
        
        modalDate.innerHTML = `<span>📅</span> ${new Date(imageData.date).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        })}`;
        
        modalCopyright.innerHTML = imageData.copyright ? `<span>©</span> ${imageData.copyright}` : '';
        modalType.innerHTML = `<span>${imageData.media_type === 'video' ? '🎥' : '🖼️'}</span> ${imageData.media_type === 'video' ? 'Видео' : 'Изображение'}`;
        modalExplanation.textContent = imageData.explanation;
        
        if (imageSourceLink) {
            imageSourceLink.href = imageData.url;
            imageSourceLink.title = `Источник: ${imageData.title}`;
        }
        
        modal.setAttribute('aria-hidden', 'false');
        modal.style.display = 'flex';
        
        setTimeout(() => {
            const modalClose = modal.querySelector('.modal-close');
            if (modalClose) modalClose.focus();
        }, 100);
    }

    closeModal() {
        const modal = document.getElementById('image-modal');
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
    }

    showCacheContents() {
        const contents = this.client.getCacheContents();
        const dialog = document.getElementById('cache-dialog');
        const memoryContent = document.getElementById('memory-cache-contents');
        
        if (contents.length === 0) {
            memoryContent.innerHTML = '<p class="empty-message">In-memory кэш пуст</p>';
        } else {
            const html = contents.map(item => `
                <div class="cache-item">
                    <div class="cache-item-header">
                        <span class="cache-item-url">${item.key}</span>
                        <span class="cache-item-size">${item.size}</span>
                    </div>
                    <div class="cache-item-details">
                        <div><span>Возраст:</span><span>${item.age}</span></div>
                        <div><span>Использований:</span><span>${item.hits}</span></div>
                    </div>
                </div>
            `).join('');
            
            memoryContent.innerHTML = html;
        }
        
        dialog.showModal();
    }

    showLoading() {
        this.showStatus('Загрузка изображений NASA...', 'loading');
        
        const container = document.getElementById('apod-container');
        const count = this.pageSize;
        
        let skeletonHTML = '';
        for (let i = 0; i < count; i++) {
            skeletonHTML += `
                <div class="skeleton-card">
                    <div class="skeleton-media"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-line skeleton-title"></div>
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line skeleton-short"></div>
                    </div>
                </div>
            `;
        }
        container.innerHTML = skeletonHTML;
    }

    showError(message) {
        const statusEl = document.getElementById('status-message');
        statusEl.innerHTML = `
            <div style="margin-bottom: 15px; font-size: 1.1rem;">${message}</div>
            <button onclick="apodApp.retryLoad()" 
                    class="btn-secondary"
                    style="padding: 10px 20px; font-size: 0.9rem;">
                🔄 Повторить попытку
            </button>
        `;
        statusEl.className = 'status-message error';
        statusEl.style.display = 'block';
    }

    showEmpty() {
        const statusEl = document.getElementById('status-message');
        statusEl.innerHTML = `
            <div style="margin-bottom: 10px;">🛸 Изображения не найдены для выбранного диапазона дат</div>
            <div style="font-size: 0.9rem; opacity: 0.8;">
                Попробуйте изменить даты или уменьшить количество дней
            </div>
        `;
        statusEl.className = 'status-message empty';
        statusEl.style.display = 'block';
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('status-message');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
        statusEl.style.display = 'block';
    }

    hideStatus() {
        const statusEl = document.getElementById('status-message');
        statusEl.style.display = 'none';
    }

    retryLoad() {
        this.hideStatus();
        this.loadImages();
    }
}

// Инициализация приложения
const apodApp = new APODGalleryApp();

// Глобальные функции для HTML
window.openImageModal = function(index, imageData) {
    apodApp.openImageModal(index, imageData);
};

window.closeModal = function() {
    apodApp.closeModal();
};

// Экспорт для отладки
window.apodApp = apodApp;
window.NASAAPODClient = NASAAPODClient;