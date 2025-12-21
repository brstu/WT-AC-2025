const API_URL = './places.json'; 
const CACHE_TTL_MS = 5 * 60 * 1000;
const PAGE_SIZE = 9; 
const SEARCH_DEBOUNCE_MS = 300;

const SIMULATE_NETWORK_MS = 550; 

const listEl = document.getElementById('list');
const messageBoxEl = document.getElementById('messageBox');
const statusLineEl = document.getElementById('statusLine');
const cacheLineEl = document.getElementById('cacheLine');
const resultInfoEl = document.getElementById('resultInfo');

const searchInput = document.getElementById('searchInput');
const regionSelect = document.getElementById('regionSelect');
const typeSelect = document.getElementById('typeSelect');
const budgetSelect = document.getElementById('budgetSelect');

const refreshBtn = document.getElementById('refreshBtn');
const refreshSpinner = document.getElementById('refreshSpinner');
const clearCacheBtn = document.getElementById('clearCacheBtn');

const ignoreCacheCheck = document.getElementById('ignoreCacheCheck');
const simulateFailCheck = document.getElementById('simulateFailCheck');

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pagesEl = document.getElementById('pages');

const cardTpl = document.getElementById('cardTpl');
const skeletonTpl = document.getElementById('skeletonTpl');

const memoryCache = new Map(); 
let activeController = null; 
let debounceTimer = null;

const state = {
  query: '',
  region: '',
  type: '',
  budget: '',
  page: 1,
  lastData: [],
  lastCacheInfo: '—'
};

const failCounterByKey = new Map();

function setStatus(text, kind = 'ok') {
  statusLineEl.textContent = text;
  statusLineEl.classList.remove('ok', 'err');
  statusLineEl.classList.add(kind === 'err' ? 'err' : 'ok');
}

function showMessage(text, kind) {
  messageBoxEl.textContent = text;
  messageBoxEl.classList.remove('hidden', 'error', 'empty');
  messageBoxEl.classList.add(kind === 'error' ? 'error' : 'empty');
}

function hideMessage() {
  messageBoxEl.classList.add('hidden');
}

function setRefreshing(isRefreshing) {
  refreshBtn.disabled = isRefreshing;
  refreshSpinner.classList.toggle('hidden', !isRefreshing);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function sleep(ms, signal) {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(t);
          reject(new DOMException('Aborted', 'AbortError'));
        },
        { once: true },
      );
    }
  });
}

function makeCacheKey(url) {
  return `v27:places:${url}`;
}

function getFromMemory(key) {
  const hit = memoryCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return { data: hit.data, source: 'memory', expiresAt: hit.expiresAt };
}

function getFromLocalStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return { data: parsed.data, source: 'localStorage', expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
}

function setToCache(key, data, ttlMs) {
  const expiresAt = Date.now() + ttlMs;
  memoryCache.set(key, { data, expiresAt });
  try {
    localStorage.setItem(key, JSON.stringify({ data, expiresAt }));
  } catch {
  }
  return expiresAt;
}

function clearAllCache() {
  memoryCache.clear();
  const prefix = 'v27:places:';
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) keysToRemove.push(k);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

async function fetchWithRetry(url, { retries, backoffMs, timeoutMs, signal, fetchOptions = {} }) {
  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    attempt++;

    const attemptController = new AbortController();
    const onAbort = () => attemptController.abort(signal?.reason ?? undefined);
    if (signal) signal.addEventListener('abort', onAbort, { once: true });

    const timeoutId = setTimeout(() => {
      attemptController.abort(new DOMException('Timeout', 'TimeoutError'));
    }, timeoutMs);

    try {
      await sleep(SIMULATE_NETWORK_MS, attemptController.signal);

      const res = await fetch(url, {
        ...fetchOptions,
        signal: attemptController.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', onAbort);

      if (err?.name === 'AbortError' || err?.name === 'TimeoutError') throw err;

      lastError = err;

      if (attempt > retries) break;

      const delay = backoffMs * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * 120);
      await sleep(delay + jitter, signal);
    } finally {
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', onAbort);
    }
  }

  throw lastError ?? new Error('Unknown fetch error');
}

async function loadPlaces({ query, ignoreCache, signal }) {
  const url = `${API_URL}?q=${encodeURIComponent(query ?? '')}`;

  const key = makeCacheKey(url);
  if (!ignoreCache) {
    const mem = getFromMemory(key);
    if (mem) return { data: mem.data, cache: `memory (TTL до ${new Date(mem.expiresAt).toLocaleTimeString()})`, url };

    const ls = getFromLocalStorage(key);
    if (ls) {
      memoryCache.set(key, { data: ls.data, expiresAt: ls.expiresAt });
      return { data: ls.data, cache: `localStorage (TTL до ${new Date(ls.expiresAt).toLocaleTimeString()})`, url };
    }
  }

  if (simulateFailCheck.checked) {
    const c = failCounterByKey.get(key) ?? 0;
    if (c < 2) {
      failCounterByKey.set(key, c + 1);
      throw new Error('Simulated network error (dev)');
    } else {
      failCounterByKey.delete(key);
    }
  }

  const res = await fetchWithRetry(url, {
    retries: 2,
    backoffMs: 250,
    timeoutMs: 2500,
    signal,
    fetchOptions: {
      cache: ignoreCache ? 'no-store' : 'default',
    },
  });

  const json = await res.json();
  const expiresAt = setToCache(key, json, CACHE_TTL_MS);
  return { data: json, cache: `network → cached (TTL до ${new Date(expiresAt).toLocaleTimeString()})`, url };
}

function applyFilters(items) {
  const q = state.query.trim().toLowerCase();
  const region = state.region;
  const type = state.type;
  const budget = state.budget;

  return items.filter((p) => {
    const hay = `${p.name} ${p.country} ${p.region} ${p.type} ${p.budget} ${(p.tags || []).join(' ')}`.toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (region && p.region !== region) return false;
    if (type && p.type !== type) return false;
    if (budget && p.budget !== budget) return false;
    return true;
  });
}

function paginate(items) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(state.page, totalPages);
  state.page = page;

  const start = (page - 1) * PAGE_SIZE;
  const slice = items.slice(start, start + PAGE_SIZE);

  return { slice, total, totalPages, page };
}

function renderSkeleton(count = PAGE_SIZE) {
  listEl.innerHTML = '';
  for (let i = 0; i < count; i++) {
    listEl.appendChild(skeletonTpl.content.cloneNode(true));
  }
}

function renderList(items) {
  listEl.innerHTML = '';

  const filtered = applyFilters(items);
  const { slice, total, totalPages, page } = paginate(filtered);

  if (total === 0) {
    showMessage('Ничего не найдено. Попробуй изменить поиск или фильтры.', 'empty');
  } else {
    hideMessage();
  }

  for (const p of slice) {
    const node = cardTpl.content.cloneNode(true);
    node.querySelector('.card-title').textContent = p.name;
    node.querySelector('.pill').textContent = `${p.type} • ${p.budget}`;
    node.querySelector('.card-sub').textContent = `${p.country} • ${p.region} • сезон: ${p.season}`;
    node.querySelector('.card-desc').textContent = p.description;

    const tagsEl = node.querySelector('.tags');
    (p.tags || []).slice(0, 6).forEach((t) => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = `#${t}`;
      tagsEl.appendChild(span);
    });

    listEl.appendChild(node);
  }

  resultInfoEl.textContent = `Показано ${slice.length} из ${total} (страница ${page}/${totalPages})`;

  prevBtn.disabled = page <= 1;
  nextBtn.disabled = page >= totalPages;

  pagesEl.innerHTML = '';
  const maxButtons = 7;
  const start = Math.max(1, page - Math.floor(maxButtons / 2));
  const end = Math.min(totalPages, start + maxButtons - 1);

  for (let p = start; p <= end; p++) {
    const b = document.createElement('button');
    b.className = 'page' + (p === page ? ' active' : '');
    b.textContent = String(p);
    b.addEventListener('click', () => {
      state.page = p;
      renderList(state.lastData);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pagesEl.appendChild(b);
  }
}

function updateCacheLine(text) {
  cacheLineEl.textContent = `Cache: ${text}`;
}

async function runLoad({ reason, ignoreCache }) {
  if (activeController) {
    activeController.abort(new DOMException('New request started', 'AbortError'));
  }
  activeController = new AbortController();

  const signal = activeController.signal;

  try {
    setStatus(reason === 'refresh' ? 'Обновляем…' : 'Загружаем…', 'ok');
    if (reason === 'refresh') setRefreshing(true);

    renderSkeleton();

    const { data, cache, url } = await loadPlaces({
      query: state.query,
      ignoreCache,
      signal,
    });

    state.lastData = Array.isArray(data) ? data : [];
    state.lastCacheInfo = cache;
    updateCacheLine(`${cache} (url: ${escapeHtml(url)})`);

    setStatus('Готово', 'ok');
    renderList(state.lastData);
  } catch (err) {
    if (err?.name === 'AbortError') {
      setStatus('Запрос отменён (новый поиск/запрос)', 'ok');
      return;
    }

    console.error(err);
    setStatus('Ошибка загрузки', 'err');
    updateCacheLine('—');

    showMessage(
      `Ошибка: ${err?.name === 'TimeoutError' ? 'таймаут запроса' : (err?.message || 'неизвестно')}. ` +
        `Проверь Network/Console. Можно нажать "Обновить".`,
      'error',
    );

    listEl.innerHTML = '';
  } finally {
    if (reason === 'refresh') setRefreshing(false);
  }
}

function scheduleSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    state.page = 1;
    runLoad({ reason: 'search', ignoreCache: ignoreCacheCheck.checked });
  }, SEARCH_DEBOUNCE_MS);
}

searchInput.addEventListener('input', (e) => {
  state.query = e.target.value ?? '';
  scheduleSearch();
});

regionSelect.addEventListener('change', (e) => {
  state.region = e.target.value;
  state.page = 1;
  scheduleSearch();
});

typeSelect.addEventListener('change', (e) => {
  state.type = e.target.value;
  state.page = 1;
  scheduleSearch();
});

budgetSelect.addEventListener('change', (e) => {
  state.budget = e.target.value;
  state.page = 1;
  scheduleSearch();
});

refreshBtn.addEventListener('click', () => {
  runLoad({ reason: 'refresh', ignoreCache: true });
});

clearCacheBtn.addEventListener('click', () => {
  clearAllCache();
  updateCacheLine('очищено');
  setStatus('Кэш очищен', 'ok');
});

prevBtn.addEventListener('click', () => {
  state.page = Math.max(1, state.page - 1);
  renderList(state.lastData);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

nextBtn.addEventListener('click', () => {
  state.page = state.page + 1;
  renderList(state.lastData);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

(function init() {
  setStatus('Старт…', 'ok');
  updateCacheLine('—');
  runLoad({ reason: 'init', ignoreCache: false });
})();
