const API_URL = 'https://jsonplaceholder.typicode.com/photos';
const PAGE_SIZE = 12;

let currentPage = 1;
let searchQuery = '';
let abortController = null;
let debounceTimer = null;
let isLoading = false;

const cache = new Map(); // in-memory кэш с TTL
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

const elements = {
  search: document.getElementById('search'),
  refresh: document.getElementById('refresh'),
  status: document.getElementById('status'),
  list: document.getElementById('list'),
  prev: document.getElementById('prev'),
  next: document.getElementById('next'),
  pageInfo: document.getElementById('page-info')
};

// === КЭШ ===
function getCache(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// === FETCH WITH RETRY + TIMEOUT + ABORT ===
async function fetchWithRetry(url, { retries = 3, backoffMs = 500, timeoutMs = 8000, signal } = {}) {
  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const currentSignal = signal || controller.signal;
    
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, { 
        signal: currentSignal,
        cache: elements.refresh.force ? 'reload' : 'default'
      });
      clearTimeout(timeout);
      
      if (response.status >= 500 && i < retries) {
        await new Promise(res => setTimeout(res, backoffMs * Math.pow(2, i)));
        continue;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data;
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') throw err;
      if (i === retries) throw err;
      // при неудаче продолжаем ретрай
    }
  }
}

// === ЗАГРУЗКА ДАННЫХ ===
async function loadAnimals() {
  if (isLoading) return;
  isLoading = true;
  
  // Отмена предыдущего запроса
  if (abortController) abortController.abort();
  abortController = new AbortController();

  showLoading();

  const cacheKey = `page${currentPage}_q${searchQuery}`;
  const cached = getCache(cacheKey);
  if (cached && !elements.refresh.force) {
    renderAnimals(cached);
    isLoading = false;
    return;
  }

  try {
    const start = (currentPage - 1) * PAGE_SIZE;
    const url = `${API_URL}?albumId=1&_start=${start}&_limit=${PAGE_SIZE}`;
    const data = await fetchWithRetry(url, { signal: abortController.signal });
    
    setCache(cacheKey, data);
    renderAnimals(data);
  } catch (err) {
    if (err.name !== 'AbortError') {
      showError('Не удалось загрузить данные. Проверьте интернет или попробуйте позже.');
      console.error(err);
    }
  } finally {
    isLoading = false;
    elements.refresh.force = false;
  }
}

// === РЕНДЕР ===
function showLoading() {
  elements.status.innerHTML = '<div class="spinner">Загрузка...</div>';
  elements.list.innerHTML = Array(6).fill().map(() => `
    <div class="card skeleton">
      <div class="skeleton-img"></div>
      <div class="card-body">
        <div class="skeleton-text"></div>
        <div class="skeleton-text" style="width:60%"></div>
      </div>
    </div>
  `).join('');
}

function showError(msg) {
  elements.status.innerHTML = `<div class="error">${msg}</div>`;
  elements.list.innerHTML = '';
}

function renderAnimals(animals) {
  let filtered = animals;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = animals.filter(a => a.title.toLowerCase().includes(q));
  }

  if (filtered.length === 0) {
    elements.status.innerHTML = '<div class="empty">Ничего не найдено</div>';
    elements.list.innerHTML = '';
    elements.next.disabled = true;
    return;
  }

  elements.status.innerHTML = '';
  elements.list.innerHTML = '<div class="cards">' + filtered.map(animal => `
    <div class="card">
      <img src="${animal.thumbnailUrl}" alt="${animal.title}">
      <div class="card-body">
        <h3>${animal.title.slice(0, 40)}...</h3>
        <p>№ ${animal.id}</p>
      </div>
    </div>
  `).join('') + '</div>';

  elements.pageInfo.textContent = `Страница ${currentPage}`;
  elements.prev.disabled = currentPage === 1;
  elements.next.disabled = animals.length < PAGE_SIZE;
}

// === СОБЫТИЯ ===
elements.search.addEventListener('input', (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchQuery = e.target.value.trim();
    currentPage = 1;
    loadAnimals();
  }, 400);
});

elements.refresh.addEventListener('click', () => {
  elements.refresh.force = true;
  currentPage = 1;
  loadAnimals();
});

elements.prev.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    loadAnimals();
  }
});

elements.next.addEventListener('click', () => {
  currentPage++;
  loadAnimals();
});

// Первоначальная загрузка
loadAnimals();