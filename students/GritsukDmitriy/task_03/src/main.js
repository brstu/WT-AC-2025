// Конфигурация
const API_KEY = 'cc0773c7a09b4df9b6630af39353ab66';
const BASE_URL = 'https://api.rawg.io/api/games';

const CACHE_TTL = 30 * 1000; // 30 секунд
const RETRY_COUNT = 3;
const RETRY_DELAY = 1000;
const TIMEOUT = 5000;

// Состояние приложения
let state = {
    currentPage: 1,
    searchQuery: '',
    selectedGenre: '',
    totalPages: 1,
    abortController: null
};

// Кэш в памяти
const cache = new Map();

// Элементы DOM
const gamesContainer = document.getElementById('gamesContainer');
const searchInput = document.getElementById('searchInput');
const genreSelect = document.getElementById('genreSelect');
const searchBtn = document.getElementById('searchBtn');
const refreshBtn = document.getElementById('refreshBtn');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const loadingIndicator = document.getElementById('loadingIndicator');
const retryIndicator = document.getElementById('retryIndicator');
const errorIndicator = document.getElementById('errorIndicator');
const cacheIndicator = document.getElementById('cacheIndicator');

// 1. Функция fetchWithRetry с таймаутом и ретраями
async function fetchWithRetry(url, options = {}) {
    const { retries = RETRY_COUNT, backoffMs = RETRY_DELAY, timeoutMs = TIMEOUT } = options;

    // Создаём AbortController для таймаута и отмены
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // Отменяем предыдущий запрос, если есть
            if (state.abortController) {
                state.abortController.abort();
            }

            state.abortController = new AbortController();
            const combinedSignal = AbortSignal.any([
                state.abortController.signal,
                timeoutController.signal
            ]);

            showRetryIndicator(attempt);

            const response = await fetch(url, {
                signal: combinedSignal,
                headers: {
                    'Accept': 'application/json'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            hideRetryIndicator();
            return await response.json();

        } catch (error) {
            if (attempt === retries) {
                hideRetryIndicator();
                console.error(`Fetch failed after ${retries} attempts:`, error);
                throw error;
            }

            // Экспоненциальная задержка
            await new Promise(resolve => setTimeout(resolve, backoffMs * attempt));
        }
    }
}

// 2. Функция загрузки данных с кэшированием
async function fetchGames(forceRefresh = false) {
    const cacheKey = `${state.searchQuery}-${state.selectedGenre}-${state.currentPage}`;
    const cached = cache.get(cacheKey);

    // Проверяем кэш, если не принудительное обновление
    if (!forceRefresh && cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        showCacheIndicator();
        renderGames(cached.data.results);
        updatePagination(cached.data.count);
        return;
    }

    hideCacheIndicator();
    showLoadingIndicator();

    try {
        // Формируем параметры запроса
        const params = new URLSearchParams({
            key: API_KEY,
            page: state.currentPage,
            page_size: 12,
            ordering: '-rating' // Сортировка по рейтингу (высокий сначала)
        });

        // Добавляем поиск, если есть
        if (state.searchQuery.trim()) {
            params.append('search', state.searchQuery.trim());
        }

        // Добавляем фильтр по жанру, если выбран
        if (state.selectedGenre) {
            // Для RAWG API нужен slug жанра, но мы будем использовать поиск
            params.append('genres', state.selectedGenre);
        }

        const url = `${BASE_URL}?${params.toString()}`;
        console.log('Fetching games from:', url);

        const data = await fetchWithRetry(url);

        // Проверяем, что данные пришли
        if (!data || !data.results) {
            throw new Error('Некорректный ответ от API');
        }

        // Сохраняем в кэш
        cache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });

        renderGames(data.results);
        updatePagination(data.count);

    } catch (error) {
        console.error('Error fetching games:', error);
        showErrorIndicator(error.message);
        renderEmptyState();
    } finally {
        hideLoadingIndicator();
    }
}

// 3. Рендер списка игр
function renderGames(games) {
    if (!games || games.length === 0) {
        gamesContainer.innerHTML = `
            <div class="empty-state">
                <h3>Игры не найдены</h3>
                <p>Попробуйте изменить запрос или фильтр</p>
            </div>
        `;
        return;
    }

    const gamesHTML = games.map(game => `
        <div class="game-card">
            <h3>${game.name || 'Без названия'}</h3>
            <div class="genre">${game.genres && game.genres.length > 0 ? game.genres[0].name : 'Жанр неизвестен'}</div>
            <img src="${game.background_image || 'https://via.placeholder.com/400x225/2d3748/ffffff?text=No+Image'}" 
                 alt="${game.name}" 
                 style="width:100%; height:225px; object-fit:cover; border-radius:10px; margin-bottom:15px;">
            <p class="description">${game.description_raw ? game.description_raw.slice(0, 150) + '...' : (game.description ? game.description.slice(0, 150) + '...' : 'Описание отсутствует')}</p>
            <div style="display: flex; justify-content: space-between; margin-top: 15px;">
                <div>
                    <p><strong>⭐ ${game.rating || 'N/A'}/5</strong></p>
                    <p style="font-size: 0.9rem; color: #aaa;">${game.released || 'Дата неизвестна'}</p>
                </div>
                <div>
                    <p style="font-size: 0.9rem; color: #aaa;">Платформы: ${game.platforms ? game.platforms.length : 0}</p>
                </div>
            </div>
        </div>
    `).join('');

    gamesContainer.innerHTML = gamesHTML;
}

// 4. Рендер пустого состояния
function renderEmptyState() {
    gamesContainer.innerHTML = `
        <div class="empty-state">
            <h3>Произошла ошибка при загрузке</h3>
            <p>Попробуйте обновить страницу или проверить соединение</p>
            <button onclick="fetchGames()" style="margin-top: 20px; padding: 10px 20px;">Повторить попытку</button>
        </div>
    `;
}

// 5. Обновление пагинации
function updatePagination(totalItems) {
    const itemsPerPage = 12;
    state.totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    prevPageBtn.disabled = state.currentPage <= 1;
    nextPageBtn.disabled = state.currentPage >= state.totalPages;
    pageInfo.textContent = `Страница ${state.currentPage} из ${state.totalPages}`;
}

// 6. Показать/скрыть индикаторы
function showLoadingIndicator() {
    loadingIndicator.classList.remove('hidden');
}

function hideLoadingIndicator() {
    loadingIndicator.classList.add('hidden');
}

function showRetryIndicator(attempt) {
    retryIndicator.textContent = `🔁 Повторная попытка (${attempt}/${RETRY_COUNT})...`;
    retryIndicator.classList.remove('hidden');
}

function hideRetryIndicator() {
    retryIndicator.classList.add('hidden');
}

function showErrorIndicator(message) {
    errorIndicator.textContent = `❌ Ошибка: ${message}`;
    errorIndicator.classList.remove('hidden');
    setTimeout(() => errorIndicator.classList.add('hidden'), 5000);
}

function showCacheIndicator() {
    cacheIndicator.textContent = `💾 Данные из кэша (TTL: ${CACHE_TTL/1000} сек)`;
    cacheIndicator.classList.remove('hidden');
    setTimeout(() => cacheIndicator.classList.add('hidden'), 3000);
}

function hideCacheIndicator() {
    cacheIndicator.classList.add('hidden');
}

// 7. Обработчики событий
searchBtn.addEventListener('click', () => {
    state.searchQuery = searchInput.value.trim();
    state.selectedGenre = genreSelect.value;
    state.currentPage = 1;
    fetchGames();
});

refreshBtn.addEventListener('click', () => {
    fetchGames(true); // Принудительное обновление, игнор кэша
});

prevPageBtn.addEventListener('click', () => {
    if (state.currentPage > 1) {
        state.currentPage--;
        fetchGames();
    }
});

nextPageBtn.addEventListener('click', () => {
    if (state.currentPage < state.totalPages) {
        state.currentPage++;
        fetchGames();
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Дебаунс для поиска
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        state.searchQuery = e.target.value.trim();
        state.currentPage = 1;
        fetchGames();
    }, 500);
});

// Инициализация - загружаем игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    fetchGames();
});