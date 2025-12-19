const els = {
  searchInput: document.querySelector('#search-input'),
  yearInput: document.querySelector('#year-input'),
  refreshBtn: document.querySelector('#refresh-btn'),
  list: document.querySelector('#list'),
  detail: document.querySelector('#detail'),
  prevBtn: document.querySelector('#prev-btn'),
  nextBtn: document.querySelector('#next-btn'),
  pageInfo: document.querySelector('#page-info'),
  netStatus: document.querySelector('#net-status'),
  detailMeta: document.querySelector('#detail-meta'),
}

const config = {
  apiKey: 'PASTE_YOUR_VALID_KEY_HERE',
  pageSize: 10,
  cacheTtlMs: 3 * 60 * 1000,
  retries: 2,
  backoffMs: 450,
  timeoutMs: 5500,
  debounceMs: 350,
}

const memoryCache = new Map()
const lsPrefix = 'lab03-cache-v3:'

const state = {
  query: '',
  year: '',
  page: 1,
  totalPages: 1,
  selectedId: null,
}

let listController = null
let detailController = null

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const debounce = (fn, ms = 300) => {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

function setNetStatus(text, kind) {
  els.netStatus.textContent = text || ''
  els.netStatus.className = 'net-status'

  if (kind === 'ok') {
    els.netStatus.classList.add('net-status-ok')
  }

  if (kind === 'warn') {
    els.netStatus.classList.add('net-status-warn')
  }

  if (kind === 'err') {
    els.netStatus.classList.add('net-status-err')
  }
}

function fmtMeta(meta) {
  if (!meta) {
    return ''
  }

  const parts = []

  if (meta.fromCache) {
    parts.push(`cache:${meta.cacheLayer}`)
  }

  if (typeof meta.attempts === 'number') {
    parts.push(`attempts:${meta.attempts}`)
  }

  return parts.join(' • ')
}

function safeText(v) {
  return (v ?? '').toString()
}

function cacheGet(key) {
  const now = Date.now()
  const m = memoryCache.get(key)

  if (m && m.exp > now) {
    return { hit: true, value: m.value, layer: 'memory' }
  }

  if (m) {
    memoryCache.delete(key)
  }

  try {
    const raw = localStorage.getItem(lsPrefix + key)

    if (!raw) {
      return { hit: false }
    }

    const parsed = JSON.parse(raw)

    if (parsed.exp > now) {
      memoryCache.set(key, { exp: parsed.exp, value: parsed.value })
      return { hit: true, value: parsed.value, layer: 'local-storage' }
    }

    localStorage.removeItem(lsPrefix + key)
  } catch {
    // ignore
  }

  return { hit: false }
}

function cacheSet(key, value, ttlMs) {
  const exp = Date.now() + ttlMs

  memoryCache.set(key, { exp, value })

  try {
    localStorage.setItem(lsPrefix + key, JSON.stringify({ exp, value }))
  } catch {
    // ignore
  }
}

async function fetchJsonWithRetry(url, opts = {}) {
  const retries = opts.retries ?? 2
  const backoffMs = opts.backoffMs ?? 500
  const timeoutMs = opts.timeoutMs ?? 5000
  const signal = opts.signal
  const fetchCacheMode = opts.fetchCacheMode ?? 'default'
  const onRetry = opts.onRetry

  let attempt = 0
  let lastErr = null

  while (attempt <= retries) {
    const controller = new AbortController()

    const forwardAbort = () => controller.abort()

    if (signal) {
      if (signal.aborted) {
        controller.abort()
      } else {
        signal.addEventListener('abort', forwardAbort, { once: true })
      }
    }

    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        cache: fetchCacheMode,
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

      if (signal) {
        signal.removeEventListener('abort', forwardAbort)
      }

      if (err?.name === 'AbortError') {
        throw err
      }

      if (attempt >= retries) {
        break
      }

      attempt += 1

      if (typeof onRetry === 'function') {
        onRetry({ attempt, retries, err })
      }

      const delay = backoffMs * Math.pow(2, attempt - 1)
      await sleep(delay)
    }
  }

  throw lastErr ?? new Error('Unknown network error')
}

async function requestJson(url, opts = {}) {
  const cacheKey = opts.cacheKey
  const ttlMs = opts.ttlMs ?? config.cacheTtlMs
  const forceRefresh = opts.forceRefresh ?? false
  const signal = opts.signal
  const onRetry = opts.onRetry

  if (!forceRefresh && cacheKey) {
    const hit = cacheGet(cacheKey)

    if (hit.hit) {
      return { data: hit.value, meta: { fromCache: true, cacheLayer: hit.layer, attempts: 0 } }
    }
  }

  const fetchCacheMode = forceRefresh ? 'no-store' : 'default'

  const result = await fetchJsonWithRetry(url, {
    retries: config.retries,
    backoffMs: config.backoffMs,
    timeoutMs: config.timeoutMs,
    signal,
    fetchCacheMode,
    onRetry,
  })

  if (cacheKey) {
    cacheSet(cacheKey, result.data, ttlMs)
  }

  return { data: result.data, meta: { fromCache: false, attempts: result.attempts } }
}

function buildListUrl(q, year, page) {
  const params = new URLSearchParams()

  params.set('apikey', config.apiKey)
  params.set('type', 'movie')
  params.set('s', q || 'a')
  params.set('page', String(page))

  if (year) {
    params.set('y', year)
  }

  return `https://www.omdbapi.com/?${params.toString()}`
}

function buildDetailUrl(id) {
  const params = new URLSearchParams()

  params.set('apikey', config.apiKey)
  params.set('i', id)
  params.set('plot', 'short')

  return `https://www.omdbapi.com/?${params.toString()}`
}

function renderListSkeleton() {
  els.list.innerHTML = Array.from({ length: 7 })
    .map(() => '<div class="skeleton" aria-hidden="true"></div>')
    .join('')
}

function renderListEmpty(text) {
  els.list.innerHTML = `<div class="detail-empty">${safeText(text)}</div>`
}

function renderListError(err) {
  const msg =
    err?.name === 'AbortError'
      ? 'Запрос отменён (AbortController).'
      : `Ошибка: ${safeText(err?.message || err)}`

  els.list.innerHTML = `<div class="detail-empty" style="color: var(--danger);">${msg}</div>`
}

function renderList(items) {
  els.list.innerHTML = items
    .map((m) => {
      const posterHtml =
        m.Poster && m.Poster !== 'N/A'
          ? `<img src="${m.Poster}" alt="${safeText(m.Title)} poster" loading="lazy" />`
          : '<span>no poster</span>'

      return `
        <div class="card">
          <div class="card-poster">${posterHtml}</div>
          <div>
            <div class="card-title">${safeText(m.Title)}</div>
            <div class="card-sub">${safeText(m.Year)} • ${safeText(m.Type)}</div>
          </div>
          <button class="btn card-btn" type="button" data-open="${safeText(m.imdbID)}">Открыть</button>
        </div>
      `
    })
    .join('')

  els.list.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => openDetail(btn.getAttribute('data-open')))
  })
}

function renderDetailSkeleton() {
  els.detail.innerHTML = `
    <div class="detail-card">
      <div class="detail-poster skeleton" style="height: 190px;"></div>
      <div>
        <div class="skeleton" style="height: 18px;"></div>
        <div class="skeleton" style="height: 14px; margin-top: 10px;"></div>
        <div class="skeleton" style="height: 14px; margin-top: 10px;"></div>
      </div>
    </div>
  `
}

function renderDetailEmpty(text) {
  els.detail.innerHTML = `<div class="detail-empty">${safeText(text)}</div>`
}

function renderDetail(data) {
  if (data?.Response === 'False') {
    renderDetailEmpty(`OMDb: ${safeText(data?.Error || 'не удалось загрузить детали')}`)
    return
  }

  const posterHtml =
    data.Poster && data.Poster !== 'N/A'
      ? `<img src="${data.Poster}" alt="${safeText(data.Title)} poster" />`
      : ''

  const badges = [
    data.Rated ? `Rated: ${data.Rated}` : null,
    data.Runtime ? `Runtime: ${data.Runtime}` : null,
    data.Genre ? `Genre: ${data.Genre}` : null,
    data.imdbRating && data.imdbRating !== 'N/A' ? `IMDb: ${data.imdbRating}` : null,
  ].filter(Boolean)

  els.detail.innerHTML = `
    <div class="detail-card">
      <div class="detail-poster">${posterHtml}</div>
      <div>
        <h3 style="margin: 0;">${safeText(data.Title)} (${safeText(data.Year)})</h3>
        <p class="muted" style="margin: 8px 0 0; line-height: 1.45;">${safeText(data.Plot || '—')}</p>
        <p class="muted" style="margin: 8px 0 0;"><span style="opacity: 0.9;">Director:</span> ${safeText(
          data.Director || '—'
        )}</p>
        <p class="muted" style="margin: 6px 0 0;"><span style="opacity: 0.9;">Actors:</span> ${safeText(
          data.Actors || '—'
        )}</p>
        <div class="badges">
          ${badges.map((b) => `<span class="badge">${safeText(b)}</span>`).join('')}
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

async function loadList(opts = {}) {
  const forceRefresh = opts.forceRefresh ?? false
  const q = state.query.trim()
  const year = state.year.trim()
  const page = state.page

  if (listController) {
    listController.abort()
  }

  listController = new AbortController()

  renderListSkeleton()
  setNetStatus('loading:list…', 'warn')

  const url = buildListUrl(q, year, page)
  const cacheKey = `omdb-list-q=${q}-y=${year}-p=${page}`

  try {
    const result = await requestJson(url, {
      cacheKey,
      ttlMs: config.cacheTtlMs,
      forceRefresh,
      signal: listController.signal,
      onRetry: ({ attempt, retries, err }) => {
        setNetStatus(`retry ${attempt}/${retries} (list): ${safeText(err?.message || err)}`, 'warn')
      },
    })

    const data = result.data
    const meta = result.meta

    if (data?.Response === 'False') {
      state.totalPages = 1
      updatePager()
      renderListEmpty(`OMDb: ${safeText(data?.Error || 'нет результатов')}`)
      setNetStatus(`ok:list • ${fmtMeta(meta)}`, 'ok')
      return
    }

    const items = Array.isArray(data?.Search) ? data.Search : []
    const total = Number(data?.totalResults || 0)

    state.totalPages = Math.max(1, Math.ceil(total / config.pageSize))

    if (!items.length) {
      renderListEmpty('Пусто. Попробуй другой запрос.')
    } else {
      renderList(items)
    }

    updatePager()
    setNetStatus(`ok:list • ${fmtMeta(meta)}`, 'ok')
  } catch (err) {
    if (err?.name === 'AbortError') {
      setNetStatus('aborted:list', 'warn')
      return
    }

    renderListError(err)
    setNetStatus('error:list', 'err')
  } finally {
    // finally по требованиям
  }
}

async function openDetail(id, opts = {}) {
  const forceRefresh = opts.forceRefresh ?? false

  state.selectedId = id

  if (detailController) {
    detailController.abort()
  }

  detailController = new AbortController()

  renderDetailSkeleton()
  els.detailMeta.textContent = 'loading…'

  const url = buildDetailUrl(id)
  const cacheKey = `omdb-detail-${id}`

  try {
    const result = await requestJson(url, {
      cacheKey,
      ttlMs: config.cacheTtlMs,
      forceRefresh,
      signal: detailController.signal,
      onRetry: ({ attempt, retries, err }) => {
        els.detailMeta.textContent = `retry ${attempt}/${retries}: ${safeText(err?.message || err)}`
      },
    })

    els.detailMeta.textContent = fmtMeta(result.meta) || 'ok'
    renderDetail(result.data)
  } catch (err) {
    if (err?.name === 'AbortError') {
      els.detailMeta.textContent = 'aborted'
      return
    }

    els.detailMeta.textContent = 'error'
    renderDetailEmpty(`Ошибка деталей: ${safeText(err?.message || err)}`)
  } finally {
    // finally по требованиям
  }
}

const triggerSearch = debounce(() => {
  state.page = 1
  loadList()
}, config.debounceMs)

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

  if (state.selectedId) {
    openDetail(state.selectedId, { forceRefresh: true })
  }
})

function init() {
  renderDetailEmpty('Выбери фильм из списка слева.')
  renderListEmpty('Начни вводить запрос в поле «Поиск».')
  updatePager()
}

init()
