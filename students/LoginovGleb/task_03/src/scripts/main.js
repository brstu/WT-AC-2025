/**
 * Главный файл приложения - управление UI и логикой
 */

import { getWeatherByCity, getCacheInfo, clearCache } from './weatherApi.js';
import { getCitiesPaginated, clearETagCache } from './mockApi.js';
import { debounce, formatDateTime, kelvinToCelsius } from './utils.js';

// Состояние приложения
const state = {
    currentAbortController: null,
    searchHistory: [],
    // Состояние инфинит-скролла
    infiniteScroll: {
        currentPage: 0,
        isLoading: false,
        hasMore: true,
        observer: null,
        isVisible: false
    }
};

// DOM элементы
const elements = {
    citySearch: document.getElementById('citySearch'),
    searchBtn: document.getElementById('searchBtn'),
    refreshBtn: document.getElementById('refreshBtn'),
    weatherCards: document.getElementById('weatherCards'),
    cacheInfo: document.getElementById('cacheInfo'),
    cityButtons: document.querySelectorAll('.city-btn'),
    // Элементы для инфинит-скролла
    toggleInfiniteScroll: document.getElementById('toggleInfiniteScroll'),
    citiesListContainer: document.getElementById('citiesListContainer'),
    citiesList: document.getElementById('citiesList'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    scrollSentinel: document.getElementById('scrollSentinel')
};

/**
 * Инициализация приложения
 */
function init() {
    // Обработчик поиска по нажатию кнопки (использует кэш)
    elements.searchBtn.addEventListener('click', () => {
        handleSearch(false); // false = использовать кэш, если доступен
    });

    // Обработчик поиска по Enter (использует кэш)
    elements.citySearch.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            handleSearch(false); // false = использовать кэш, если доступен
        }
    });

    // Debounced поиск при вводе (БОНУС: автопоиск с задержкой 500мс)
    // Автоматически ищет при наборе города (3+ символов)
    const debouncedSearch = debounce(() => {
        const value = elements.citySearch.value.trim();
        if (value.length >= 3) {
            handleSearch(false); // Использует кэш
        }
    }, 500);
    elements.citySearch.addEventListener('input', debouncedSearch);

    // Обработчик кнопки "Обновить" (ИГНОРИРУЕТ кэш и всегда загружает с сервера)
    elements.refreshBtn.addEventListener('click', () => {
        handleSearch(true); // true = игнорировать кэш и загрузить свежие данные
    });

    // Обработчики кнопок популярных городов (используют кэш)
    elements.cityButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const city = btn.dataset.city;
            elements.citySearch.value = city;
            handleSearch(false); // false = использовать кэш, если доступен
        });
    });

    // Загружаем погоду для первого города при загрузке (используем кэш)
    elements.citySearch.value = 'Moscow';
    handleSearch(false); // false = использовать кэш, если доступен

    // Инициализация инфинит-скролла
    initInfiniteScroll();
}

/**
 * Инициализация инфинит-скролла
 */
function initInfiniteScroll() {
    // Обработчик кнопки показа/скрытия списка
    elements.toggleInfiniteScroll.addEventListener('click', () => {
        state.infiniteScroll.isVisible = !state.infiniteScroll.isVisible;

        if (state.infiniteScroll.isVisible) {
            elements.citiesListContainer.classList.remove('hidden');
            elements.toggleInfiniteScroll.innerHTML =
                '<span class="btn-text">📋 Скрыть список</span>';
            elements.toggleInfiniteScroll.setAttribute('aria-expanded', 'true');

            // Загружаем первую страницу, если еще не загружали
            if (state.infiniteScroll.currentPage === 0) {
                loadMoreCities();
            }
        } else {
            elements.citiesListContainer.classList.add('hidden');
            elements.toggleInfiniteScroll.innerHTML =
                '<span class="btn-text">📋 Показать список</span>';
            elements.toggleInfiniteScroll.setAttribute('aria-expanded', 'false');
        }
    });

    // Проверяем, что sentinel существует
    if (!elements.scrollSentinel) {
        console.error('❌ Sentinel элемент не найден');
        return;
    }

    // Проверяем, что sentinel в правильном месте
    if (elements.scrollSentinel.parentNode !== elements.citiesList) {
        console.warn('⚠️ Sentinel не в citiesList, перемещаем...');
        elements.citiesList.appendChild(elements.scrollSentinel);
    }

    console.log('✅ Инфинит-скролл инициализирован, sentinel на месте');

    // Настройка Intersection Observer для автозагрузки
    state.infiniteScroll.observer = new IntersectionObserver(
        entries => {
            const sentinel = entries[0];
            if (
                sentinel.isIntersecting &&
                state.infiniteScroll.hasMore &&
                !state.infiniteScroll.isLoading
            ) {
                console.log('🔄 Sentinel виден - загружаем больше городов');
                loadMoreCities();
            }
        },
        {
            root: elements.citiesList,
            rootMargin: '100px', // Prefetch за 100px до конца
            threshold: 0.1
        }
    );

    // Начинаем наблюдение за sentinel
    state.infiniteScroll.observer.observe(elements.scrollSentinel);
}

/**
 * Загрузка следующей страницы городов (с ETag кэшированием)
 */
async function loadMoreCities() {
    if (state.infiniteScroll.isLoading || !state.infiniteScroll.hasMore) {
        return;
    }

    state.infiniteScroll.isLoading = true;
    elements.loadingIndicator.classList.add('visible');

    try {
        const nextPage = state.infiniteScroll.currentPage + 1;
        console.log(`📥 Загрузка страницы ${nextPage}...`);

        const result = await getCitiesPaginated({
            page: nextPage,
            limit: 10,
            useETag: true
        });

        console.log(`📦 Получено ${result.data.length} городов для отображения`);

        // Отображаем города
        result.data.forEach((city, index) => {
            const cityCard = createCityCard(city, result.fromCache);
            // Безопасная вставка: проверяем, что sentinel в нужном контейнере
            if (
                elements.scrollSentinel &&
                elements.scrollSentinel.parentNode === elements.citiesList
            ) {
                elements.citiesList.insertBefore(cityCard, elements.scrollSentinel);
            } else {
                // Если sentinel не на месте, просто добавляем в конец
                console.warn(`⚠️ Город ${index + 1}: sentinel не в citiesList, добавляем в конец`);
                elements.citiesList.appendChild(cityCard);
            }
        });

        // Обновляем состояние
        state.infiniteScroll.currentPage = nextPage;
        state.infiniteScroll.hasMore = result.hasMore;

        console.log(`✅ Загружено ${result.data.length} городов (страница ${nextPage})`);

        if (result.fromCache) {
            console.log('💾 Данные получены из ETag кэша (304 Not Modified)');
        }

        if (!result.hasMore) {
            console.log('🏁 Все города загружены');
            elements.loadingIndicator.innerHTML = '<p>Все города загружены</p>';
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки городов:', error);
        showCitiesError(error);
    } finally {
        state.infiniteScroll.isLoading = false;
        if (state.infiniteScroll.hasMore) {
            elements.loadingIndicator.classList.remove('visible');
        }
    }
}

/**
 * Создание карточки города
 */
function createCityCard(city, fromCache = false) {
    const card = document.createElement('div');
    card.className = 'city-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${city.name}, ${city.country}. Население: ${(city.population / 1000000).toFixed(1)} миллионов`);
    card.innerHTML = `
        <div class="city-card-name">
            🌍 ${city.name}
            ${fromCache ? '<span class="etag-badge">ETag Cache</span>' : ''}
        </div>
        <div class="city-card-country">Страна: ${city.country}</div>
        <div class="city-card-population">
            Население: ${(city.population / 1000000).toFixed(1)}M
        </div>
    `;

    // Обработчик для клика и Enter
    const handleSelect = async () => {
        elements.citySearch.value = city.name;

        // Небольшая задержка перед запросом (100мс), чтобы не перегружать API
        await new Promise(resolve => setTimeout(resolve, 100));

        handleSearch(false);
        // Прокручиваем к результатам
        elements.weatherCards.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Клик по карточке - поиск погоды
    card.addEventListener('click', handleSelect);
    
    // Поддержка клавиатуры
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect();
        }
    });

    return card;
}

/**
 * Отображение ошибки загрузки городов
 */
function showCitiesError(error) {
    const errorType = error.isNetworkError ? 'network' : 'business';
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-state';
    errorMsg.style.gridColumn = '1 / -1'; // Занять всю ширину грида

    let errorHint = '';
    if (error.message.includes('CONNECTION_REFUSED') || error.message.includes('Failed to fetch')) {
        errorHint =
            '<p class="error-hint">💡 Убедитесь, что mock-сервер запущен: <code>cd mock-api && npm start</code></p>';
    }

    errorMsg.innerHTML = `
        <div class="error-icon">⚠️</div>
        <h3>Ошибка загрузки городов</h3>
        <p>${error.message}</p>
        <span class="error-type-badge ${errorType}">
            ${error.isNetworkError ? '🌐 Сетевая ошибка' : '💼 Бизнес-ошибка'}
        </span>
        ${errorHint}
    `;

    // Добавляем перед sentinel (если он есть)
    if (elements.scrollSentinel && elements.scrollSentinel.parentNode === elements.citiesList) {
        elements.citiesList.insertBefore(errorMsg, elements.scrollSentinel);
    } else {
        // Иначе просто добавляем в конец
        elements.citiesList.appendChild(errorMsg);
    }
}

/**
 * Обработчик поиска погоды
 * @param {boolean} ignoreCache - Игнорировать кэш
 */
async function handleSearch(ignoreCache = false) {
    const cityName = elements.citySearch.value.trim();

    if (!cityName) {
        showError('Введите название города');
        return;
    }

    // Отменяем предыдущий запрос, если он есть
    if (state.currentAbortController) {
        state.currentAbortController.abort();
    }

    // Создаем новый контроллер для отмены
    state.currentAbortController = new AbortController();

    // Показываем состояние загрузки
    showLoading();

    try {
        // Запрос погоды
        const weatherData = await getWeatherByCity(cityName, {
            ignoreCache,
            signal: state.currentAbortController.signal
        });

        // Отображаем результат
        displayWeather(weatherData);

        // Показываем информацию о кэше
        displayCacheInfo(cityName, weatherData.fromCache);

        // Добавляем в историю
        addToHistory(cityName);
    } catch (error) {
        if (error.message.includes('отменен')) {
            console.log('Запрос был отменен');
        } else if (error.code === 'CITY_NOT_FOUND' || error.message.includes('не найден')) {
            // Город не найден - показываем пустое состояние
            showEmpty(`Город "${cityName}" не найден. Проверьте правильность написания.`);
        } else {
            showError(error);
        }
    } finally {
        state.currentAbortController = null;
    }
}

/**
 * Отображение состояния загрузки (skeleton)
 */
function showLoading() {
    elements.weatherCards.innerHTML = `
        <div class="weather-card skeleton">
            <div class="skeleton-header"></div>
            <div class="skeleton-temp"></div>
            <div class="skeleton-desc"></div>
            <div class="skeleton-details"></div>
        </div>
    `;
    elements.cacheInfo.textContent = '';
}

/**
 * Отображение ошибки
 */
function showError(error) {
    // Определяем тип ошибки
    const isNetworkError = error.isNetworkError || false;
    const isBusinessError = error.isBusinessError || false;
    const message = error.message || error;

    let errorTypeLabel = '';
    let errorTypeClass = '';
    let errorHint = '';

    if (isNetworkError) {
        errorTypeLabel = '🌐 Сетевая ошибка';
        errorTypeClass = 'network';
    } else if (isBusinessError) {
        errorTypeLabel = '💼 Бизнес-ошибка';
        errorTypeClass = 'business';

        // Специальная подсказка для ошибки 429
        if (error.code === 'RATE_LIMIT_EXCEEDED' || error.statusCode === 429) {
            errorHint = `
                <div class="error-hint">
                    <p>💡 <strong>Советы:</strong></p>
                    <ul>
                        <li>Подождите несколько минут перед следующим запросом</li>
                        <li>Данные кэшируются на 10 минут - используйте ранее загруженные города</li>
                        <li>Получите свой бесплатный API ключ на <a href="https://openweathermap.org/api" target="_blank">openweathermap.org</a></li>
                    </ul>
                </div>
            `;
        }

        // Специальная подсказка для ошибки 401 (неактивный ключ)
        if (error.code === 'API_KEY_ERROR' || error.statusCode === 401) {
            errorHint = `
                <div class="error-hint">
                    <p>💡 <strong>Важно:</strong></p>
                    <ul>
                        <li>🕐 Новые API ключи активируются в течение <strong>10 минут - 2 часов</strong> после создания</li>
                        <li>📧 Убедитесь, что вы подтвердили email на OpenWeatherMap</li>
                        <li>🔑 Проверьте правильность введенного ключа в файле <code>weatherApi.js</code></li>
                        <li>⏳ Если ключ новый - подождите ~30 минут и обновите страницу</li>
                        <li>📝 Проверьте статус ключа в <a href="https://home.openweathermap.org/api_keys" target="_blank">личном кабинете</a></li>
                    </ul>
                </div>
            `;
        }
    }

    elements.weatherCards.innerHTML = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h2>Ошибка</h2>
            <p>${message}</p>
            ${errorTypeLabel ? `<span class="error-type-badge ${errorTypeClass}">${errorTypeLabel}</span>` : ''}
            ${errorHint}
        </div>
    `;
    elements.cacheInfo.textContent = '';
}

/**
 * Отображение пустого состояния (нет результатов)
 */
function showEmpty(message = 'Нет результатов') {
    elements.weatherCards.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <h2>Ничего не найдено</h2>
            <p>${message}</p>
            <p class="empty-hint">Попробуйте изменить запрос или выбрать город из списка ниже</p>
        </div>
    `;
    elements.cacheInfo.textContent = '';
}

/**
 * Отображение данных о погоде
 */
function displayWeather(data) {
    const temp = kelvinToCelsius(data.main.temp);
    const feelsLike = kelvinToCelsius(data.main.feels_like);
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;

    elements.weatherCards.innerHTML = `
        <div class="weather-card ${data.fromCache ? 'from-cache' : 'fresh'}">
            <div class="card-header">
                <h2>${data.name}, ${data.sys.country}</h2>
                <div class="cache-badge ${data.fromCache ? 'cached' : 'fresh'}">
                    ${data.fromCache ? '💾 Из кэша' : '🌐 Свежие данные'}
                </div>
            </div>
            
            <div class="weather-main">
                <img src="${iconUrl}" alt="${data.weather[0].description}" class="weather-icon">
                <div class="temperature">${temp}°C</div>
            </div>
            
            <div class="weather-description">
                ${data.weather[0].description}
            </div>
            
            <div class="weather-details">
                <div class="detail-item">
                    <span class="detail-label">Ощущается как</span>
                    <span class="detail-value">${feelsLike}°C</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Влажность</span>
                    <span class="detail-value">${data.main.humidity}%</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Давление</span>
                    <span class="detail-value">${data.main.pressure} hPa</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Ветер</span>
                    <span class="detail-value">${data.wind.speed} м/с</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Видимость</span>
                    <span class="detail-value">${(data.visibility / 1000).toFixed(1)} км</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Обновлено</span>
                    <span class="detail-value">${formatDateTime(data.dt)}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Отображение информации о кэше
 */
function displayCacheInfo(cityName, fromCache) {
    const cacheInfo = getCacheInfo(cityName);

    if (fromCache) {
        // Данные были получены из кэша
        elements.cacheInfo.innerHTML = `
            <div class="cache-status cached">
                💾 Данные из кэша. Актуальны ещё <strong>${cacheInfo.remainingSec} сек</strong>
            </div>
        `;
    } else {
        // Данные были загружены с сервера
        elements.cacheInfo.innerHTML = `
            <div class="cache-status fresh">
                ✨ Свежие данные загружены с сервера. Сохранены в кэш на <strong>60 секунд</strong>
                <br>
                <small>При повторном поиске в течение минуты данные будут взяты из кэша.</small>
            </div>
        `;
    }
}

/**
 * Добавить город в историю поиска
 */
function addToHistory(cityName) {
    if (!state.searchHistory.includes(cityName)) {
        state.searchHistory.unshift(cityName);
        if (state.searchHistory.length > 10) {
            state.searchHistory.pop();
        }
    }
}

/**
 * Функция для принудительного обновления (игнорирование кэша)
 */
window.forceRefresh = function () {
    handleSearch(true);
};

/**
 * Очистка всего кэша (для отладки)
 */
window.clearAllCache = function () {
    clearCache(); // TTL кэш погоды
    clearETagCache(); // ETag кэш городов
    elements.cacheInfo.innerHTML = `
        <div class="cache-status fresh">
            🗑️ Весь кэш очищен (TTL + ETag)
        </div>
    `;
};

/**
 * Сброс инфинит-скролла (для отладки)
 */
window.resetInfiniteScroll = function () {
    state.infiniteScroll.currentPage = 0;
    state.infiniteScroll.hasMore = true;
    elements.citiesList.innerHTML = '';
    elements.citiesList.appendChild(elements.scrollSentinel);
    elements.loadingIndicator.innerHTML = `
        <div class="spinner"></div>
        <p>Загрузка городов...</p>
    `;
    clearETagCache();
    console.log('🔄 Инфинит-скролл сброшен');
};

// Запуск приложения
init();

