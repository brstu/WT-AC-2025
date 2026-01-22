// ===== Константы =====
const API_BASE = "https://jsonplaceholder.typicode.com/photos";
const PAGE_SIZE = 10;
const CACHE_TTL = 60_000; // 60 секунд

// ===== DOM =====
const listEl = document.getElementById("list");
const statusEl = document.getElementById("status");
const pageInfoEl = document.getElementById("pageInfo");
const searchInput = document.getElementById("searchInput");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const refreshBtn = document.getElementById("refreshBtn");

// ===== Состояние =====
let page = 1;
let query = "";
let abortController = null;

// in-memory cache
const cache = new Map();

// ===== Fetch с retry + timeout =====
async function fetchWithRetry(url, { retries = 2, backoffMs = 500, timeoutMs = 4000 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      clearTimeout(id);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, backoffMs));
    }
  }
}

// ===== Кэш =====
function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expire) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data) {
  cache.set(key, {
    data,
    expire: Date.now() + CACHE_TTL
  });
}

// ===== Загрузка =====
async function loadData({ ignoreCache = false } = {}) {
  // отмена предыдущего запроса
  if (abortController) abortController.abort();
  abortController = new AbortController();

  const start = (page - 1) * PAGE_SIZE;
  const url = `${API_BASE}?_start=${start}&_limit=${PAGE_SIZE}`;

  const cacheKey = `${url}|q=${query}`;

  statusEl.textContent = "Загрузка...";
  listEl.innerHTML = "";

  try {
    let data;

    if (!ignoreCache) {
      data = getCached(cacheKey);
    }

    if (!data) {
      const raw = await fetchWithRetry(url);
      data = query
        ? raw.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase())
          )
        : raw;

      setCached(cacheKey, data);
    }

    if (data.length === 0) {
      statusEl.textContent = "Ничего не найдено";
      return;
    }

    render(data);
    statusEl.textContent = "Готово";
  } catch (err) {
    if (err.name === "AbortError") {
      statusEl.textContent = "Запрос отменён";
      return;
    }
    statusEl.textContent = "Ошибка загрузки данных";
    console.error(err);
  }
}

// ===== Рендер =====
function render(items) {
  listEl.innerHTML = "";
  items.forEach(item => {
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `
      <strong>${item.title}</strong><br/>
      <small>ID картины: ${item.id}</small>
    `;
    listEl.appendChild(li);
  });

  pageInfoEl.textContent = `Страница ${page}`;
}

// ===== События =====
searchInput.addEventListener("input", e => {
  query = e.target.value;
  page = 1;
  loadData();
});

prevBtn.addEventListener("click", () => {
  if (page > 1) {
    page--;
    loadData();
  }
});

nextBtn.addEventListener("click", () => {
  page++;
  loadData();
});

refreshBtn.addEventListener("click", () => {
  loadData({ ignoreCache: true });
});

// ===== Старт =====
loadData();
