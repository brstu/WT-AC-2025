class EventsClient {
    constructor() {
        // Конфигурация
        this.baseUrl = 'https://jsonplaceholder.typicode.com';
        this.eventsEndpoint = '/posts'; // Используем posts как события
        
        // Состояние приложения
        this.events = [];
        this.filteredEvents = [];
        this.currentPage = 1;
        this.eventsPerPage = 6;
        this.isLoading = false;
        
        // Кэш
        this.cache = new Map();
        this.cacheTTL = 5 * 60 * 1000; // 5 минут в миллисекундах
        
        // Статистика
        this.stats = {
            cachedRequests: 0,
            retryCount: 0,
            abortedCount: 0,
            totalRequests: 0
        };
        
        // AbortController для отмены запросов
        this.currentAbortController = null;
        
        // Элементы DOM
        this.initializeDOM();
        
        // Настройки запросов
        this.requestSettings = {
            timeout: 5000,
            maxRetries: 2,
            backoffMs: 1000,
            useCache: true
        };
        
        // Инициализация
        this.attachEventListeners();
        this.loadEvents();
        this.updateUI();
    }
    
    initializeDOM() {
        // Получаем элементы DOM
        this.eventsContainer = document.getElementById('eventsContainer');
        this.searchInput = document.getElementById('searchInput');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.dateFilter = document.getElementById('dateFilter');
        this.priceFilter = document.getElementById('priceFilter');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.clearCacheBtn = document.getElementById('clearCacheBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.pageInfo = document.getElementById('pageInfo');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorIndicator = document.getElementById('errorIndicator');
        this.emptyIndicator = document.getElementById('emptyIndicator');
        this.errorMessage = document.getElementById('errorMessage');
        this.retryBtn = document.getElementById('retryBtn');
        this.cacheStatus = document.getElementById('cacheStatus');
        this.requestStatus = document.getElementById('requestStatus');
        this.cachedRequests = document.getElementById('cachedRequests');
        this.retryCount = document.getElementById('retryCount');
        this.abortedCount = document.getElementById('abortedCount');
        this.searchStatus = document.getElementById('searchStatus');
        this.timeoutSlider = document.getElementById('timeoutSlider');
        this.timeoutValue = document.getElementById('timeoutValue');
        this.retrySlider = document.getElementById('retrySlider');
        this.retryValue = document.getElementById('retryValue');
        this.useCacheCheckbox = document.getElementById('useCacheCheckbox');
    }
    
    attachEventListeners() {
        // Поиск и фильтры
        this.searchInput.addEventListener('input', this.debounce(() => this.handleSearch(), 500));
        this.categoryFilter.addEventListener('change', () => this.handleFilter());
        this.dateFilter.addEventListener('change', () => this.handleFilter());
        this.priceFilter.addEventListener('change', () => this.handleFilter());
        
        // Кнопки действий
        this.refreshBtn.addEventListener('click', () => this.refreshEvents());
        this.clearCacheBtn.addEventListener('click', () => this.clearCache());
        this.retryBtn.addEventListener('click', () => this.loadEvents());
        
        // Пагинация
        this.prevBtn.addEventListener('click', () => this.prevPage());
        this.nextBtn.addEventListener('click', () => this.nextPage());
        
        // Настройки запросов
        this.timeoutSlider.addEventListener('input', (e) => {
            this.requestSettings.timeout = parseInt(e.target.value);
            this.timeoutValue.textContent = this.requestSettings.timeout;
        });
        
        this.retrySlider.addEventListener('input', (e) => {
            this.requestSettings.maxRetries = parseInt(e.target.value);
            this.retryValue.textContent = this.requestSettings.maxRetries;
        });
        
        this.useCacheCheckbox.addEventListener('change', (e) => {
            this.requestSettings.useCache = e.target.checked;
        });
    }
    
    // Дебаунс для поиска
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Основная функция загрузки событий
    async loadEvents() {
        // Отмена предыдущего запроса
        if (this.currentAbortController) {
            this.currentAbortController.abort();
            this.stats.abortedCount++;
            this.updateStats();
        }
        
        // Создаем новый AbortController
        this.currentAbortController = new AbortController();
        
        // Показываем индикатор загрузки
        this.setLoading(true);
        this.setError(null);
        
        try {
            // Пытаемся загрузить события
            const events = await this.fetchWithRetry(
                `${this.baseUrl}${this.eventsEndpoint}?_limit=20&_page=1`,
                {
                    retries: this.requestSettings.maxRetries,
                    backoffMs: this.requestSettings.backoffMs,
                    timeoutMs: this.requestSettings.timeout,
                    signal: this.currentAbortController.signal,
                    useCache: this.requestSettings.useCache
                }
            );
            
            // Преобразуем данные из API в формат мероприятий
            this.events = this.transformEventsData(events);
            this.filteredEvents = [...this.events];
            
            // Обновляем UI
            this.currentPage = 1;
            this.renderEvents();
            this.updatePagination();
            this.setLoading(false);
            
            // Обновляем статус
            this.requestStatus.textContent = 'Успешно';
            this.requestStatus.className = 'info-value success';
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Запрос был отменен');
                return;
            }
            
            console.error('Ошибка загрузки событий:', error);
            this.setError(error.message || 'Не удалось загрузить мероприятия');
            this.setLoading(false);
            
            this.requestStatus.textContent = 'Ошибка';
            this.requestStatus.className = 'info-value error';
        }
    }
    
    // Функция с ретраями, таймаутом и кэшированием
    async fetchWithRetry(url, options = {}) {
        const {
            retries = 2,
            backoffMs = 1000,
            timeoutMs = 5000,
            signal = null,
            useCache = true
        } = options;
        
        // Проверка кэша
        const cacheKey = url;
        if (useCache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTTL) {
                console.log('Использован кэш для:', url);
                this.stats.cachedRequests++;
                this.updateStats();
                this.updateCacheStatus();
                return cached.data;
            } else {
                // Удаляем просроченный кэш
                this.cache.delete(cacheKey);
            }
        }
        

        let lastError;
        
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {

                this.requestStatus.textContent = attempt === 0 ? 'Загрузка...' : `Повтор ${attempt}/${retries}`;
                this.requestStatus.className = 'info-value loading';
                

                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error(`Таймаут запроса (${timeoutMs}мс)`)), timeoutMs);
                });
                

                const fetchPromise = fetch(url, { signal });

                const response = await Promise.race([fetchPromise, timeoutPromise]);
                
                if (!response.ok) {
                    throw new Error(`HTTP ошибка: ${response.status}`);
                }
                
                const data = await response.json();

                if (useCache) {
                    this.cache.set(cacheKey, {
                        data,
                        timestamp: Date.now()
                    });
                    this.updateCacheStatus();
                }

                this.stats.totalRequests++;
                this.updateStats();
                
                console.log(`Запрос успешен: ${url} (попытка ${attempt + 1})`);
                
                return data;
                
            } catch (error) {
                lastError = error;

                if (attempt < retries && error.name !== 'AbortError') {
                    this.stats.retryCount++;
                    this.updateStats();
                    
                    console.log(`Повторная попытка ${attempt + 1}/${retries} для ${url}`);
                    await this.sleep(backoffMs * Math.pow(2, attempt)); 
                }
            }
        }

        throw lastError;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    transformEventsData(posts) {
        const categories = ['music', 'theater', 'exhibition', 'sport', 'lecture', 'festival'];
        const dates = ['Сегодня', 'Завтра', '10 июля', '11 июля', '12 июля', '13 июля', '14 июля', '15 июля'];
        const prices = ['free', 'paid'];
        
        return posts.slice(0, 18).map((post, index) => ({
            id: post.id,
            title: post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title,
            description: post.body.length > 120 ? post.body.substring(0, 120) + '...' : post.body,
            category: categories[index % categories.length],
            date: dates[index % dates.length],
            price: prices[index % prices.length],
            priceValue: index % 2 === 0 ? 'Бесплатно' : `${(index * 50) + 100} руб.`,
            imageUrl: `https://picsum.photos/seed/event${index + 1}/400/300`
        }));
    }

    handleSearch() {
        const searchTerm = this.searchInput.value.trim().toLowerCase();
        
        if (searchTerm) {
            this.searchStatus.textContent = `Поиск: "${searchTerm}"`;
        } else {
            this.searchStatus.textContent = 'Введите запрос для поиска';
        }
        
        this.handleFilter();
    }

    handleFilter() {
        const searchTerm = this.searchInput.value.trim().toLowerCase();
        const category = this.categoryFilter.value;
        const date = this.dateFilter.value;
        const price = this.priceFilter.value;
        
        this.filteredEvents = this.events.filter(event => {

            const matchesSearch = !searchTerm || 
                event.title.toLowerCase().includes(searchTerm) || 
                event.description.toLowerCase().includes(searchTerm);

            const matchesCategory = !category || event.category === category;

            const matchesDate = !date || (
                (date === 'today' && event.date === 'Сегодня') ||
                (date === 'tomorrow' && event.date === 'Завтра') ||
                (date === 'weekend' && (event.date === '10 июля' || event.date === '11 июля')) ||
                (date === 'nextWeek' && !['Сегодня', 'Завтра'].includes(event.date))
            );

            const matchesPrice = !price || 
                (price === 'free' && event.price === 'free') ||
                (price === 'paid' && event.price === 'paid');
            
            return matchesSearch && matchesCategory && matchesDate && matchesPrice;
        });
        
        this.currentPage = 1;
        this.renderEvents();
        this.updatePagination();
    }

    async refreshEvents() {
        console.log('Принудительное обновление (игнорирование кэша)...');

        this.refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обновление...';

        const originalUseCache = this.requestSettings.useCache;
        this.requestSettings.useCache = false;
        
        await this.loadEvents();

        this.requestSettings.useCache = originalUseCache;
        this.useCacheCheckbox.checked = originalUseCache;

        setTimeout(() => {
            this.refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Обновить';
            this.refreshBtn.disabled = false;
        }, 500);
    }

    clearCache() {
        this.cache.clear();
        this.stats.cachedRequests = 0;
        this.updateStats();
        this.updateCacheStatus();

        this.clearCacheBtn.innerHTML = '<i class="fas fa-check"></i> Кэш очищен!';
        setTimeout(() => {
            this.clearCacheBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Очистить кэш';
        }, 1500);
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredEvents.length / this.eventsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderEvents();
            this.updatePagination();
        }
    }
    
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderEvents();
            this.updatePagination();
        }
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredEvents.length / this.eventsPerPage);
        
        this.pageInfo.textContent = `Страница ${this.currentPage} из ${totalPages}`;
        this.prevBtn.disabled = this.currentPage === 1;
        this.nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
    }

    renderEvents() {

        const skeletonContainer = this.eventsContainer.querySelector('.skeleton-container');
        if (skeletonContainer) {
            skeletonContainer.style.display = 'none';
        }

        if (this.filteredEvents.length === 0) {
            this.emptyIndicator.classList.remove('hidden');
            this.eventsContainer.innerHTML = '';
            return;
        } else {
            this.emptyIndicator.classList.add('hidden');
        }

        const startIndex = (this.currentPage - 1) * this.eventsPerPage;
        const endIndex = startIndex + this.eventsPerPage;
        const eventsToShow = this.filteredEvents.slice(startIndex, endIndex);

        let eventsHTML = '';
        
        eventsToShow.forEach(event => {
            const categoryNames = {
                'music': 'Музыка',
                'theater': 'Театр',
                'exhibition': 'Выставка',
                'sport': 'Спорт',
                'lecture': 'Лекция',
                'festival': 'Фестиваль'
            };
            
            const categoryName = categoryNames[event.category] || event.category;
            
            eventsHTML += `
                <div class="event-card">
                    <div class="event-image" style="background-image: url('${event.imageUrl}')">
                        <span class="event-category">${categoryName}</span>
                    </div>
                    <div class="event-content">
                        <h3 class="event-title">${event.title}</h3>
                        <p class="event-description">${event.description}</p>
                        <div class="event-details">
                            <div class="event-date">
                                <i class="far fa-calendar-alt"></i>
                                <span>${event.date}</span>
                            </div>
                            <div class="event-price ${event.price}">
                                <i class="fas fa-tag"></i>
                                <span>${event.priceValue}</span>
                            </div>
                        </div>
                        <div class="event-actions">
                            <a href="#" class="event-link" data-id="${event.id}">
                                <i class="fas fa-info-circle"></i>
                                Подробнее
                            </a>
                            <span class="event-id">ID: ${event.id}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        this.eventsContainer.innerHTML = eventsHTML;

        document.querySelectorAll('.event-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const eventId = e.target.closest('.event-link').dataset.id;
                this.showEventDetails(eventId);
            });
        });
    }

    showEventDetails(eventId) {
        const event = this.events.find(e => e.id == eventId);
        if (event) {
            alert(`Детали мероприятия:\n\nНазвание: ${event.title}\nДата: ${event.date}\nЦена: ${event.priceValue}\n\n${event.description}`);
        }
    }

    setLoading(isLoading) {
        this.isLoading = isLoading;
        
        if (isLoading) {
            this.loadingIndicator.classList.remove('hidden');
            this.errorIndicator.classList.add('hidden');
            this.eventsContainer.querySelector('.skeleton-container').style.display = 'grid';
            
            this.requestStatus.textContent = 'Загрузка...';
            this.requestStatus.className = 'info-value loading';
        } else {
            this.loadingIndicator.classList.add('hidden');
            
            if (this.filteredEvents.length === 0 && !this.errorIndicator.classList.contains('hidden')) {
                this.emptyIndicator.classList.remove('hidden');
            }
        }
    }
    
    setError(message) {
        if (message) {
            this.errorMessage.textContent = message;
            this.errorIndicator.classList.remove('hidden');
            this.emptyIndicator.classList.add('hidden');
        } else {
            this.errorIndicator.classList.add('hidden');
        }
    }

    updateStats() {
        this.cachedRequests.textContent = `${this.stats.cachedRequests} запросов`;
        this.retryCount.textContent = this.stats.retryCount;
        this.abortedCount.textContent = this.stats.abortedCount;
    }

    updateCacheStatus() {
        const cacheSize = this.cache.size;
        this.cacheStatus.textContent = cacheSize > 0 
            ? `В кэше: ${cacheSize} запросов` 
            : 'Кэш пуст';
    }

    updateUI() {
        this.updateStats();
        this.updateCacheStatus();
        this.updatePagination();
  
        this.timeoutValue.textContent = this.requestSettings.timeout;
        this.retryValue.textContent = this.requestSettings.maxRetries;
        this.useCacheCheckbox.checked = this.requestSettings.useCache;

        if (this.isLoading) {
            this.eventsContainer.innerHTML = `
                <div class="skeleton-container">
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                </div>
            `;
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const eventsClient = new EventsClient();

    console.log('Демонстрация клиента для афиши мероприятий');
    console.log('Откройте вкладку Network в DevTools для наблюдения за запросами');
    console.log('Обратите внимание на:');
    console.log('1. Задержки при ретраях (можно настроить внизу страницы)');
    console.log('2. Кэширование запросов (отметьте "Использовать кэш")');
    console.log('3. Отмену запросов при новом поиске');
});