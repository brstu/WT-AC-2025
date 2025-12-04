/**
 * Mock API клиент для работы с локальным json-server
 * Поддерживает ETag кэширование и пагинацию
 */

import { fetchWithRetry, ETagCache, NetworkError, BusinessError } from './utils.js';

const MOCK_API_URL = 'http://localhost:3001';
const etagCache = new ETagCache();

/**
 * Получить список городов с пагинацией
 * @param {Object} options - Опции запроса
 * @param {number} options.page - Номер страницы (начиная с 1)
 * @param {number} options.limit - Количество элементов на странице
 * @param {AbortSignal} options.signal - Сигнал для отмены запроса
 * @param {boolean} options.useETag - Использовать ETag кэширование
 * @returns {Promise<Object>} - Список городов и метаданные
 */
export async function getCitiesPaginated({
    page = 1,
    limit = 10,
    signal = null,
    useETag = true
} = {}) {
    const url = `${MOCK_API_URL}/cities?_page=${page}&_limit=${limit}`;

    try {
        // Подготовка заголовков
        const headers = {};

        // Добавляем If-None-Match если есть ETag в кэше
        if (useETag && etagCache.has(url)) {
            const etag = etagCache.getETag(url);
            if (etag) {
                headers['If-None-Match'] = etag;
                console.log(`📨 Отправка If-None-Match: ${etag}`);
            }
        }

        const response = await fetchWithRetry(url, {
            retries: 2,
            backoffMs: 500,
            timeoutMs: 5000,
            signal,
            headers
        });

        // Если сервер вернул 304 Not Modified
        if (response.status === 304) {
            console.log('✅ 304 Not Modified - используем кэш');
            const cachedData = etagCache.getData(url);
            return {
                ...cachedData,
                fromCache: true,
                cacheHit: true
            };
        }

        // Извлекаем ETag из заголовков
        const etag = response.headers.get('ETag');

        // Извлекаем информацию о пагинации из Link заголовка
        const linkHeader = response.headers.get('Link');
        const totalCount = response.headers.get('X-Total-Count');

        const result = {
            data: response.data,
            page,
            limit,
            total: totalCount ? parseInt(totalCount) : response.data.length,
            hasMore: linkHeader ? linkHeader.includes('rel="next"') : false,
            fromCache: false,
            cacheHit: false
        };

        // Сохраняем в ETag кэш
        if (useETag && etag) {
            etagCache.set(url, etag, result);
            console.log(`💾 Сохранен ETag: ${etag}`);
        }

        return result;
    } catch (error) {
        if (error.isNetworkError) {
            console.error('❌ Сетевая ошибка:', error.message);
            throw error;
        } else if (error.isBusinessError) {
            console.error('❌ Бизнес-ошибка:', error.message);
            throw error;
        } else {
            throw new NetworkError(`Ошибка при загрузке городов: ${error.message}`);
        }
    }
}

/**
 * Поиск городов по имени
 * @param {string} query - Строка поиска
 * @param {Object} options - Опции
 * @returns {Promise<Array>} - Список найденных городов
 */
export async function searchCities(query, { signal = null } = {}) {
    const url = `${MOCK_API_URL}/cities?name_like=${encodeURIComponent(query)}`;

    try {
        const response = await fetchWithRetry(url, {
            retries: 1,
            timeoutMs: 5000,
            signal
        });

        return {
            data: response.data,
            count: response.data.length
        };
    } catch (error) {
        if (error.isNetworkError) {
            throw error;
        }
        throw new NetworkError(`Ошибка поиска городов: ${error.message}`);
    }
}

/**
 * Получить информацию о городе по ID
 * @param {number} id - ID города
 * @returns {Promise<Object>} - Данные города
 */
export async function getCityById(id) {
    const url = `${MOCK_API_URL}/cities/${id}`;

    try {
        const response = await fetchWithRetry(url, {
            retries: 1,
            timeoutMs: 3000
        });

        return response.data;
    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            throw new BusinessError(`Город с ID ${id} не найден`, 'CITY_NOT_FOUND');
        }
        throw error;
    }
}

/**
 * Очистить ETag кэш
 */
export function clearETagCache() {
    etagCache.clear();
    console.log('🗑️ ETag кэш очищен');
}

/**
 * Получить статистику ETag кэша
 */
export function getETagCacheStats() {
    return {
        size: etagCache.cache.size,
        entries: Array.from(etagCache.cache.entries()).map(([url, data]) => ({
            url,
            hasETag: !!data.etag,
            age: Date.now() - data.timestamp
        }))
    };
}

