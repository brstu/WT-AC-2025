const API_URL = 'https://corsproxy.io/?https://xd-cods.github.io/movie-novelties-2025/a.json';

const MOVIES_PER_PAGE = 6;
const CACHE_KEY = 'movies_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

let currentAbortController = null;
let currentPage = 1;
let currentSearch = '';
let currentGenre = '';
let allMovies = [];

const elements = {
  grid: document.getElementById('movies-grid'),
  status: document.getElementById('status'),
  searchInput: document.getElementById('search-input'),
  genreFilter: document.getElementById('genre-filter'),
  prevBtn: document.getElementById('prev-page'),
  nextBtn: document.getElementById('next-page'),
  pageInfo: document.getElementById('page-info'),
  refreshBtn: document.getElementById('refresh-btn'),
};

async function fetchWithRetry(
  url,
  { retries = 3, backoffMs = 1000, timeoutMs = 8000, signal } = {}
) {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const currentSignal = signal || controller.signal;

    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: currentSignal,
        headers: { 'Cache-Control': 'no-cache' },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') throw err;
      lastError = err;

      if (i < retries) {
        const delay = backoffMs * Math.pow(2, i);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }
  throw lastError;
}

function getCachedData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  } catch (_) {}
  return null;
}

function setCachedData(data) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (e) {
    console.warn('Не удалось сохранить кэш', e);
  }
}

function clearCache() {
  localStorage.removeItem(CACHE_KEY);
}

function showLoading() {
  elements.status.textContent = 'Загрузка...';
  elements.status.className = 'status loading';
  elements.status.classList.remove('hidden');
  elements.grid.innerHTML = Array(8)
    .fill()
    .map(
      () => `
    <div class="movie-card skeleton">
      <div class="skeleton skeleton-poster"></div>
      <div class="movie-info">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
      </div>
    </div>
  `
    )
    .join('');
}

function showError(msg = 'Ошибка загрузки') {
  elements.status.innerHTML = `${msg}<br><button id="retry-btn" style="margin-top:8px;padding:8px 16px;">Повторить</button>`;
  elements.status.className = 'status';
  elements.status.classList.remove('hidden');
  elements.grid.innerHTML = '';

  document.getElementById('retry-btn')?.addEventListener('click', loadMovies);
}

function showEmpty() {
  elements.status.textContent = 'Ничего не найдено';
  elements.status.className = 'status empty';
  elements.status.classList.remove('hidden');
  elements.grid.innerHTML = '';
}

function hideStatus() {
  elements.status.classList.add('hidden');
}

// Рендер фильмов
function renderMovies(movies) {
  if (movies.length === 0) {
    showEmpty();
    return;
  }

  hideStatus();
  elements.grid.innerHTML = movies
    .map(
      (movie) => `
    <article class="movie-card">
      <img src="${movie.poster || 'https://via.placeholder.com/300x450/16213e/ffffff?text=' + encodeURIComponent(movie.title)}" 
          alt="${movie.title}" class="movie-poster" loading="lazy">
      <div class="movie-info">
        <h3 class="movie-title">${movie.title}</h3>
        <div class="movie-genre">${movie.genres?.join(', ') || 'Не указан'}</div>
        <p class="movie-synopsis">${movie.synopsis || 'Описание отсутствует'}</p>
      </div>
    </article>
  `
    )
    .join('');
}

function updatePagination(total) {
  const totalPages = Math.ceil(total / MOVIES_PER_PAGE);
  elements.pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
  elements.prevBtn.disabled = currentPage === 1;
  elements.nextBtn.disabled = currentPage >= totalPages;
}

function getFilteredMovies() {
  let filtered = allMovies;

  if (currentSearch) {
    filtered = filtered.filter((m) => m.title.toLowerCase().includes(currentSearch.toLowerCase()));
  }

  if (currentGenre) {
    filtered = filtered.filter((m) => m.genres?.includes(currentGenre));
  }

  const start = (currentPage - 1) * MOVIES_PER_PAGE;
  const end = start + MOVIES_PER_PAGE;
  const pageMovies = filtered.slice(start, end);

  updatePagination(filtered.length);
  renderMovies(pageMovies);
}

function populateGenres() {
  elements.genreFilter.innerHTML = '<option value="">Все жанры</option>';
  const genres = new Set();
  allMovies.forEach((m) => m.genres?.forEach((g) => genres.add(g)));
  [...genres].sort().forEach((g) => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    elements.genreFilter.appendChild(opt);
  });
}

async function loadMovies(forceRefresh = false) {
  if (currentAbortController) currentAbortController.abort();
  currentAbortController = new AbortController();

  if (!forceRefresh) {
    const cached = getCachedData();
    if (cached) {
      allMovies = cached;
      populateGenres();
      getFilteredMovies();
      return;
    }
  }

  showLoading();
  elements.refreshBtn.classList.add('loading');

  try {
    const data = await fetchWithRetry(API_URL, {
      retries: 3,
      backoffMs: 800,
      timeoutMs: 10000,
      signal: currentAbortController.signal,
    });

    allMovies = Array.isArray(data) ? data : data.movies || [];
    setCachedData(allMovies);
    populateGenres();
    currentPage = 1;
    getFilteredMovies();
  } catch (err) {
    if (err.name === 'AbortError') return;
    showError('Не удалось загрузить фильмы. Проверьте интернет.');
  } finally {
    elements.refreshBtn.classList.remove('loading');
  }
}

elements.searchInput.addEventListener('input', (e) => {
  currentSearch = e.target.value.trim();
  currentPage = 1;
  getFilteredMovies();
});

elements.genreFilter.addEventListener('change', (e) => {
  currentGenre = e.target.value;
  currentPage = 1;
  getFilteredMovies();
});

elements.prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    getFilteredMovies();
  }
});

elements.nextBtn.addEventListener('click', () => {
  currentPage++;
  getFilteredMovies();
});

elements.refreshBtn.addEventListener('click', () => {
  clearCache();
  loadMovies(true);
});

loadMovies();
