const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const PAGE_SIZE = 5;
const CACHE_TTL = 60_000;

const list = document.getElementById('list');
const status = document.getElementById('status');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('game-filter');
const refreshBtn = document.getElementById('refresh-btn');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const pageInfo = document.getElementById('page-info');

let page = 1;
let controller = null;
let cache = new Map();
let ignoreCache = false;

/* ---------- fetchWithRetry ---------- */

async function fetchWithRetry(url, {
  retries = 2,
  backoffMs = 500,
  timeoutMs = 4000
} = {}) {
  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(res.status);
      return await res.json();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, backoffMs * (i + 1)));
    } finally {
      clearTimeout(timer);
    }
  }
}

/* ---------- helpers ---------- */

function getGame(id) {
  if (id % 3 === 0) return 'CS';
  if (id % 3 === 1) return 'Dota';
  return 'LoL';
}

function tournamentTitle(id, game) {
  return `${game} Championship ${2024 + (id % 2)}`;
}

function tournamentDescription(game) {
  if (game === 'CS')
    return 'Крупный международный турнир по Counter-Strike с участием сильнейших команд мира.';
  if (game === 'Dota')
    return 'Престижный турнир по Dota 2 с многомиллионным призовым фондом.';
  return 'Профессиональный турнир по League of Legends на мировой арене.';
}

function getCached(key) {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.exp) return null;
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, {
    data,
    exp: Date.now() + CACHE_TTL
  });
}

function renderSkeleton() {
  list.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const div = document.createElement('div');
    div.className = 'skeleton';
    list.appendChild(div);
  }
}

function render(items) {
  list.innerHTML = '';

  if (!items.length) {
    status.textContent = 'Турниры не найдены';
    return;
  }

  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'card';
    li.innerHTML = `
      <h3>${item.title}</h3>
      <small>${item.game}</small>
      <p>${item.description}</p>
    `;
    list.appendChild(li);
  });
}


async function load() {
  if (controller) controller.abort();
  controller = new AbortController();

  const query = searchInput.value.toLowerCase();
  const gameFilter = filterSelect.value;
  const cacheKey = `${query}|${gameFilter}|${page}`;

  status.textContent = '';
  renderSkeleton();

  try {
    let data = !ignoreCache ? getCached(cacheKey) : null;

    if (!data) {
      const raw = await fetchWithRetry(API_URL);
      data = raw.slice(0, 20).map(p => {
        const game = getGame(p.id);
        return {
          id: p.id,
          game,
          title: tournamentTitle(p.id, game),
          description: tournamentDescription(game)
        };
      });

      if (!ignoreCache) setCache(cacheKey, data);
    }

    let filtered = data.filter(t =>
      t.title.toLowerCase().includes(query) &&
      (!gameFilter || t.game === gameFilter)
    );

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
    page = Math.min(page, totalPages);

    render(filtered.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    ));

    pageInfo.textContent = `Страница ${page} из ${totalPages}`;
  } catch {
    status.textContent = 'Ошибка загрузки данных';
    list.innerHTML = '';
  } finally {
    ignoreCache = false;
  }
}

searchInput.addEventListener('input', () => {
  page = 1;
  load();
});

filterSelect.addEventListener('change', () => {
  page = 1;
  load();
});

refreshBtn.addEventListener('click', () => {
  ignoreCache = true;
  load();
});

prevBtn.addEventListener('click', () => {
  if (page > 1) {
    page--;
    load();
  }
});

nextBtn.addEventListener('click', () => {
  page++;
  load();
});

load();
