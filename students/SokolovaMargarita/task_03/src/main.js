const API_KEY = 'YjwllBG70m0pF5HfmNh5KqgwSELjzz7N';
const GIPHY_URL = 'https://api.giphy.com/v1/gifs/search';
const MOCK_URL = 'http://localhost:3000/gifs';
const LIMIT = 20;
const CACHE_TIME = 5 * 60 * 1000;

let cache = new Map();
let query = '';
let offset = 0;
let total = 0;
let controller;
let isLoading = false;
let hasMore = true;
let prefetchData = null;

const search = document.getElementById('search');
const refresh = document.getElementById('refresh');
const loading = document.getElementById('loading');
const errorEl = document.getElementById('error');
const empty = document.getElementById('empty');
const results = document.getElementById('results');

// Дебаунс для плавного ввода
function debounce(fn, ms) {
    let timer;
    return function() {
        clearTimeout(timer);
        timer = setTimeout(fn, ms);
    };
}

// Fetch с ретраями и логами
async function fetchRetry(url, options = {}) {
    let tries = 0;
    while (tries < 3) {
        controller = new AbortController();
        let timeout = setTimeout(() => controller.abort(), 5000);
        try {
            console.log(`Попытка fetch: ${url}`); // Дебажный лог
            let res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeout);
            if (res.status === 304) return { status: 304, etag: res.headers.get('ETag') };
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            let data = await res.json();
            console.log('Данные получены:', data); // Лог ответа
            return { data, etag: res.headers.get('ETag'), status: res.status, headers: res.headers };
        } catch (e) {
            clearTimeout(timeout);
            console.error('Ошибка fetch:', e); // Лог ошибки
            if (e.name === 'AbortError') return;
            tries++;
            await new Promise(r => setTimeout(r, 500 * Math.pow(2, tries)));
        }
    }
    throw new Error('Не получилось после 3 попыток');
}

// Получи данные: Giphy онлайн, fallback на db.json оффлайн
async function getData(q, off, force = false) {
    let key = q + '_' + off;
    let cached = cache.get(key);
    let headers = {};
    if (!force && cached && Date.now() - cached.time < CACHE_TIME && cached.etag) {
        headers['If-None-Match'] = cached.etag;
    }

    let gifs = [];
    let totalCount = 0;

    // Сначала Giphy (онлайн)
    try {
        let url = `${GIPHY_URL}?api_key=${API_KEY}&q=${q}&limit=${LIMIT}&offset=${off}`;
        let res = await fetchRetry(url, { headers });
        if (res && res.data) {
            gifs = res.data.data || [];
            totalCount = res.data.pagination ? res.data.pagination.total_count : gifs.length;
            cache.set(key, { gifs, etag: res.etag, time: Date.now() });
            return { gifs, totalCount };
        }
    } catch (e) {
        console.warn('Giphy оффлайн, fallback на db.json');
        // Fallback на mock (db.json)
        try {
            let mockUrl = `${MOCK_URL}?q=${q}&_limit=${LIMIT}&_start=${off}`;
            let mockRes = await fetchRetry(mockUrl, { headers });
            if (mockRes && mockRes.data) {
                gifs = Array.isArray(mockRes.data) ? mockRes.data : [];
                totalCount = mockRes.headers ? parseInt(mockRes.headers.get('X-Total-Count')) : gifs.length;
                cache.set(key, { gifs, etag: mockRes.etag, time: Date.now() });
                return { gifs, totalCount };
            }
        } catch (mockError) {
            throw new Error('Нет доступа ни к Giphy, ни к локальному db.json');
        }
    }
}

// Добавь GIF
function appendGifs(gifs) {
    gifs.forEach(gif => {
        let div = document.createElement('div');
        div.className = 'result-item';
        let img = document.createElement('img');
        img.src = gif.images ? gif.images.fixed_height.url : gif.url || 'placeholder.jpg';
        div.append(img);
        results.append(div);
    });
}

// Loading skeleton
function showLoading(append = true) {
    loading.classList.remove('hidden');
    for (let i = 0; i < LIMIT; i++) {
        let sk = document.createElement('div');
        sk.className = 'skeleton';
        if (append) results.append(sk);
        else results.innerHTML += sk.outerHTML;
    }
}

// Поиск
const doSearch = debounce(async () => {
    if (controller) controller.abort();
    query = search.value.trim();
    offset = 0;
    results.innerHTML = '';
    hasMore = true;
    prefetchData = null;
    if (!query) {
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');
    errorEl.classList.add('hidden');
    isLoading = true;
    showLoading(false);
    try {
        let response = await getData(query, offset);
        let gifs = response.gifs;
        total = response.totalCount;
        if (gifs.length === 0) {
            empty.classList.remove('hidden');
        } else {
            appendGifs(gifs);
        }
        offset += LIMIT;
        hasMore = offset < total;
        if (hasMore) prefetchData = await getData(query, offset);
    } catch (e) {
        errorEl.textContent = 'Ошибка: ' + e.message;
        errorEl.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
        isLoading = false;
    }
}, 300);

// Infinite-scroll
function setupInfiniteScroll() {
    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
            loadMore();
        }
    }, { rootMargin: '100px' });
    const sentinel = document.createElement('div');
    sentinel.id = 'sentinel';
    results.append(sentinel);
    observer.observe(sentinel);
}

async function loadMore() {
    isLoading = true;
    showLoading(true);
    try {
        let response;
        if (prefetchData) {
            response = prefetchData;
            prefetchData = null;
        } else {
            response = await getData(query, offset);
        }
        let gifs = response.gifs;
        appendGifs(gifs);
        offset += LIMIT;
        hasMore = offset < total;
        if (hasMore) prefetchData = await getData(query, offset);
    } catch (e) {
        errorEl.textContent = 'Ошибка: ' + e.message;
        errorEl.classList.remove('hidden');
    } finally {
        isLoading = false;
        loading.classList.add('hidden');
    }
}

// События
search.addEventListener('input', doSearch);
refresh.addEventListener('click', async () => {
    if (!query) return;
    showLoading(false);
    try {
        let response = await getData(query, 0, true);
        results.innerHTML = '';
        appendGifs(response.gifs);
        offset = LIMIT;
        hasMore = offset < total;
    } catch (e) {
        errorEl.textContent = 'Ошибка: ' + e.message;
        errorEl.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
});
setupInfiniteScroll();