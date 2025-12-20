const API_URL = "https://api.stackexchange.com/2.3/questions";
const TTL = 60_000; 
const cache = new Map();

let currentPage = 1;
let currentTag = "";
let abortController = null;
const TOTAL_PAGES = 20;

const listEl = document.getElementById("list");
const skeletonEl = document.getElementById("skeleton");
const errorEl = document.getElementById("error");
const tagEl = document.getElementById("tag");
const refreshBtn = document.getElementById("refresh");
const paginationEl = document.getElementById("pagination");

const popularTags = ["javascript", "python", "html", "css", "reactjs", "node.js", "java", "c#", "php"];

function getRandomTag() {
  return popularTags[Math.floor(Math.random() * popularTags.length)];
}

async function fetchWithRetry(url, { retries = 3, timeoutMs = 5000, signal } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, { signal: signal || controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw { type: "network", message: `HTTP ${response.status}` };

      const data = await response.json();
      if (!data.items || data.items.length === 0) throw { type: "business", message: "Нет вопросов по этому тегу" };

      return data.items;
    } catch (err) {
      if (err.name === "AbortError") throw err;
      if (attempt === retries) throw err;
      await new Promise(res => setTimeout(res, 300 * 2 ** attempt));
    }
  }
}

function showSkeleton(visible) {
  skeletonEl.innerHTML = "";
  skeletonEl.style.display = visible ? "flex" : "none";
  if (!visible) return;

  for (let i = 0; i < 5; i++) {
    const div = document.createElement("div");
    div.className = "skeleton-item";
    skeletonEl.appendChild(div);
  }
}

function showError(msg, color = "red") {
  errorEl.textContent = msg || "";
  errorEl.classList.remove("red", "orange");
  if (msg) errorEl.classList.add(color);
}

function renderData(items, append = false) {
  if (!append) listEl.innerHTML = "";
  items.forEach(q => {
    const li = document.createElement("li");
    li.innerHTML = `
      <a href="${q.link}" target="_blank">${q.title}</a>
      <div class="tags">${q.tags.map(t => `<span>${t}</span>`).join("")}</div>
    `;
    listEl.appendChild(li);
  });
  renderPagination();
}

function renderPagination() {
  paginationEl.innerHTML = "";
  const delta = 2;
  const start = Math.max(1, currentPage - delta);
  const end = Math.min(TOTAL_PAGES, currentPage + delta);

  for (let i = start; i <= end; i++) {
    const btn = document.createElement("div");
    btn.className = "page-number" + (i === currentPage ? " active" : "");
    btn.textContent = i;
    btn.addEventListener("click", () => {
      if (i !== currentPage) {
        currentPage = i;
        loadData(true);
        window.scrollTo({ top: 0 });
      }
    });
    paginationEl.appendChild(btn);
  }
}

async function loadData(force = false, prefetch = false) {
  if (!currentTag) {
    renderData([]);
    showError("Введите тег для поиска", "orange");
    showSkeleton(false);
    return;
  }

  const key = `so?page=${currentPage}&tag=${currentTag}`;
  const now = Date.now();

  const cached = cache.get(key);
  if (cached && now - cached.time < TTL) {
    if (!prefetch) renderData(cached.data, false);
    console.log(`✅ Используем кэш`);
    return; 
  }

  if (!prefetch) {
    if (abortController) abortController.abort();
    abortController = new AbortController();
    showSkeleton(true);
    showError(null);
  }

  try {
    const url = `${API_URL}?order=desc&sort=activity&tagged=${encodeURIComponent(currentTag)}&site=stackoverflow&page=${currentPage}&pagesize=10`;
    const items = await fetchWithRetry(url, { signal: abortController?.signal });
    cache.set(key, { data: items, time: now });
    if (!prefetch) renderData(items, false);
  } catch (err) {
    if (err.name === "AbortError") return;
    if (!prefetch) {
      showError(err.message || "Сетевая ошибка", err.type === "business" ? "orange" : "red");
      renderData([], false);
    }
  } finally {
    if (!prefetch) showSkeleton(false);
  }
}

tagEl.addEventListener("input", () => {
  currentTag = tagEl.value.trim();
  currentPage = 1;
  loadData(true);
});

refreshBtn.addEventListener("click", () => loadData(true));

currentTag = getRandomTag();
tagEl.value = currentTag;
loadData();
