// ===== Config =====
const API_BASE = 'https://registry.npmjs.org/-/v1/search';
const PAGE_SIZE = 10; // 10–20 поддерживается; выбрано 10 для компактности
const CACHE_TTL_MS = 60 * 1000; // 1 минута

// ===== DOM =====
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');
const loader = document.getElementById('loader');
const retryLoader = document.getElementById('retryLoader');
const errorBox = document.getElementById('errorBox');
const emptyBox = document.getElementById('emptyBox');
const resultsList = document.getElementById('resultsList');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

// ===== State =====
let state = {
  query: 'react',
  page: 1,
  total: 0,
  abortController: null,
  isRefreshing: false,
};

const memoryCache = new Map(); // key -> { data, expiresAt }

// ===== Utilities =====

// fetch with retry, backoff, timeout, abort support
async function fetchWithRetry(url, { retries = 2, backoffMs = 500, timeoutMs = 8000, signal, onRetry } = {}) {
  let attempt = 0;
  while (true) {
    attempt++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const composite = combineSignals(signal, controller.signal);

    try {
      const res = await fetch(url, { signal: composite });
      clearTimeout(timeoutId);

      if (!res.ok) {
        // non-2xx is considered retryable up to retries
        if (attempt <= retries) {
          onRetry?.(attempt);
          await delay(backoffMs * attempt);
          continue;
        }
      }
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      // AbortError or network error -> retry if allowed
      const isAbort = err.name === 'AbortError';
      if (isAbort) {
        // if explicitly aborted by outer signal, bubble up
        if (signal?.aborted) throw err;
      }
      if (attempt <= retries) {
        onRetry?.(attempt);
        await delay(backoffMs * attempt);
        continue;
      }
      throw err;
    }
  }
}

// combine multiple abort signals
function combineSignals(signalA, signalB) {
  if (!signalA && !signalB) return undefined;
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signalA?.addEventListener('abort', onAbort);
  signalB?.addEventListener('abort', onAbort);
  return controller.signal;
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function cacheKey(query, page, size) {
  return `npm:${query.trim().toLowerCase()}:${page}:${size}`;
}

function getFromCache(key) {
  // In-memory first
  const mem = memoryCache.get(key);
  if (mem && mem.expiresAt > Date.now()) return mem.data;

  // localStorage fallback
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt > Date.now()) {
      // rehydrate into memory
      memoryCache.set(key, parsed);
      return parsed.data;
    } else {
      localStorage.removeItem(key);
    }
  } catch {}
  return null;
}

function putToCache(key, data) {
  const payload = { data, expiresAt: Date.now() + CACHE_TTL_MS };
  memoryCache.set(key, payload);
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {}
}

// ===== Rendering =====

function setLoading(isLoading) {
  if (isLoading) {
    loader.classList.remove('hidden');
    resultsList.classList.add('skeleton-active');
    errorBox.classList.add('hidden');
    emptyBox.classList.add('hidden');
  } else {
    loader.classList.add('hidden');
    resultsList.classList.remove('skeleton-active');
  }
}

function setRetrying(isRetrying) {
  retryLoader.classList.toggle('hidden', !isRetrying);
}

function setError(message) {
  if (!message) {
    errorBox.classList.add('hidden');
    errorBox.textContent = '';
    return;
  }
  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
}

function setEmpty(isEmpty) {
  emptyBox.classList.toggle('hidden', !isEmpty);
}

function renderResults(items) {
  resultsList.innerHTML = '';
  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'card';
    const name = item.package?.name ?? 'Без названия';
    const desc = item.package?.description ?? '—';
    const link = item.package?.links?.npm ?? `https://www.npmjs.com/package/${encodeURIComponent(name)}`;
    const version = item.package?.version ?? 'n/a';
    const date = item.package?.date ? new Date(item.package.date).toLocaleString() : 'n/a';

    li.innerHTML = `
      <h3><a href="${link}" target="_blank" rel="noopener">${name}</a></h3>
      <p>${escapeHtml(desc)}</p>
      <div class="meta">
        <span>Версия: ${version}</span>
        <span>Обновлено: ${date}</span>
      </div>
    `;
    resultsList.appendChild(li);
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function updatePagination(totalCount) {
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  prevPageBtn.disabled = state.page <= 1;
  nextPageBtn.disabled = state.page >= totalPages;
  pageInfo.textContent = `Стр. ${state.page} из ${totalPages}`;
}

// ===== Data flow =====

async function searchAndRender({ ignoreCache = false } = {}) {
  // cancel previous in-flight
  if (state.abortController) {
    state.abortController.abort();
  }
  const abortController = new AbortController();
  state.abortController = abortController;

  const key = cacheKey(state.query, state.page, PAGE_SIZE);
  const cached = !ignoreCache ? getFromCache(key) : null;

  setError(null);
  setEmpty(false);
  setLoading(true);
  setRetrying(false);

  try {
    if (cached) {
      // render cached fast
      renderResults(cached.objects);
      updatePagination(cached.total);
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({
      text: state.query,
      size: String(PAGE_SIZE),
      from: String((state.page - 1) * PAGE_SIZE),
    });
    const url = `${API_BASE}?${params.toString()}`;

    let retryAttempted = false;
    const res = await fetchWithRetry(url, {
      retries: 2,
      backoffMs: 600,
      timeoutMs: 7000,
      signal: abortController.signal,
      onRetry: () => {
        retryAttempted = true;
        setRetrying(true);
      },
    });
    if (retryAttempted) setRetrying(false);

    // For demo: show cache vs network behavior via headers if needed in README
    const data = await res.json();
    putToCache(key, data);

    const items = data.objects ?? [];
    renderResults(items);
    setEmpty(items.length === 0);
    updatePagination(data.total ?? items.length);
  } catch (err) {
    if (err.name === 'AbortError') {
      // Silently ignore if superseded by a new request
      return;
    }
    setError(`Ошибка загрузки: ${err.message}`);
    setEmpty(true);
  } finally {
    setLoading(false);
    setRetrying(false);
  }
}

// ===== Events =====

searchInput.addEventListener('input', debounce((e) => {
  const q = e.target.value.trim();
  state.query = q || 'react'; // default seed query to avoid empty
  state.page = 1;
  searchAndRender();
}, 300));

refreshBtn.addEventListener('click', () => {
  state.isRefreshing = true;
  searchAndRender({ ignoreCache: true }).finally(() => {
    state.isRefreshing = false;
  });
});

prevPageBtn.addEventListener('click', () => {
  if (state.page > 1) {
    state.page -= 1;
    searchAndRender();
  }
});
nextPageBtn.addEventListener('click', () => {
  state.page += 1;
  searchAndRender();
});

// Debounce helper to avoid excessive requests while typing
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// Initial load
searchAndRender();
