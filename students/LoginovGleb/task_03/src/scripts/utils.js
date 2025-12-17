/**
 * Утилиты для работы с HTTP запросами, кэшем и обработкой событий
 */

/**
 * Кастомные классы ошибок для разделения сетевых и бизнес-ошибок
 */

// Сетевые ошибки (проблемы с подключением, таймауты, HTTP статусы)
export class NetworkError extends Error {
    constructor(message, statusCode = null) {
        super(message);
        this.name = 'NetworkError';
        this.statusCode = statusCode;
        this.isNetworkError = true;
    }
}

// Бизнес-ошибки (город не найден, невалидные данные, ошибки API)
export class BusinessError extends Error {
    constructor(message, code = null, statusCode = null) {
        super(message);
        this.name = 'BusinessError';
        this.code = code;
        this.statusCode = statusCode;
        this.isBusinessError = true;
    }
}

/**
 * Класс для управления кэшем с TTL (time-to-live)
 */
export class CacheWithTTL {
    constructor(ttlMs = 60000) {
        // По умолчанию 1 минута
        this.cache = new Map();
        this.ttlMs = ttlMs;
    }

    /**
     * Сохранить значение в кэш
     */
    set(key, value) {
        const expiresAt = Date.now() + this.ttlMs;
        this.cache.set(key, { value, expiresAt });
    }

    /**
     * Получить значение из кэша (null если истек TTL или не найдено)
     */
    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() > cached.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return cached.value;
    }

    /**
     * Проверить, есть ли валидное значение в кэше
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Очистить весь кэш
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Получить информацию о кэше для ключа
     */
    getCacheInfo(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const now = Date.now();
        const isExpired = now > cached.expiresAt;
        const remainingMs = isExpired ? 0 : cached.expiresAt - now;

        return {
            isExpired,
            remainingMs,
            remainingSec: Math.ceil(remainingMs / 1000)
        };
    }
}

/**
 * Класс для управления ETag кэшем (условные HTTP запросы)
 * Поддерживает If-None-Match заголовки для оптимизации трафика
 */
export class ETagCache {
    constructor() {
        this.cache = new Map(); // { url: { etag, data, timestamp } }
    }

    /**
     * Сохранить данные с ETag
     */
    set(url, etag, data) {
        this.cache.set(url, {
            etag,
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Получить ETag для URL (для If-None-Match заголовка)
     */
    getETag(url) {
        const cached = this.cache.get(url);
        return cached ? cached.etag : null;
    }

    /**
     * Получить закэшированные данные
     */
    getData(url) {
        const cached = this.cache.get(url);
        return cached ? cached.data : null;
    }

    /**
     * Проверить наличие кэша для URL
     */
    has(url) {
        return this.cache.has(url);
    }

    /**
     * Очистить весь кэш
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Получить информацию о кэше
     */
    getCacheInfo(url) {
        const cached = this.cache.get(url);
        if (!cached) return null;

        return {
            hasETag: !!cached.etag,
            timestamp: cached.timestamp,
            age: Date.now() - cached.timestamp
        };
    }
}

/**
 * Fetch с повторными попытками, таймаутом и отменой
 * @param {string} url - URL для запроса
 * @param {Object} options - Опции запроса
 * @param {number} options.retries - Количество повторных попыток (по умолчанию 2)
 * @param {number} options.backoffMs - Начальная задержка между попытками (по умолчанию 500)
 * @param {number} options.timeoutMs - Таймаут запроса в мс (по умолчанию 5000)
 * @param {AbortSignal} options.signal - Сигнал для отмены запроса
 * @param {Object} options.headers - Дополнительные заголовки
 * @returns {Promise<any>} - Распарсенный JSON ответ
 */
export async function fetchWithRetry(
    url,
    { retries = 2, backoffMs = 500, timeoutMs = 5000, signal = null, headers = {} } = {}
) {
    let attempt = 0;
    let lastError;

    while (attempt <= retries) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        // Комбинируем сигналы: внешний и для таймаута
        const combinedSignal = signal
            ? combineAbortSignals(signal, controller.signal)
            : controller.signal;

        try {
            const response = await fetch(url, {
                signal: combinedSignal,
                headers: headers
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                // Различаем типы ошибок
                if (response.status >= 500) {
                    throw new NetworkError(
                        `Ошибка сервера ${response.status}: ${response.statusText}`,
                        response.status
                    );
                } else if (response.status === 404) {
                    throw new BusinessError('Ресурс не найден (404)', 'NOT_FOUND');
                } else if (response.status === 401 || response.status === 403) {
                    throw new BusinessError(
                        `Ошибка авторизации (${response.status})`,
                        'AUTH_ERROR'
                    );
                } else if (response.status === 429) {
                    throw new BusinessError(
                        'Превышен лимит запросов (429)',
                        'RATE_LIMIT',
                        response.status
                    );
                } else {
                    throw new NetworkError(
                        `HTTP ${response.status}: ${response.statusText}`,
                        response.status
                    );
                }
            }

            // Возвращаем ответ с заголовками (для ETag)
            const data = await response.json();
            return {
                data,
                headers: response.headers,
                status: response.status
            };
        } catch (error) {
            clearTimeout(timeoutId);
            lastError = error;

            // Если запрос был отменен извне, не повторяем
            if (signal?.aborted || error.name === 'AbortError') {
                throw new NetworkError('Запрос был отменен');
            }

            // Бизнес-ошибки не повторяем
            if (error.isBusinessError) {
                throw error;
            }

            // Если это таймаут или сетевая ошибка и есть еще попытки
            if (attempt < retries && error.isNetworkError) {
                const delay = backoffMs * Math.pow(2, attempt);
                console.warn(`Попытка ${attempt + 1} не удалась. Повтор через ${delay}мс...`);
                await sleep(delay);
                attempt++;
            } else {
                break;
            }
        }
    }

    // Если это уже наша кастомная ошибка, пробрасываем как есть
    if (lastError.isNetworkError || lastError.isBusinessError) {
        throw lastError;
    }

    throw new NetworkError(
        `Не удалось выполнить запрос после ${retries + 1} попыток: ${lastError.message}`
    );
}

/**
 * Комбинирует несколько AbortSignal в один
 */
function combineAbortSignals(...signals) {
    const controller = new AbortController();

    for (const signal of signals) {
        if (signal.aborted) {
            controller.abort();
            return controller.signal;
        }
        signal.addEventListener('abort', () => controller.abort());
    }

    return controller.signal;
}

/**
 * Debounce функция - откладывает выполнение
 * @param {Function} fn - Функция для вызова
 * @param {number} ms - Задержка в миллисекундах
 * @returns {Function} - Debounced функция
 */
export function debounce(fn, ms = 300) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
}

/**
 * Промис с задержкой
 * @param {number} ms - Время задержки в миллисекундах
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Форматирование даты и времени
 */
export function formatDateTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Преобразование температуры из Кельвинов в Цельсии
 */
export function kelvinToCelsius(kelvin) {
    return Math.round(kelvin - 273.15);
}

