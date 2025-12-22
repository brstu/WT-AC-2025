const API_BASE = "https://jsonplaceholder.typicode.com";
const PAGE_SIZE = 10;

const memoryCache = new Map();
const TTL_MS = 60_000;

let currentAbort = null;
let currentQuery = "";
let currentPage = 1;

// Debounce helper
function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

async function fetchWithRetry(url, { retries = 2, backoffMs = 300, timeoutMs = 5000, signal } = {}) {
  let attempt = 0;
  let lastErr;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const onAbort = () => controller.abort();
    if (signal) signal.addEventListener("abort", onAbort);

    try {
      const resp = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", onAbort);

      if (!resp.ok) {
        if (resp.status >= 500 && attempt < retries) {
          await new Promise(r => setTimeout(r, backoffMs * Math.pow(2, attempt)));
          attempt++;
          continue;
        }
        throw new Error(`HTTP ${resp.status}`);
      }
      const data = await resp.json();
      return { data, resp };
    } catch (err) {
      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", onAbort);

      if (err.name === "AbortError") throw err;

      lastErr = err;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, backoffMs * Math.pow(2, attempt)));
        attempt++;
        continue;
      }
      throw lastErr;
    }
  }
}

function getCache(key) {
  const inMem = memoryCache.get(key);
  if (inMem && inMem.expiresAt > Date.now()) return inMem.data;

  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt > Date.now()) {
      memoryCache.set(key, parsed);
      return parsed.data;
    }
    localStorage.removeItem(key);
  } catch {}
  return null;
}

function setCache(key, data, ttlMs = TTL_MS) {
  const entry = { data, expiresAt: Date.now() + ttlMs };
  memoryCache.set(key, entry);
  localStorage.setItem(key, JSON.stringify(entry));
}

function invalidateCache(key) {
  memoryCache.delete(key);
  localStorage.removeItem(key);
}

const elStatus = document.getElementById("status");
const elList = document.getElementById("list");
const elPrev = document.getElementById("prev");
const elNext = document.getElementById("next");
const elPage = document.getElementById("page-indicator");
const elSearch = document.getElementById("q");
const elRefresh = document.getElementById("refresh-btn");

function setStatus(cls, text = "") {
  elStatus.className = `status ${cls || ""}`;
  elStatus.textContent = text;
}

function renderSkeleton(count = PAGE_SIZE) {
  elList.innerHTML = Array.from({ length: count }, () => `<div class="skeleton"></div>`).join("");
}

function renderEmpty(message = "Ничего не найдено") {
  elList.innerHTML = `<div class="empty">${message}</div>`;
}

function renderError(err) {
  setStatus("error", `Ошибка: ${err.message || err}`);
}

function renderList(items = []) {
  if (!items.length) {
    renderEmpty();
    return;
  }
  const html = items.map(item => {
    const title = item.title || item.name || `Станция #${item.id}`;
    const meta = `ID: ${item.id}`;
    return `
<article class="card" aria-label="${title}">
  <h3>${escapeHtml(title)}</h3>
  <div class="meta">${escapeHtml(meta)}</div>
</article>`;
  }).join("");
  elList.innerHTML = html;
}

function escapeHtml(str) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  return String(str).replace(/[&<>"']/g, s => map[s]);
}

function updatePagination(total, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  elPrev.disabled = page <= 1;
  elNext.disabled = page >= totalPages;
  elPage.textContent = `Стр. ${page} / ${totalPages}`;
}

async function loadStations({ query = "", page = 1, ignoreCache = false, externalAbort } = {}) {
  if (currentAbort) currentAbort.abort();
  const abort = new AbortController();
  currentAbort = abort;
  if (externalAbort) {
    externalAbort.addEventListener("abort", () => abort.abort());
  }

  currentQuery = query;
  currentPage = page;

  const cacheKey = "stations:v1";
  const url = `${API_BASE}/posts`;

  try {
    setStatus(ignoreCache ? "refreshing" : "loading", "");
    renderSkeleton();

    let data = !ignoreCache ? getCache(cacheKey) : null;

    if (!data) {
      const { data: payload, resp } = await fetchWithRetry(url, {
        retries: 2,
        backoffMs: 300,
        timeoutMs: 5000,
        signal: abort.signal
      });
      data = payload;
      setCache(cacheKey, data, TTL_MS);
      console.log("Network fetch", { status: resp.status, fromNetwork: true });
    } else {
      console.log("From cache", { cached: true });
    }

    const q = query.trim().toLowerCase();
    const filtered = q ? data.filter(item => String(item.title || item.name || "").toLowerCase().includes(q)) : data;

    const total = filtered.length;
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    renderList(pageItems);
    updatePagination(total, page, PAGE_SIZE);
    setStatus("", total ? `${total} результатов` : "Нет результатов");
  } catch (err) {
    if (err.name === "AbortError") return;
    renderError(err);
    renderEmpty("Не удалось загрузить данные");
  }
}

const debouncedSearch = debounce(() => {
  loadStations({ query: elSearch.value, page: 1 });
}, 300);

elSearch.addEventListener("input", debouncedSearch);

elPrev.addEventListener("click", () => {
  if (currentPage > 1) loadStations({ query: currentQuery, page: currentPage - 1 });
});

elNext.addEventListener("click", () => {
  loadStations({ query: currentQuery, page: currentPage + 1 });
});

elRefresh.addEventListener("click", () => {
  loadStations({ query: currentQuery, page: 1, ignoreCache: true }).then(() => {
  });
});

loadStations({ query: "", page: 1 });
