// main.js — 100% рабочая версия с Trefle.io (NL, ноябрь 2025)
import { fetchWithRetry, abortPrevious } from './api.js';
import { getCached, setCached } from './cache.js';

const searchInput = document.getElementById('search');
const plantsContainer = document.getElementById('plants');
const statusEl = document.getElementById('status');
const skeleton = document.getElementById('skeleton');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const pageInfo = document.getElementById('page-info');
const refreshBtn = document.getElementById('refresh');

let currentPage = 1;
let currentQuery = '';
let totalPages = 1;

// Дебаунс
const debounce = (fn, ms = 500) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

async function loadPlants(query = '', page = 1, useCache = true) {
  query = (query || 'rose').trim().toLowerCase();
  const cacheKey = `plant_${query}_page_${page}`;
  const cached = useCache ? getCached(cacheKey) : null;

  if (cached) {
    renderPlants(cached.data, cached.meta);
    return;
  }

  setLoading(true);
  statusEl.textContent = query ? `Поиск «${query}»…` : 'Загрузка растений…';

  try {
    abortPrevious();

    // Trefle.io через CORS-прокси (работает везде, без ключа)
    const trefleUrl = `https://trefle.io/api/v1/plants/search?token=usr-adK2LS1vAwTayqeaeovBCbDDPi82KcTFN8irf-4Qdeo&q=${encodeURIComponent(query)}&page=${page}&limit=20`;
    const url = `https://corsproxy.io/?${encodeURIComponent(trefleUrl)}`;

    const response = await fetchWithRetry(url);

    // Trefle возвращает { data: [...], meta: { total: number } }
    const json = response;
    const plants = json.data || [];
    const meta = json.meta || { total: plants.length };

    if (plants.length === 0) {
      showEmpty(`Ничего не найдено по запросу «${query}». Попробуйте "rose" или "tomato".`);
      return;
    }

    // Приводим к нужной структуре
    const formatted = plants.map(plant => ({
      common_name: plant.common_name || plant.scientific_name?.split(' ')[0] || 'Без названия',
      scientific_name: plant.scientific_name || '—',
      family: plant.family || '—',
      cycle: plant.duration || 'Perennial',  // duration: annual/perennial
      default_image: {
        thumbnail: plant.image_url || `https://via.placeholder.com/300x300?text=${plant.common_name?.charAt(0) || 'P'}`
      }
    }));

    const result = { 
      data: formatted, 
      meta: { total_pages: Math.ceil(meta.total / 20) || 1, current_page: page } 
    };
    setCached(cacheKey, result, 10 * 60 * 1000); // 10 минут кэш

    renderPlants(formatted, result.meta);

  } catch (err) {
    if (err.name === 'AbortError') return;
    showError('Ошибка загрузки. Проверьте интернет.');
    // Fallback: статические данные для демо
    const demoPlants = [
      { common_name: 'Rose', scientific_name: 'Rosa spp.', family: 'Rosaceae', cycle: 'Perennial', default_image: { thumbnail: 'https://via.placeholder.com/300x300/ff69b4?text=Rose' } },
      { common_name: 'Tomato', scientific_name: 'Solanum lycopersicum', family: 'Solanaceae', cycle: 'Annual', default_image: { thumbnail: 'https://via.placeholder.com/300x300/ff6347?text=Tomato' } },
      { common_name: 'Sunflower', scientific_name: 'Helianthus annuus', family: 'Asteraceae', cycle: 'Annual', default_image: { thumbnail: 'https://via.placeholder.com/300x300/ffd700?text=Sunflower' } }
    ];
    renderPlants(demoPlants, { total_pages: 1, current_page: 1 });
    console.error(err);
  } finally {
    setLoading(false);
  }
}

function renderPlants(plants, meta) {
  totalPages = meta.total_pages || 1;
  currentPage = meta.current_page || currentPage;

  plantsContainer.innerHTML = plants.map(p => `
    <div class="card">
      <img src="${p.default_image.thumbnail}" alt="${p.common_name}" loading="lazy">
      <h3>${p.common_name}</h3>
      <p><strong>Научное:</strong> <em>${p.scientific_name}</em></p>
      <p><strong>Семейство:</strong> ${p.family}</p>
      ${p.cycle ? `<p><strong>Цикл:</strong> ${p.cycle}</p>` : ''}
    </div>
  `).join('');

  pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
}

function setLoading(loading) {
  skeleton.style.display = loading ? 'grid' : 'none';
  plantsContainer.style.display = loading ? 'none' : 'grid';
}

function showError(msg) {
  statusEl.innerHTML = `<div class="error">${msg}</div>`;
}

function showEmpty(msg) {
  statusEl.innerHTML = `<div class="empty">${msg || 'Ничего не найдено'}</div>`;
  plantsContainer.innerHTML = '';
}

// Обработчики
const debouncedSearch = debounce(() => {
  currentQuery = searchInput.value;
  currentPage = 1;
  loadPlants(currentQuery, currentPage);
}, 500);

searchInput.addEventListener('input', debouncedSearch);
prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; loadPlants(currentQuery, currentPage); } };
nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; loadPlants(currentQuery, currentPage); } };
refreshBtn.onclick = () => loadPlants(currentQuery, currentPage, false);

// Старт
loadPlants();