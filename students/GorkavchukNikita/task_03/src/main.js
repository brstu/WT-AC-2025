const els = {
  searchInput: document.querySelector('#searchInput'),
  yearInput: document.querySelector('#yearInput'),
  refreshBtn: document.querySelector('#refreshBtn'),
  list: document.querySelector('#list'),
  detail: document.querySelector('#detail'),
  prevBtn: document.querySelector('#prevBtn'),
  nextBtn: document.querySelector('#nextBtn'),
  pageInfo: document.querySelector('#pageInfo'),
  netStatus: document.querySelector('#netStatus'),
  detailMeta: document.querySelector('#detailMeta'),
}

const CONFIG = {
  apiKey: '8c5132b',
  pageSize: 10,
  cacheTtlMs: 3 * 60 * 1000, // 3 минуты (для демонстрации)
  retries: 2,
  backoffMs: 450,
  timeoutMs: 5500,
  debounceMs: 350,
}

const memoryCache = new Map() // key -> { exp, value }
const LS_PREFIX = 'lab03_cache_v1:'

const state = {
  query: '',
  year: '',
  page: 1,
  totalPages: 1,
  items: [],
  selectedId: null,
}

let listController = null
let detailController = null

// ----------------- helpers -----------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const debounce = (fn, ms = 300) => {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

function setNetStatus(text, kind = '') {
  els.netStatus.textContent = text || ''
  els.netStatus.className = 'netStatus'
  if (kind) els.netStatus.classList.add(`netStatus--${kind}`)
}

function fmtMeta(meta) {
  if (!meta) return ''
  const parts = []
  if (meta.fromCache) parts.push(`cache:${meta.cacheLayer}`)
  if (typeof meta.attempts === 'number') parts.push(`attempts:${meta.attempts}`)
  return parts.join(' • ')
}

// ----------------- cache TTL -----------------
function cacheGet(key) {
  const now = Date.now()
  const m = memoryCache.get(key)
  if (m && m.exp > now) return { hit: true, value: m.value, layer: 'memory' }
  if (m) memoryCache.delete(key)

  try {
    const raw = localStorage.getItem(LS_PREFIX + key)
    if (!raw) return { hit: false }
    const parsed = JSON.parse(raw)
    if (parsed.exp > now) {
      memoryCache.set(key, { exp: parsed.exp, value: parsed.value })
      return { hit: true, value: parsed.value, layer: 'localStorage' }
    }
    localStorage.removeItem(LS_PREFIX + key)
  } catch {}

  return { hit: false }
}

function cacheSet(key, value, ttlMs) {
  const exp = Date.now() + ttlMs
  memoryCache.set(key, { exp, value })
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify({ exp, value }))
  } catch {}
}

// ----------------- fetch retry/timeout/abort -----------------
async function fetchJsonWithRetry(url, opts = {}) {
  const { retries = 2, backoffMs = 500, timeoutMs = 5000, signal, fetchCacheMode = 'default', onRetry } = opts

  let attempt = 0
  let lastErr = null

  while (attempt <= retries) {
    const controller = new AbortController()

    const forwardAbort = () => controller.abort()
    if (signal) {
      if (signal.aborted) controller.abort()
      else signal.addEventListener('abort', forwardAbort, { once: true })
    }

    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        cache: fetchCacheMode, // для демонстрации "Обновить без кэша"
        headers: { Accept: 'application/json' },
      })

      clearTimeout(timer)

      if (!res.ok) {
        const e = new Error(`HTTP ${res.status}`)
        e.status = res.status
        throw e
      }

      const data = await res.json()
      return { data, attempts: attempt + 1 }
    } catch (err) {
      clearTimeout(timer)
      lastErr = err

      if (signal) signal.removeEventListener('abort', forwardAbort)

      // AbortError не ретраим
      if (err?.name === 'AbortError') throw err

      if (attempt >= retries) break
      attempt += 1

      if (typeof onRetry === 'function') onRetry({ attempt, retries, err })

      const delay = backoffMs * Math.pow(2, attempt - 1)
      await sleep(delay)
    }
  }

  throw lastErr ?? new Error('Unknown network error')
}

async function requestJson(url, { cacheKey, ttlMs, forceRefresh = false, signal, onRetry } = {}) {
  if (!forceRefresh && cacheKey) {
    const hit = cacheGet(cacheKey)
    if (hit.hit) return { data: hit.value, meta: { fromCache: true, cacheLayer: hit.layer, attempts: 0 } }
  }

  const fetchCacheMode = forceRefresh ? 'no-store' : 'default'
  const { data, attempts } = await fetchJsonWithRetry(url, {
    retries: CONFIG.retries,
    backoffMs: CONFIG.backoffMs,
    timeoutMs: CONFIG.timeoutMs,
    signal,
    fetchCacheMode,
    onRetry,
  })

  if (cacheKey) cacheSet(cacheKey, data, ttlMs ?? CONFIG.cacheTtlMs)
  return { data, meta: { fromCache: false, attempts } }
}

// ----------------- OMDb URLs -----------------
function buildListUrl({ q, year, page }) {
  const params = new URLSearchParams()
  params.set('apikey', CONFIG.apiKey)
  params.set('type', 'movie')
  params.set('s', q || 'a') // OMDb требует s
  params.set('page', String(page))
  if (year) params.set('y', year)

  return `https://www.omdbapi.com/?${params.toString()}`
}

function buildDetailUrl({ id }) {
  const params = new URLSearchParams()
  params.set('apikey', CONFIG.apiKey)
  params.set('i', id)
  params.set('plot', 'short')
  return `https://www.omdbapi.com/?${params.toString()}`
}

// ----------------- UI -----------------
function renderListSkeleton() {
  els.list.innerHTML = Array.from({ length: 7 })
    .map(() => `<div class="skeleton" aria-hidden="true"></div>`)
    .join('')
}

function renderEmpty(text) {
  els.list.innerHTML = `<div class="detail__empty">${text}</div>`
}

function renderError(err) {
  const msg =
    err?.name === 'AbortError' ? 'Запрос отменён (AbortController).' : `Ошибка: ${String(err?.message || err)}`
  els.list.innerHTML = `<div class="detail__empty" style="color: var(--danger);">${msg}</div>`
}

function renderList(items) {
  els.list.innerHTML = items
    .map((m) => {
      const posterHtml =
        m.Poster && m.Poster !== 'N/A'
          ? `<img src="${m.Poster}" alt="${m.Title} poster" loading="lazy" />`
          : `<span>no poster</span>`

      return `
        <div class="card">
          <div class="card__poster">${posterHtml}</div>
          <div>
            <div class="card__title">${m.Title}</div>
            <div class="card__sub">${m.Year} • ${m.Type}</div>
          </div>
          <button class="btn" data-open="${m.imdbID}">Открыть</button>
        </div>
      `
    })
    .join('')

  els.list.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => openDetail(btn.getAttribute('data-open')))
  })
}

function renderDetailEmpty(text) {
  els.detail.innerHTML = `<div class="detail__empty">${text}</div>`
}

function renderDetailSkeleton() {
  els.detail.innerHTML = `
    <div class="detailCard">
      <div class="detailPoster skeleton" style="height:190px;"></div>
      <div>
        <div class="skeleton" style="height:18px;"></div>
        <div class="skeleton" style="height:14px;margin-top:10px;"></div>
        <div class="skeleton" style="height:14px;margin-top:10px;"></div>
      </div>
    </div>
  `
}

function renderDetail(d) {
  if (d?.Response === 'False') {
    renderDetailEmpty(`OMDb: ${d?.Error || 'не удалось загрузить детали'}`)
    return
  }

  const posterHtml =
    d.Poster && d.Poster !== 'N/A' ? `<img src="${d.Poster}" alt="${d.Title} poster" />` : ''

  const badges = [
    d.Rated ? `Rated: ${d.Rated}` : null,
    d.Runtime ? `Runtime: ${d.Runtime}` : null,
    d.Genre ? `Genre: ${d.Genre}` : null,
    d.imdbRating && d.imdbRating !== 'N/A' ? `IMDb: ${d.imdbRating}` : null,
  ].filter(Boolean)

  els.detail.innerHTML = `
    <div class="detailCard">
      <div class="detailPoster">${posterHtml}</div>
      <div>
        <h3 style="margin:0;">${d.Title} (${d.Year})</h3>
        <p class="muted" style="margin:8px 0 0;line-height:1.45;">${d.Plot || '—'}</p>
        <p class="muted" style="margin:8px 0 0;"><span style="opacity:.9;">Director:</span> ${d.Director || '—'}</p>
        <p class="muted" style="margin:6px 0 0;"><span style="opacity:.9;">Actors:</span> ${d.Actors || '—'}</p>
        <div class="badges">
          ${badges.map((b) => `<span class="badge">${b}</span>`).join('')}
        </div>
      </div>
    </div>
  `
}

function updatePager() {
  els.pageInfo.textContent = `Стр. ${state.page} / ${state.totalPages}`
  els.prevBtn.disabled = state.page <= 1
  els.nextBtn.disabled = state.page >= state.totalPages
}

// ----------------- flows -----------------
async function loadList({ forceRefresh = false } = {}) {
  const q = state.query.trim()
  const year = state.year.trim()
  const page = state.page

  if (listController) listController.abort()
  listController = new AbortController()

  renderListSkeleton()
  setNetStatus('loading:list…', 'warn')

  const url = buildListUrl({ q, year, page })
  const cacheKey = `omdb:list:q=${q}|y=${year}|p=${page}`

  try {
    const { data, meta } = await requestJson(url, {
      cacheKey,
      ttlMs: CONFIG.cacheTtlMs,
      forceRefresh,
      signal: listController.signal,
      onRetry: ({ attempt, retries, err }) => {
        setNetStatus(`retry ${attempt}/${retries} (list): ${String(err?.message || err)}`, 'warn')
      },
    })

    if (data?.Response === 'False') {
      state.items = []
      state.totalPages = 1
      updatePager()
      renderEmpty(`OMDb: ${data?.Error || 'нет результатов'}`)
      setNetStatus(`ok:list • ${fmtMeta(meta)}`, 'ok')
      return
    }

    const items = Array.isArray(data?.Search) ? data.Search : []
    const total = Number(data?.totalResults || 0)
    state.items = items
    state.totalPages = Math.max(1, Math.ceil(total / CONFIG.pageSize))

    if (!items.length) renderEmpty('Пусто. Попробуй другой запрос.')
    else renderList(items)

    updatePager()
    setNetStatus(`ok:list • ${fmtMeta(meta)}`, 'ok')
  } catch (err) {
    if (err?.name === 'AbortError') {
      setNetStatus('aborted:list', 'warn')
      return
    }
    setNetStatus('error:list', 'err')
    renderError(err)
  }
}

async function openDetail(id, { forceRefresh = false } = {}) {
  state.selectedId = id

  if (detailController) detailController.abort()
  detailController = new AbortController()

  renderDetailSkeleton()
  els.detailMeta.textContent = 'loading…'

  const url = buildDetailUrl({ id })
  const cacheKey = `omdb:detail:${id}`

  try {
    const { data, meta } = await requestJson(url, {
      cacheKey,
      ttlMs: CONFIG.cacheTtlMs,
      forceRefresh,
      signal: detailController.signal,
      onRetry: ({ attempt, retries, err }) => {
        els.detailMeta.textContent = `retry ${attempt}/${retries}: ${String(err?.message || err)}`
      },
    })

    els.detailMeta.textContent = fmtMeta(meta) || 'ok'
    renderDetail(data)
  } catch (err) {
    if (err?.name === 'AbortError') {
      els.detailMeta.textContent = 'aborted'
      return
    }
    els.detailMeta.textContent = 'error'
    renderDetailEmpty(`Ошибка деталей: ${String(err?.message || err)}`)
  }
}

// ----------------- events -----------------
const triggerSearch = debounce(() => {
  state.page = 1
  loadList()
}, CONFIG.debounceMs)

els.searchInput.addEventListener('input', (e) => {
  state.query = e.target.value
  triggerSearch()
})

els.yearInput.addEventListener('input', (e) => {
  state.year = e.target.value.replace(/[^\d]/g, '').slice(0, 4)
  e.target.value = state.year
  triggerSearch()
})

els.prevBtn.addEventListener('click', () => {
  if (state.page > 1) {
    state.page -= 1
    loadList()
  }
})

els.nextBtn.addEventListener('click', () => {
  if (state.page < state.totalPages) {
    state.page += 1
    loadList()
  }
})

els.refreshBtn.addEventListener('click', () => {
  loadList({ forceRefresh: true })
  if (state.selectedId) openDetail(state.selectedId, { forceRefresh: true })
})

// ----------------- init -----------------
function init() {
  renderDetailEmpty('Выбери фильм из списка слева.')
  renderEmpty('Начни вводить запрос в поле «Поиск».')
  updatePager()
}
init()
