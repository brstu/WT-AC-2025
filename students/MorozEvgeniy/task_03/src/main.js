const API_URL = 'https://api.frankfurter.app/latest'; 
const TTL_SECONDS = 60;
const RETRIES = 3;
const BACKOFF_MS = 500;
const TIMEOUT_MS = 5000;

const currencyListEl = document.getElementById('currency-list');
const statusMessageEl = document.getElementById('status-message');
const refreshButton = document.getElementById('refresh-button');
const baseCurrencyInfoEl = document.getElementById('base-currency-info');

const currencyCache = new Map();

function isCacheValid(key) {
    const cachedItem = currencyCache.get(key);
    if (!cachedItem) {
        return false;
    }
    const elapsedTime = Date.now() - cachedItem.timestamp;
    return elapsedTime < TTL_SECONDS * 1000;
}

function setUIState(state, message = '') {
    statusMessageEl.className = 'message';
    statusMessageEl.style.display = 'none';
    currencyListEl.innerHTML = '';
    
    refreshButton.disabled = (state === 'loading');
    
    if (state === 'loading') {
        baseCurrencyInfoEl.textContent = 'Базовая валюта: Загрузка...';
    } else if (state === 'error') {
        baseCurrencyInfoEl.textContent = 'Базовая валюта: Сбой загрузки';
    } else if (state === 'empty') {
        baseCurrencyInfoEl.textContent = 'Базовая валюта: Нет данных';
    }


    if (state === 'loading') {
        statusMessageEl.classList.add('loading');
        statusMessageEl.textContent = 'Загрузка курсов... (Возможны ретраи)';
        statusMessageEl.style.display = 'block';
        for (let i = 0; i < 5; i++) {
            currencyListEl.innerHTML += '<li class="skeleton-item"></li>';
        }
    } else if (state === 'error') {
        statusMessageEl.classList.add('error');
        statusMessageEl.textContent = `Ошибка загрузки: ${message}`;
        statusMessageEl.style.display = 'block';
    } else if (state === 'empty') {
        statusMessageEl.classList.add('empty');
        statusMessageEl.textContent = 'Список курсов пуст. Проверьте API.';
        statusMessageEl.style.display = 'block';
    }
}

function renderCurrencies(data) {
    setUIState('hidden');
    
    const { base, rates, date } = data;

    baseCurrencyInfoEl.innerHTML = `Базовая валюта: **${base}** (Курсы от ${date})`;

    const fragment = document.createDocumentFragment();
    const currencyEntries = Object.entries(rates);
    
    if (currencyEntries.length === 0) {
        setUIState('empty');
        return;
    }

    currencyEntries.forEach(([code, value]) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="currency-code">${base} / ${code}</span>
            <span class="currency-value">${value.toFixed(4)}</span>
        `;
        fragment.appendChild(li);
    });

    currencyListEl.appendChild(fragment);
    
    const cachedItem = currencyCache.get(API_URL);
    if (cachedItem) {
        const lastUpdated = new Date(cachedItem.timestamp).toLocaleTimeString();
        statusMessageEl.classList.add('loading');
        statusMessageEl.textContent = `Успешно загружено. Актуальность до ${lastUpdated} + ${TTL_SECONDS} сек.`;
        statusMessageEl.style.display = 'block';
        setTimeout(() => statusMessageEl.style.display = 'none', 3000);
    }
}

async function fetchWithRetry(url, {retries, backoffMs, timeoutMs}) {
    let attempt = 0;
	
    while (true) {
        attempt++;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            console.warn(`Attempt ${attempt}: Request timed out after ${timeoutMs}ms.`);
            controller.abort();
        }, timeoutMs);
        
        try {
            console.log(`Attempt ${attempt} of ${retries + 1}: Fetching ${url}`);
            
            const res = await fetch(url, { signal: controller.signal });
            
            clearTimeout(timer);
            
            if (!res.ok) {
                throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
            }
            
            return await res.json();
            
        } catch (err) {
            clearTimeout(timer);
            
            const isRetryable = (err.name === 'AbortError' || err instanceof TypeError || err instanceof SyntaxError);
            
            if (isRetryable && attempt <= retries) {
                const delay = backoffMs * Math.pow(2, attempt - 1);
                console.log(`Retry attempt ${attempt}. Waiting for ${delay}ms...`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            
            throw err; 
        }
    }
}

async function loadCurrencies(ignoreCache = false) {
    const cacheKey = API_URL;
    let data = null;
    
    if (!ignoreCache && isCacheValid(cacheKey)) {
        const cachedItem = currencyCache.get(cacheKey);
        data = cachedItem.data;
        console.log(`[КЭШ]: Данные взяты из кэша. Актуальность до ${new Date(cachedItem.timestamp + TTL_SECONDS * 1000).toLocaleTimeString()}`);
        renderCurrencies(data);
        return;
    }

    setUIState('loading');

    try {
        data = await fetchWithRetry(cacheKey, {
            retries: RETRIES,
            backoffMs: BACKOFF_MS,
            timeoutMs: TIMEOUT_MS
        });
        
        if (!data || !data.rates || Object.keys(data.rates).length === 0) {
            throw new Error('API вернуло некорректные или пустые данные (отсутствует поле "rates").');
        }

        currencyCache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });

        renderCurrencies(data);

    } catch (error) {
        console.error('Final error after all retries:', error);
        let errorMessage = 'Сбой сети или API.';
        if (error.name === 'AbortError') {
             errorMessage = `Таймаут истек (${TIMEOUT_MS} мс) или запрос был отменен.`;
        } else if (error.message) {
            errorMessage = error.message;
        }
        setUIState('error', errorMessage);
    }
}

refreshButton.addEventListener('click', () => {
    console.log('[UI]: Кнопка "Обновить" нажата. Игнорируем кэш.');
    loadCurrencies(true); 
});