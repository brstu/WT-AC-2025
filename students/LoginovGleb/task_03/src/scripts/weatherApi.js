/**
 * API клиент для работы с OpenWeatherMap
 */

import { fetchWithRetry, CacheWithTTL, NetworkError, BusinessError } from './utils.js';

// API ключ OpenWeatherMap (бесплатный, можно заменить на свой)
const API_KEY = 'bd5e378503939ddaee76f12ad7a97608'; // Публичный демо-ключ
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Кэш с TTL 10 минут (600000 мс) - увеличено для снижения нагрузки на API
const weatherCache = new CacheWithTTL(600000);

/**
 * Получить погоду для города
 * @param {string} cityName - Название города
 * @param {Object} options - Опции запроса
 * @param {boolean} options.ignoreCache - Игнорировать кэш и делать свежий запрос
 * @param {AbortSignal} options.signal - Сигнал для отмены запроса
 * @returns {Promise<Object>} - Данные о погоде
 */
export async function getWeatherByCity(cityName, { ignoreCache = false, signal = null } = {}) {
    const cacheKey = `weather_${cityName.toLowerCase()}`;

    // Проверяем кэш (если не игнорируем его)
    if (!ignoreCache) {
        const cached = weatherCache.get(cacheKey);
        if (cached) {
            console.log(`✅ Данные для "${cityName}" получены из кэша`);
            return { ...cached, fromCache: true };
        }
    }

    // Формируем URL с параметрами
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&lang=ru`;

    try {
        console.log(`🌐 Загрузка данных для "${cityName}" с сервера...`);

        // Запрос с retry, timeout и возможностью отмены
        const response = await fetchWithRetry(url, {
            retries: 2,
            backoffMs: 500,
            timeoutMs: 5000,
            signal
        });

        // Сохраняем в кэш
        weatherCache.set(cacheKey, response.data);
        console.log(`💾 Данные для "${cityName}" сохранены в кэш`);

        return { ...response.data, fromCache: false };
    } catch (error) {
        // Если запрос был отменен
        if (error.message.includes('отменен') || error.name === 'AbortError') {
            throw new NetworkError('Запрос был отменен');
        }

        // Обработка ошибок API - преобразуем в бизнес-ошибки
        if (error.code === 'NOT_FOUND' || error.statusCode === 404) {
            throw new BusinessError(`Город "${cityName}" не найден`, 'CITY_NOT_FOUND');
        }
        if (error.code === 'AUTH_ERROR' || error.statusCode === 401) {
            throw new BusinessError(
                'Ошибка API ключа. Используйте свой ключ OpenWeatherMap',
                'API_KEY_ERROR'
            );
        }
        if (error.statusCode === 429) {
            throw new BusinessError(
                'Превышен лимит запросов к API. Попробуйте позже или используйте свой API ключ',
                'RATE_LIMIT_EXCEEDED'
            );
        }

        // Сетевые ошибки пробрасываем как есть
        if (error.isNetworkError) {
            throw error;
        }

        // Неизвестные ошибки оборачиваем в NetworkError
        throw new NetworkError(`Ошибка загрузки погоды: ${error.message}`);
    }
}

/**
 * Получить информацию о кэше для города
 * @param {string} cityName - Название города
 * @returns {Object|null} - Информация о кэше или null
 */
export function getCacheInfo(cityName) {
    const cacheKey = `weather_${cityName.toLowerCase()}`;
    return weatherCache.getCacheInfo(cacheKey);
}

/**
 * Очистить весь кэш
 */
export function clearCache() {
    weatherCache.clear();
    console.log('🗑️ Кэш очищен');
}

/**
 * Получить погоду для нескольких городов параллельно
 * @param {string[]} cities - Массив названий городов
 * @param {Object} options - Опции запроса
 * @returns {Promise<Object[]>} - Массив результатов
 */
export async function getWeatherForMultipleCities(cities, options = {}) {
    const promises = cities.map(city =>
        getWeatherByCity(city, options)
            .then(data => ({ success: true, city, data }))
            .catch(error => ({ success: false, city, error: error.message }))
    );

    return Promise.all(promises);
}

