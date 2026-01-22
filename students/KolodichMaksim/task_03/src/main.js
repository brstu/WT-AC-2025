const API_BASE = 'https://fakestoreapi.com';
const ITEMS_PER_PAGE = 10;
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

let currentPage = 1;
let totalPages = 1;
let searchQuery = '';
let category = '';
let abortController = null;

class CacheWithTTL {
    constructor(ttl = CACHE_TTL) {
        this.cache = new Map();
        this.ttl = ttl;
    }
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }
    set(key, value) {
        this.cache.set(key, { value, timestamp: Date.now() });
    }
}

const cache = new CacheWithTTL();

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}) {
    const { retries = 3, backoffMs = 1000, timeoutMs = 8000 } = options;
    let attempt = 0;

    while (attempt <= retries) {
        abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

        try {
            const response = await fetch(url, { signal: abortController.signal });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') throw err;

            attempt++;
            if (attempt <= retries) {
                showRetryIndicator(attempt, retries);
                await sleep(backoffMs * Math.pow(2, attempt - 1));
            }
        }
    }
    throw new Error('Превышено количество попыток подключения');
}

function showRetryIndicator(attempt, total) {
    const errorEl = document.getElementById('error');
    errorEl.textContent = `Повторная попытка ${attempt}/${total}...`;
    errorEl.hidden = false;
}

async function getData(url, ignoreCache = false) {
    const key = url;
    if (!ignoreCache) {
        const cached = cache.get(key);
        if (cached) {
            console.log('Из кэша:', key);
            return cached;
        }
    }

    const data = await fetchWithRetry(url);
    cache.set(key, data);
    return data;
}

// Загрузка категорий
async function loadCategories() {
    try {
        const categories = await getData(`${API_BASE}/products/categories`);
        const select = document.getElementById('category-filter');
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            select.appendChild(opt);
        });
    } catch (err) {
        console.error('Не удалось загрузить категории:', err);
    }
}

// Загрузка товаров
async function loadProducts(page = 1, ignoreCache = false) {
    showLoading(true);
    document.getElementById('error').hidden = true;
    document.getElementById('empty').hidden = true;
    document.getElementById('products').hidden = true;

    // Отмена предыдущего запроса
    if (abortController) abortController.abort();

    let url = `${API_BASE}/products?limit=${ITEMS_PER_PAGE * 10}`;
    if (category) {
        url = `${API_BASE}/products/category/${category}`;
    }

    try {
        let products = await getData(url, ignoreCache);

        // Поиск (клиентская фильтрация)
        if (searchQuery) {
            products = products.filter(p =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
        const start = (page - 1) * ITEMS_PER_PAGE;
        const pageItems = products.slice(start, start + ITEMS_PER_PAGE);

        if (pageItems.length === 0) {
            document.getElementById('empty').hidden = false;
        } else {
            renderProducts(pageItems);
        }

        updatePagination(page);
    } catch (err) {
        if (err.name !== 'AbortError') {
            document.getElementById('error').textContent = `Ошибка: ${err.message}`;
            document.getElementById('error').hidden = false;
        }
    } finally {
        showLoading(false);
    }
}

function renderProducts(products) {
    const container = document.getElementById('products');
    container.innerHTML = '';
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.image}" alt="${p.title}" loading="lazy">
            <h3>${p.title}</h3>
            <p>$${p.price}</p>
        `;
        container.appendChild(card);
    });
    container.hidden = false;
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'grid' : 'none';
}

function updatePagination(page) {
    document.getElementById('page-info').textContent = `Страница ${page} из ${totalPages}`;
    document.getElementById('prev-page').disabled = page <= 1;
    document.getElementById('next-page').disabled = page >= totalPages;
    currentPage = page;
}

// Дебаунс
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

const debouncedSearch = debounce(() => {
    searchQuery = document.getElementById('search-input').value.trim();
    currentPage = 1;
    loadProducts(currentPage);
}, 500);

// События
document.getElementById('search-input').addEventListener('input', debouncedSearch);

document.getElementById('category-filter').addEventListener('change', e => {
    category = e.target.value;
    currentPage = 1;
    loadProducts(currentPage);
});

document.getElementById('refresh-button').addEventListener('click', () => {
    loadProducts(currentPage, true);
});

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) loadProducts(currentPage - 1);
});

document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < totalPages) loadProducts(currentPage + 1);
});

// Старт
loadCategories();
loadProducts();