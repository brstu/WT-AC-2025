// Конфигурация
const CONFIG = {
    API_BASE_URL: 'https://jsonplaceholder.typicode.com',
    ALBUMS_PER_PAGE: 6,
    CACHE_TTL: 5 * 60 * 1000, // 5 минут в миллисекундах
    RETRY_ATTEMPTS: 3,
    RETRY_BACKOFF_MS: 1000,
    REQUEST_TIMEOUT_MS: 10000
};

// Мок-данные для альбомов, так как JSONPlaceholder не предоставляет музыкальные данные
const MOCK_ALBUMS = [
    { id: 1, title: "Thriller", artist: "Michael Jackson", year: 1982, genre: "Pop", tracks: ["Wanna Be Startin' Somethin'", "Thriller", "Beat It", "Billie Jean", "Human Nature"] },
    { id: 2, title: "The Dark Side of the Moon", artist: "Pink Floyd", year: 1973, genre: "Progressive Rock", tracks: ["Speak to Me", "Breathe", "On the Run", "Time", "The Great Gig in the Sky"] },
    { id: 3, title: "Back in Black", artist: "AC/DC", year: 1980, genre: "Hard Rock", tracks: ["Hells Bells", "Shoot to Thrill", "Back in Black", "You Shook Me All Night Long", "Rock and Roll Ain't Noise Pollution"] },
    { id: 4, title: "Rumours", artist: "Fleetwood Mac", year: 1977, genre: "Soft Rock", tracks: ["Second Hand News", "Dreams", "Never Going Back Again", "Don't Stop", "Go Your Own Way"] },
    { id: 5, title: "Nevermind", artist: "Nirvana", year: 1991, genre: "Grunge", tracks: ["Smells Like Teen Spirit", "In Bloom", "Come as You Are", "Breed", "Lithium"] },
    { id: 6, title: "Abbey Road", artist: "The Beatles", year: 1969, genre: "Rock", tracks: ["Come Together", "Something", "Maxwell's Silver Hammer", "Oh! Darling", "Octopus's Garden"] },
    { id: 7, title: "The Joshua Tree", artist: "U2", year: 1987, genre: "Rock", tracks: ["Where the Streets Have No Name", "I Still Haven't Found What I'm Looking For", "With or Without You", "Bullet the Blue Sky", "Running to Stand Still"] },
    { id: 8, title: "Led Zeppelin IV", artist: "Led Zeppelin", year: 1971, genre: "Hard Rock", tracks: ["Black Dog", "Rock and Roll", "The Battle of Evermore", "Stairway to Heaven", "Misty Mountain Hop"] },
    { id: 9, title: "Hotel California", artist: "Eagles", year: 1976, genre: "Rock", tracks: ["Hotel California", "New Kid in Town", "Life in the Fast Lane", "Wasted Time", "Victim of Love"] },
    { id: 10, title: "Bad", artist: "Michael Jackson", year: 1987, genre: "Pop", tracks: ["Bad", "The Way You Make Me Feel", "Speed Demon", "Liberian Girl", "Just Good Friends"] },
    { id: 11, title: "The Wall", artist: "Pink Floyd", year: 1979, genre: "Progressive Rock", tracks: ["In the Flesh?", "The Thin Ice", "Another Brick in the Wall, Part 1", "The Happiest Days of Our Lives", "Another Brick in the Wall, Part 2"] },
    { id: 12, title: "Born to Run", artist: "Bruce Springsteen", year: 1975, genre: "Rock", tracks: ["Thunder Road", "Tenth Avenue Freeze-Out", "Night", "Backstreets", "Born to Run"] },
    { id: 13, title: "Appetite for Destruction", artist: "Guns N' Roses", year: 1987, genre: "Hard Rock", tracks: ["Welcome to the Jungle", "It's So Easy", "Nightrain", "Out ta Get Me", "Mr. Brownstone"] },
    { id: 14, title: "Purple Rain", artist: "Prince", year: 1984, genre: "Pop Rock", tracks: ["Let's Go Crazy", "Take Me With U", "The Beautiful Ones", "Computer Blue", "Darling Nikki"] },
    { id: 15, title: "Revolver", artist: "The Beatles", year: 1966, genre: "Rock", tracks: ["Taxman", "Eleanor Rigby", "I'm Only Sleeping", "Love You To", "Here, There and Everywhere"] },
    { id: 16, title: "A Night at the Opera", artist: "Queen", year: 1975, genre: "Rock", tracks: ["Death on Two Legs", "Lazing on a Sunday Afternoon", "I'm in Love with My Car", "You're My Best Friend", "'39"] },
    { id: 17, title: "The Rise and Fall of Ziggy Stardust", artist: "David Bowie", year: 1972, genre: "Glam Rock", tracks: ["Five Years", "Soul Love", "Moonage Daydream", "Starman", "It Ain't Easy"] },
    { id: 18, title: "London Calling", artist: "The Clash", year: 1979, genre: "Punk Rock", tracks: ["London Calling", "Brand New Cadillac", "Jimmy Jazz", "Hateful", "Rudie Can't Fail"] },
    { id: 19, title: "Kind of Blue", artist: "Miles Davis", year: 1959, genre: "Jazz", tracks: ["So What", "Freddie Freeloader", "Blue in Green", "All Blues", "Flamenco Sketches"] },
    { id: 20, title: "The Chronic", artist: "Dr. Dre", year: 1992, genre: "Hip Hop", tracks: ["The Chronic (Intro)", "Fuck wit Dre Day", "Let Me Ride", "The Day the Niggaz Took Over", "Nuthin' but a 'G' Thang"] }
];

// Глобальные переменные состояния
let currentPage = 1;
let totalPages = 1;
let allAlbums = [];
let filteredAlbums = [];
let currentSearchQuery = '';
let currentSort = 'title_asc';
let abortController = null;
let cacheEnabled = true;

// Кэш в памяти
const memoryCache = new Map();

// DOM элементы
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const refreshBtn = document.getElementById('refresh-btn');
const cacheToggle = document.getElementById('cache-toggle');
const sortSelect = document.getElementById('sort-select');
const resultsCount = document.getElementById('results-count');
const cacheStatus = document.getElementById('cache-status');
const cacheText = document.querySelector('.cache-text');
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');
const emptyMessage = document.getElementById('empty-message');
const albumsGrid = document.getElementById('albums-grid');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const currentPageSpan = document.getElementById('current-page');
const totalPagesSpan = document.getElementById('total-pages');
const retryBtn = document.getElementById('retry-btn');
const errorText = document.getElementById('error-text');

// Инициализация приложения
function init() {
    // Загрузка начальных данных
    loadAlbums();
    
    // Настройка обработчиков событий
    setupEventListeners();
    
    // Установка начальных значений
    updateCacheStatus();
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Поиск с задержкой
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        currentSearchQuery = e.target.value.trim().toLowerCase();
        
        // Показать/скрыть кнопку очистки
        if (currentSearchQuery) {
            clearSearchBtn.style.display = 'flex';
        } else {
            clearSearchBtn.style.display = 'none';
        }
        
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            filterAndSortAlbums();
            updatePagination();
            renderAlbums();
        }, 300);
    });
    
    // Очистка поиска
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentSearchQuery = '';
        clearSearchBtn.style.display = 'none';
        currentPage = 1;
        filterAndSortAlbums();
        updatePagination();
        renderAlbums();
    });
    
    // Обновление данных (игнорирует кэш)
    refreshBtn.addEventListener('click', () => {
        // Показать индикатор повторной загрузки
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обновление...';
        refreshBtn.disabled = true;
        
        loadAlbums(true).finally(() => {
            // Вернуть исходный текст кнопки
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Обновить';
            refreshBtn.disabled = false;
        });
    });
    
    // Переключение кэша
    cacheToggle.addEventListener('change', (e) => {
        cacheEnabled = e.target.checked;
        updateCacheStatus();
        
        // Если кэш отключен, очищаем его и перезагружаем данные
        if (!cacheEnabled) {
            memoryCache.clear();
            localStorage.removeItem('musicAlbumsCache');
            loadAlbums();
        }
    });
    
    // Сортировка
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        filterAndSortAlbums();
        updatePagination();
        renderAlbums();
    });
    
    // Пагинация
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
            renderAlbums();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
            renderAlbums();
        }
    });
    
    // Повтор при ошибке
    retryBtn.addEventListener('click', () => {
        loadAlbums();
    });
}

// Функция для выполнения запросов с повторными попытками и таймаутом
async function fetchWithRetry(url, options = {}) {
    const { retries = CONFIG.RETRY_ATTEMPTS, backoffMs = CONFIG.RETRY_BACKOFF_MS, timeoutMs = CONFIG.REQUEST_TIMEOUT_MS } = options;
    
    // Создаем AbortController для возможности отмены запроса
    if (abortController) {
        abortController.abort();
    }
    abortController = new AbortController();
    
    const timeoutId = setTimeout(() => {
        abortController.abort();
    }, timeoutMs);
    
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            console.log(`Попытка запроса ${attempt + 1} из ${retries + 1} к ${url}`);
            
            const response = await fetch(url, {
                signal: abortController.signal,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ошибка: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Запрос был прерван');
                throw error;
            }
            
            console.log(`Ошибка в попытке ${attempt + 1}:`, error.message);
            
            // Если это последняя попытка, выбрасываем ошибку
            if (attempt === retries) {
                clearTimeout(timeoutId);
                throw error;
            }
            
            // Экспоненциальная задержка перед следующей попыткой
            const delay = backoffMs * Math.pow(2, attempt);
            console.log(`Повтор через ${delay}мс...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Кэширование с TTL
class CacheManager {
    constructor() {
        this.memoryCache = new Map();
    }
    
    // Генерация ключа кэша
    generateKey(url) {
        return `cache_${url}`;
    }
    
    // Получение данных из кэша
    get(key) {
        if (!cacheEnabled) return null;
        
        // Проверяем кэш в памяти
        if (this.memoryCache.has(key)) {
            const cached = this.memoryCache.get(key);
            if (Date.now() < cached.expiry) {
                console.log('Данные получены из кэша памяти');
                return cached.data;
            } else {
                // Удаляем просроченные данные
                this.memoryCache.delete(key);
            }
        }
        
        // Проверяем localStorage
        try {
            const cachedStr = localStorage.getItem(key);
            if (cachedStr) {
                const cached = JSON.parse(cachedStr);
                if (Date.now() < cached.expiry) {
                    console.log('Данные получены из localStorage кэша');
                    // Сохраняем также в memory cache для быстрого доступа
                    this.memoryCache.set(key, cached);
                    return cached.data;
                } else {
                    // Удаляем просроченные данные
                    localStorage.removeItem(key);
                }
            }
        } catch (error) {
            console.error('Ошибка при чтении из localStorage:', error);
        }
        
        return null;
    }
    
    // Сохранение данных в кэш
    set(key, data, ttl = CONFIG.CACHE_TTL) {
        if (!cacheEnabled) return;
        
        const cacheItem = {
            data,
            expiry: Date.now() + ttl
        };
        
        // Сохраняем в memory cache
        this.memoryCache.set(key, cacheItem);
        
        // Сохраняем в localStorage
        try {
            localStorage.setItem(key, JSON.stringify(cacheItem));
            console.log('Данные сохранены в кэш');
        } catch (error) {
            console.error('Ошибка при сохранении в localStorage:', error);
        }
    }
    
    // Очистка кэша
    clear() {
        this.memoryCache.clear();
        
        // Удаляем только наши ключи из localStorage
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('cache_')) {
                    localStorage.removeItem(key);
                }
            }
        } catch (error) {
            console.error('Ошибка при очистке localStorage:', error);
        }
        
        console.log('Кэш очищен');
    }
    
    // Получение статуса кэша
    getStatus() {
        let memoryCacheSize = 0;
        let localStorageSize = 0;
        
        // Подсчитываем размер memory cache
        memoryCacheSize = this.memoryCache.size;
        
        // Подсчитываем количество наших ключей в localStorage
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('cache_')) {
                    localStorageSize++;
                }
            }
        } catch (error) {
            console.error('Ошибка при подсчете элементов в localStorage:', error);
        }
        
        return {
            memoryCacheSize,
            localStorageSize,
            enabled: cacheEnabled
        };
    }
}

// Создаем экземпляр менеджера кэша
const cacheManager = new CacheManager();

// Загрузка альбомов из API
async function loadAlbums(ignoreCache = false) {
    // Показать индикатор загрузки
    showLoading();
    
    try {
        // Используем мок-данные, так как JSONPlaceholder не предоставляет музыкальные альбомы
        // В реальном приложении здесь был бы запрос к API
        console.log('Загрузка альбомов...');
        
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Генерируем дополнительные данные для треков
        const enhancedAlbums = MOCK_ALBUMS.map(album => {
            // Добавляем случайную продолжительность треков
            const tracksWithDuration = album.tracks.map((track, index) => ({
                name: track,
                duration: `${Math.floor(Math.random() * 4) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
            }));
            
            return {
                ...album,
                tracks: tracksWithDuration
            };
        });
        
        allAlbums = enhancedAlbums;
        
        // Сохраняем в кэш
        const cacheKey = cacheManager.generateKey('albums');
        if (!ignoreCache) {
            cacheManager.set(cacheKey, allAlbums);
        }
        
        // Обрабатываем и отображаем данные
        filterAndSortAlbums();
        updatePagination();
        renderAlbums();
        
        // Показываем успешную загрузку
        showContent();
        updateCacheStatus();
        
    } catch (error) {
        console.error('Ошибка загрузки альбомов:', error);
        
        // Пробуем загрузить из кэша, если есть
        if (cacheEnabled && !ignoreCache) {
            const cacheKey = cacheManager.generateKey('albums');
            const cachedData = cacheManager.get(cacheKey);
            
            if (cachedData) {
                console.log('Используем данные из кэша из-за ошибки сети');
                allAlbums = cachedData;
                filterAndSortAlbums();
                updatePagination();
                renderAlbums();
                showContent();
                
                // Показываем предупреждение, что данные из кэша
                showNotification('Используются данные из кэша (ошибка сети)', 'warning');
                return;
            }
        }
        
        // Показываем ошибку
        showError('Не удалось загрузить альбомы. Проверьте подключение к интернету.');
    }
}

// Фильтрация и сортировка альбомов
function filterAndSortAlbums() {
    // Фильтрация по поисковому запросу
    if (currentSearchQuery) {
        filteredAlbums = allAlbums.filter(album => 
            album.title.toLowerCase().includes(currentSearchQuery) ||
            album.artist.toLowerCase().includes(currentSearchQuery) ||
            album.genre.toLowerCase().includes(currentSearchQuery)
        );
    } else {
        filteredAlbums = [...allAlbums];
    }
    
    // Сортировка
    filteredAlbums.sort((a, b) => {
        switch (currentSort) {
            case 'title_asc':
                return a.title.localeCompare(b.title);
            case 'title_desc':
                return b.title.localeCompare(a.title);
            case 'artist_asc':
                return a.artist.localeCompare(b.artist);
            case 'artist_desc':
                return b.artist.localeCompare(a.artist);
            case 'year_asc':
                return a.year - b.year;
            case 'year_desc':
                return b.year - a.year;
            default:
                return 0;
        }
    });
    
    // Обновляем счетчик результатов
    updateResultsCount();
}

// Обновление счетчика результатов
function updateResultsCount() {
    const total = filteredAlbums.length;
    const from = total === 0 ? 0 : (currentPage - 1) * CONFIG.ALBUMS_PER_PAGE + 1;
    const to = Math.min(currentPage * CONFIG.ALBUMS_PER_PAGE, total);
    
    let text = `Найдено: ${total} альбомов`;
    if (total > 0) {
        text += ` (показаны ${from}-${to})`;
    }
    
    resultsCount.textContent = text;
}

// Обновление пагинации
function updatePagination() {
    const totalAlbums = filteredAlbums.length;
    totalPages = Math.ceil(totalAlbums / CONFIG.ALBUMS_PER_PAGE) || 1;
    
    // Корректируем текущую страницу, если она выходит за пределы
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    
    // Обновляем элементы пагинации
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;
    
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
    
    // Скрываем пагинацию, если всего одна страница
    document.querySelector('.pagination-container').style.display = 
        totalPages <= 1 ? 'none' : 'flex';
}

// Отображение альбомов на текущей странице
function renderAlbums() {
    // Если нет альбомов после фильтрации
    if (filteredAlbums.length === 0) {
        albumsGrid.innerHTML = '';
        
        // Показываем сообщение об отсутствии результатов
        if (allAlbums.length === 0) {
            // Данные еще не загружены
            return;
        } else if (currentSearchQuery) {
            // Есть поисковый запрос, но нет результатов
            showEmpty();
        } else {
            // Нет поискового запроса, но альбомов нет
            showEmpty();
        }
        return;
    }
    
    // Вычисляем альбомы для текущей страницы
    const startIndex = (currentPage - 1) * CONFIG.ALBUMS_PER_PAGE;
    const endIndex = startIndex + CONFIG.ALBUMS_PER_PAGE;
    const albumsToShow = filteredAlbums.slice(startIndex, endIndex);
    
    // Генерируем HTML для альбомов
    let albumsHTML = '';
    
    albumsToShow.forEach(album => {
        // Генерируем цвет для обложки на основе ID альбома
        const hue = (album.id * 137) % 360; // Простой алгоритм для получения различных цветов
        
        albumsHTML += `
            <div class="album-card">
                <div class="album-cover" style="background-color: hsl(${hue}, 70%, 50%)">
                    <i class="fas fa-compact-disc"></i>
                </div>
                <div class="album-info">
                    <h3 class="album-title">${album.title}</h3>
                    <p class="album-artist"><i class="fas fa-user"></i> ${album.artist}</p>
                    <p class="album-year"><i class="fas fa-calendar"></i> ${album.year} год</p>
                    <p class="album-genre"><i class="fas fa-guitar"></i> ${album.genre}</p>
                    
                    <div class="album-tracks">
                        <p><strong>Треки:</strong></p>
                        <ul class="track-list">
                            ${album.tracks.map((track, index) => `
                                <li>
                                    <span class="track-number">${index + 1}.</span>
                                    <span class="track-name">${track.name}</span>
                                    <span class="track-duration">${track.duration}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    });
    
    albumsGrid.innerHTML = albumsHTML;
    showContent();
}

// Обновление статуса кэша
function updateCacheStatus() {
    const cacheStatusData = cacheManager.getStatus();
    
    if (cacheEnabled) {
        cacheText.textContent = `Кэш: ${cacheStatusData.memoryCacheSize} в памяти, ${cacheStatusData.localStorageSize} в хранилище`;
        cacheStatus.style.color = 'var(--success-color)';
    } else {
        cacheText.textContent = 'Кэш: отключен';
        cacheStatus.style.color = 'var(--text-light)';
    }
}

// Управление отображением состояния UI
function showLoading() {
    loadingIndicator.style.display = 'flex';
    errorMessage.style.display = 'none';
    emptyMessage.style.display = 'none';
    albumsGrid.style.display = 'none';
    document.querySelector('.pagination-container').style.display = 'none';
}

function showError(message) {
    loadingIndicator.style.display = 'none';
    errorMessage.style.display = 'flex';
    emptyMessage.style.display = 'none';
    albumsGrid.style.display = 'none';
    document.querySelector('.pagination-container').style.display = 'none';
    
    document.getElementById('errorText').textContent = message;
}

function showEmpty() {
    loadingIndicator.style.display = 'none';
    errorMessage.style.display = 'none';
    emptyMessage.style.display = 'flex';
    albumsGrid.style.display = 'none';
    document.querySelector('.pagination-container').style.display = 'none';
}

function showContent() {
    loadingIndicator.style.display = 'none';
    errorMessage.style.display = 'none';
    emptyMessage.style.display = 'none';
    albumsGrid.style.display = 'grid';
    
    // Пагинация показывается или скрывается в updatePagination
    updateResultsCount();
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Добавляем стили
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'warning' ? 'var(--warning-color)' : 'var(--primary-color)'};
        color: white;
        padding: 15px 20px;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // Добавляем в документ
    document.body.appendChild(notification);
    
    // Обработчик закрытия
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
    
    // Автоматическое закрытие через 5 секунд
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Добавляем стили для анимаций уведомлений
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
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;
document.head.appendChild(style);

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', init);