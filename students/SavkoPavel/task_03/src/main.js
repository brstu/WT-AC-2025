// Конфигурация приложения
const config = {
    apiUrl: 'https://newsapi.org/v2/everything',
    apiKey: '77859276b5634562aa113edbfc012844',
    pageSize: 10,
    retries: 3,
    backoffMs: 1000,
    timeoutMs: 10000,
    cacheTTL: 5 * 60 * 1000 // 5 минут в миллисекундах
};

// Переменные состояния
let currentPage = 1;
let currentQuery = '';
let totalResults = 0;
let currentAbortController = null;

// Кэш в памяти
const newsCache = new Map();

// Элементы DOM
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const refreshButton = document.getElementById('refreshButton');
const statusContainer = document.getElementById('statusContainer');
const newsGrid = document.getElementById('newsGrid');
const pagination = document.getElementById('pagination');
const cacheInfo = document.getElementById('cacheInfo');

// Инициализация приложения
function init() {
    searchButton.addEventListener('click', handleSearch);
    refreshButton.addEventListener('click', handleRefresh);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Загружаем начальные данные
    loadInitialData();
}

// Загрузка начальных данных
async function loadInitialData() {
    showLoading('Загрузка новостей...');
    try {
        const data = await fetchWithRetry(
            `${config.apiUrl}?q=technology&pageSize=${config.pageSize}&page=1&apiKey=${config.apiKey}`,
            {
                retries: config.retries,
                backoffMs: config.backoffMs,
                timeoutMs: config.timeoutMs
            }
        );
        
        if (data.articles && data.articles.length > 0) {
            displayNews(data.articles);
            updatePagination(data.totalResults);
            updateCacheInfo('Данные загружены с сервера');
        } else {
            showEmpty('Новости не найдены. Попробуйте другой запрос.');
        }
    } catch (error) {
        showError(`Ошибка загрузки: ${error.message}`);
    }
}

// Обработчик поиска
function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        showError('Введите ключевое слово для поиска');
        return;
    }

    currentQuery = query;
    currentPage = 1;
    fetchNews(query, 1, true);
}

// Обработчик обновления
function handleRefresh() {
    if (!currentQuery) {
        showError('Сначала выполните поиск');
        return;
    }

    // Принудительно обновляем данные, игнорируя кэш
    fetchNews(currentQuery, currentPage, false);
}

// Загрузка новостей с учетом кэша
async function fetchNews(query, page, useCache = true) {
    // Отменяем предыдущий запрос, если он выполняется
    if (currentAbortController) {
        currentAbortController.abort();
    }

    // Создаем новый контроллер для отмены
    currentAbortController = new AbortController();

    // Проверяем кэш, если разрешено
    const cacheKey = `${query}-${page}`;
    if (useCache && newsCache.has(cacheKey)) {
        const cachedData = newsCache.get(cacheKey);
        if (Date.now() - cachedData.timestamp < config.cacheTTL) {
            displayNews(cachedData.articles);
            updatePagination(cachedData.totalResults);
            updateCacheInfo('Данные загружены из кэша');
            return;
        } else {
            // Удаляем устаревшие данные из кэша
            newsCache.delete(cacheKey);
        }
    }

    showLoading(`Поиск новостей по запросу: "${query}"...`);

    try {
        const data = await fetchWithRetry(
            `${config.apiUrl}?q=${encodeURIComponent(query)}&pageSize=${config.pageSize}&page=${page}&apiKey=${config.apiKey}`,
            {
                retries: config.retries,
                backoffMs: config.backoffMs,
                timeoutMs: config.timeoutMs,
                signal: currentAbortController.signal
            }
        );

        if (data.articles && data.articles.length > 0) {
            // Сохраняем в кэш
            newsCache.set(cacheKey, {
                articles: data.articles,
                totalResults: data.totalResults,
                timestamp: Date.now()
            });

            displayNews(data.articles);
            updatePagination(data.totalResults);
            updateCacheInfo('Данные загружены с сервера');
        } else {
            showEmpty(`По запросу "${query}" новостей не найдено.`);
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            showError(`Ошибка загрузки: ${error.message}`);
        }
    }
}

// Функция для выполнения запросов с повторными попытками и таймаутом
async function fetchWithRetry(url, options = {}) {
    const { retries = 3, backoffMs = 1000, timeoutMs = 10000, signal } = options;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // Создаем таймаут для запроса
            const timeoutController = new AbortController();
            const timeoutId = setTimeout(() => {
                timeoutController.abort();
            }, timeoutMs);

            // Объединяем сигналы
            const combinedSignal = signal ? 
                (() => {
                    const controller = new AbortController();
                    signal.addEventListener('abort', () => controller.abort());
                    timeoutController.signal.addEventListener('abort', () => controller.abort());
                    return controller.signal;
                })() : 
                timeoutController.signal;

            const response = await fetch(url, { signal: combinedSignal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw error; // Не повторяем при отмене
            }

            if (attempt === retries) {
                throw error; // Все попытки исчерпаны
            }

            // Ждем перед следующей попыткой (экспоненциальная задержка)
            const delay = backoffMs * Math.pow(2, attempt);
            console.warn(`Попытка ${attempt + 1} не удалась. Повтор через ${delay}мс:`, error.message);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Отображение новостей
function displayNews(articles) {
    clearStatus();
    
    if (!articles || articles.length === 0) {
        showEmpty('Новости не найдены');
        return;
    }

    newsGrid.innerHTML = '';
    
    articles.forEach(article => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card';
        
        const imageUrl = article.urlToImage || 'https://via.placeholder.com/300x180?text=No+Image';
        
        newsCard.innerHTML = `
            <img src="${imageUrl}" alt="${article.title}" class="news-image" onerror="this.src='https://via.placeholder.com/300x180?text=Image+Not+Found'">
            <div class="news-content">
                <h3 class="news-title">${article.title || 'Без названия'}</h3>
                <p class="news-description">${article.description || 'Описание отсутствует'}</p>
                <div class="news-meta">
                    <span>${article.source?.name || 'Неизвестный источник'}</span>
                    <span>${formatDate(article.publishedAt)}</span>
                </div>
            </div>
        `;
        
        newsGrid.appendChild(newsCard);
    });
}

// Отображение скелетонов загрузки
function displaySkeletons(count) {
    newsGrid.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const skeletonCard = document.createElement('div');
        skeletonCard.className = 'news-card';
        
        skeletonCard.innerHTML = `
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-description"></div>
            <div class="skeleton skeleton-description"></div>
            <div class="skeleton skeleton-meta"></div>
        `;
        
        newsGrid.appendChild(skeletonCard);
    }
}

// Обновление пагинации
function updatePagination(total) {
    totalResults = total;
    const totalPages = Math.ceil(total / config.pageSize);
    
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Кнопка "Назад"
    const prevButton = document.createElement('button');
    prevButton.className = 'page-button';
    prevButton.textContent = '←';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchNews(currentQuery, currentPage);
        }
    });
    pagination.appendChild(prevButton);
    
    // Номера страниц
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `page-button ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            fetchNews(currentQuery, currentPage);
        });
        pagination.appendChild(pageButton);
    }
    
    // Кнопка "Вперед"
    const nextButton = document.createElement('button');
    nextButton.className = 'page-button';
    nextButton.textContent = '→';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchNews(currentQuery, currentPage);
        }
    });
    pagination.appendChild(nextButton);
}

// Показ состояния загрузки
function showLoading(message = 'Загрузка...') {
    clearStatus();
    displaySkeletons(config.pageSize);
    
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = `
        <div class="spinner"></div>
        <span>${message}</span>
    `;
    statusContainer.appendChild(loadingDiv);
}

// Показ ошибки
function showError(message) {
    clearStatus();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    statusContainer.appendChild(errorDiv);
}

// Показ пустого состояния
function showEmpty(message) {
    clearStatus();
    
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty';
    emptyDiv.textContent = message;
    statusContainer.appendChild(emptyDiv);
    
    newsGrid.innerHTML = '';
    pagination.innerHTML = '';
}

// Очистка статуса
function clearStatus() {
    statusContainer.innerHTML = '';
}

// Обновление информации о кэше
function updateCacheInfo(message) {
    cacheInfo.textContent = `Информация: ${message} | Размер кэша: ${newsCache.size} записей`;
}

// Форматирование даты
function formatDate(dateString) {
    if (!dateString) return 'Дата неизвестна';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);