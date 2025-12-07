// main.js

const API_BASE = 'https://fakestoreapi.com'; // Используем Fake Store API как mock для маркетплейса
const ITEMS_PER_PAGE = 10;
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

let currentPage = 1;
let totalPages = 1;
let searchQuery = '';
let category = '';
let abortController = null;
let cache = new Map(); // In-memory cache

// Функция для fetch с ретраями и таймаутом
async function fetchWithRetry(url, options = {}) {
    const { retries = 3, backoffMs = 1000, timeoutMs = 5000 } = options;
    let attempt = 0;

    while (attempt < retries) {
        abortController = new AbortController();
        const signal = abortController.signal;

        const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

        try {
            const response = await fetch(url, { signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out or aborted');
            }
            attempt++;
            if (attempt >= retries) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, backoffMs * Math.pow(2, attempt)));
        }
    }
}

// Функция для получения данных с кэшем
async function getData(url, ignoreCache = false) {
    const cacheKey = url;
    const cached = cache.get(cacheKey);

    if (!ignoreCache && cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('Using cache for:', url);
        return cached.data;
    }

    try {
        const data = await fetchWithRetry(url);
        cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
    } catch (error) {
        throw error;
    }
}

// Загрузка категорий
async function loadCategories() {
    try {
        const categories = await getData(`${API_BASE}/products/categories`);
        const select = document.getElementById('categoryFilter');
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Загрузка продуктов
async function loadProducts(page = 1, ignoreCache = false) {
    showLoading(true);
    hideError();
    hideEmpty();
    document.getElementById('products').style.display = 'none';

    // Отменяем предыдущий запрос
    if (abortController) {
        abortController.abort();
    }

    let url = `${API_BASE}/products?limit=${ITEMS_PER_PAGE}&_page=${page}`;
    if (searchQuery) {
        url = `${API_BASE}/products`; // Fake API не поддерживает поиск, симулируем фильтр позже
    }
    if (category) {
        url = `${API_BASE}/products/category/${category}?limit=${ITEMS_PER_PAGE}&_page=${page}`;
    }

    try {
        let products = await getData(url, ignoreCache);

        // Симуляция поиска (поскольку API не поддерживает)
        if (searchQuery) {
            const allProducts = await getData(`${API_BASE}/products`);
            products = allProducts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
            const start = (page - 1) * ITEMS_PER_PAGE;
            products = products.slice(start, start + ITEMS_PER_PAGE);
            totalPages = Math.ceil(products.length / ITEMS_PER_PAGE); // Для поиска totalPages динамический
        } else {
            const totalProducts = category ? await getData(`${API_BASE}/products/category/${category}`) : await getData(`${API_BASE}/products`);
            totalPages = Math.ceil(totalProducts.length / ITEMS_PER_PAGE);
        }

        if (products.length === 0) {
            showEmpty();
        } else {
            renderProducts(products);
        }

        updatePagination(page);
    } catch (error) {
        if (error.name !== 'AbortError') {
            showError(error.message);
        }
    } finally {
        showLoading(false);
    }
}

// Рендеринг продуктов
function renderProducts(products) {
    const container = document.getElementById('products');
    container.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>$${product.price}</p>
        `;
        container.appendChild(card);
    });
    container.style.display = 'grid';
}

// Управление состояниями
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'grid' : 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = `Ошибка: ${message}. Попробуйте обновить.`;
    errorDiv.style.display = 'block';
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

function showEmpty() {
    document.getElementById('empty').style.display = 'block';
}

function hideEmpty() {
    document.getElementById('empty').style.display = 'none';
}

function updatePagination(page) {
    document.getElementById('pageInfo').textContent = `Страница ${page} из ${totalPages}`;
    document.getElementById('prevPage').disabled = page <= 1;
    document.getElementById('nextPage').disabled = page >= totalPages;
}

// Дебаунс для поиска
function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

const debouncedSearch = debounce(() => {
    searchQuery = document.getElementById('searchInput').value;
    currentPage = 1;
    loadProducts(currentPage);
}, 500);

// События
document.getElementById('searchInput').addEventListener('input', debouncedSearch);

document.getElementById('categoryFilter').addEventListener('change', (e) => {
    category = e.target.value;
    currentPage = 1;
    loadProducts(currentPage);
});

document.getElementById('refreshButton').addEventListener('click', () => {
    loadProducts(currentPage, true); // Игнор кэша
});

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadProducts(currentPage);
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        loadProducts(currentPage);
    }
});

// Инициализация
loadCategories();
loadProducts();