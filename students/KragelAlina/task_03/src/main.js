class HttpCache {
  constructor(ttlMs = 5 * 60 * 1000) {
    this.data = new Map();
    this.etags = new Map();
    this.ttl = ttlMs;
  }
  get(url) {
    const item = this.data.get(url);
    if (!item || Date.now() - item.timestamp > this.ttl) return null;
    return { data: item.data, etag: this.etags.get(url) || null };
  }
  set(url, response, data) {
    this.data.set(url, { data, timestamp: Date.now() });
    const etag = response.headers.get("ETag");
    if (etag) this.etags.set(url, etag);
  }
  updateTimestamp(url) {
    const item = this.data.get(url);
    if (item) this.data.set(url, { ...item, timestamp: Date.now() });
  }
  getRequestHeaders(url) {
    const etag = this.etags.get(url);
    return etag ? { "If-None-Match": etag } : {};
  }
}

const cache = new HttpCache(5 * 60 * 1000);

async function fetchWithRetry(url, options = {}) {
  const { retries = 3, backoffMs = 800, timeoutMs = 12000, signal } = options;
  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    signal?.addEventListener("abort", () => controller.abort(), { once: true });
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: { "Accept": "application/vnd.github.v3+json", ...options.headers }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") throw err;
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, backoffMs * Math.pow(2, i)));
    }
  }
}

const els = {
  search: document.getElementById("search"),
  language: document.getElementById("language"),
  refresh: document.getElementById("refresh"),
  repos: document.getElementById("repos"),
  skeleton: document.getElementById("skeleton"),
  status: document.getElementById("status"),
  container: document.querySelector(".container")
};

let currentQuery = "", currentLang = "", currentPage = 1, isLoading = false, hasMore = true, abortController = null;

const sentinel = document.createElement("div");
sentinel.style.height = "20px";
els.container.appendChild(sentinel);
const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && hasMore && !isLoading) {
    currentPage++;
    loadRepos({ append: true });
  }
}, { rootMargin: "400px" });
observer.observe(sentinel);

function buildUrl() {
  const perPage = 15;
  let q = "stars:>10000";
  if (currentLang) q += `+language:${encodeURIComponent(currentLang)}`;
  if (currentQuery) q += `+${encodeURIComponent(currentQuery)} in:name,description`;
  return `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&page=${currentPage}&per_page=${perPage}`;
}

async function loadRepos({ append = false, forceRefresh = false } = {}) {
  if (isLoading) return;
  isLoading = true;
  if (abortController) abortController.abort();
  abortController = new AbortController();

  const url = buildUrl();
  const cached = !forceRefresh && cache.get(url);

  if (!append) { els.repos.innerHTML = ""; showSkeleton(); }
  setStatus("Загрузка...", "warning");

  try {
    let data, source = "";
    if (cached) {
      data = cached.data;
      source = "Из кэша";
    } else {
      const response = await fetchWithRetry(url, {
        signal: abortController.signal,
        headers: cache.getRequestHeaders(url)
      });
      if (response.status === 304) {
        data = cache.get(url).data;
        cache.updateTimestamp(url);
        source = "304 Not Modified";
      } else if (response.ok) {
        data = await response.json();
        cache.set(url, response, data);
        source = "200 OK"; 
      } else throw new Error(`HTTP ${response.status}`);
    }
    
    const statusType = source.includes("200") || source.includes("304") || source.includes("кэша") ? "success" : "warning";
    setStatus(source, statusType);
    
    if (!data.items || data.items.length === 0) {
      hasMore = false;
      if (!append) els.repos.innerHTML = "<p class='empty-state'>Ничего не найдено</p>";
      return;
    }
    renderRepos(data.items, append);
    hasMore = data.items.length === 15;
    
    // if (source.includes("304") || source.includes("кэша")) setTimeout(() => setStatus(""), 2500); 

  } catch (err) {
    if (err.name !== "AbortError") {
      console.error(err);
      setStatus(`Ошибка: ${err.message}`, "error"); // Установили тип 'error'
      if (!append) els.repos.innerHTML = `<p class='error-state'>${err.message}</p>`;
      hasMore = false;
    }
  } finally {
    hideSkeleton();
    isLoading = false;
  }
}

function renderRepos(repos, append) {
  const html = repos.map(r => `
    <div class="repo-card">
      <h3><a href="${r.html_url}" target="_blank" rel="noopener">${escapeHtml(r.name)}</a></h3>
      <p class="description">${r.description ? escapeHtml(r.description) : "<em>Нет описания</em>"}</p>
      <div class="stats">
        ${r.stargazers_count.toLocaleString()} stars | 
        ${r.forks_count.toLocaleString()} forks | 
        ${r.language ? `<strong>${r.language}</strong>` : ""}
      </div>
    </div>`).join("");
  append ? els.repos.insertAdjacentHTML("beforeend", html) : els.repos.innerHTML = html;
}

function escapeHtml(t) {
  const div = document.createElement("div");
  div.textContent = t;
  return div.innerHTML;
}

function showSkeleton() { els.skeleton.style.display = "grid"; }
function hideSkeleton() { els.skeleton.style.display = "none"; }

function setStatus(text, type = '') {
  els.status.textContent = text;
  els.status.className = '';
  if (text) {
    if (type === 'success') {
      els.status.classList.add('success-status');
    } else if (type === 'error') {
      els.status.classList.add('error-status');
    } else {
      els.status.classList.add('warning-status');
    }
  }
}

function debounce(fn, delay) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), delay); };
}

const resetAndLoad = () => { currentPage = 1; hasMore = true; loadRepos(); };
const debouncedResetAndLoad = debounce(resetAndLoad, 400);

els.search.addEventListener("input", e => { currentQuery = e.target.value.trim(); debouncedResetAndLoad(); });
els.language.addEventListener("change", e => { currentLang = e.target.value; debouncedResetAndLoad(); });
els.refresh.addEventListener("click", () => { currentPage = 1; hasMore = true; loadRepos({ forceRefresh: true }); });

loadRepos();