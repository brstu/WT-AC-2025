/* ЛР03 — main.js
   Демонстрация: fetchWithRetry, таймаут, отмена через AbortController,
   in-memory + localStorage cache с TTL, поиск с debounce, пагинация.
*/
(function () {
  // By default use local mock server supporting ETag. To use remote API (Deezer), change this value.
  const API_BASE = window.__API_BASE__ || 'http://localhost:5174';
  const PER_PAGE = 10;
  const CACHE_TTL_MS = 60 * 1000; // 60s default

  // Embedded fallback data (top 30 tracks) for demo without server
  const EMBEDDED_TRACKS = [
    {
      id: 1,
      title: 'Cadillac',
      artist: 'Моргенштерн x Элджей',
      album: 'Cadillac (Single)',
      year: 2020,
      body: 'Хит 2020 года, ставший вирусным. Трэп-баллада о роскоши.',
    },
    {
      id: 2,
      title: 'Малиновая Лада',
      artist: 'Элджей',
      album: 'Sayonara Boy',
      year: 2020,
      body: 'Легендарный трек про малиновую Ладу Приору.',
    },
    {
      id: 3,
      title: 'Романс',
      artist: 'Анна Асти',
      album: 'Романс (Single)',
      year: 2022,
      body: 'Меланхоличная песня о любви, покорила чарты.',
    },
    {
      id: 4,
      title: 'По барам',
      artist: 'Анна Асти',
      album: 'По барам (Single)',
      year: 2023,
      body: 'Хит о клубной жизни и переживаниях.',
    },
    {
      id: 5,
      title: 'Colette',
      artist: 'Инстасамка',
      album: 'Colette (Single)',
      year: 2021,
      body: 'Провокационный трек, ставший мемом.',
    },
    {
      id: 6,
      title: 'За деньги да',
      artist: 'Инстасамка',
      album: 'За деньги да (Single)',
      year: 2022,
      body: 'Ироничная песня о материальных ценностях.',
    },
    {
      id: 7,
      title: 'Мне насрать',
      artist: 'Инстасамка',
      album: 'Мне насрать (Single)',
      year: 2023,
      body: 'Дерзкий трек с откровенным посылом.',
    },
    {
      id: 8,
      title: 'Кокос',
      artist: 'Макан',
      album: 'Кокос (Single)',
      year: 2021,
      body: 'Летний хит с карибскими мотивами.',
    },
    {
      id: 9,
      title: 'Номера',
      artist: 'Макан',
      album: 'Номера (Single)',
      year: 2022,
      body: 'Романтический трек о звонках и расставании.',
    },
    {
      id: 10,
      title: 'ZIMA',
      artist: 'Клава Кока',
      album: 'ZIMA (Single)',
      year: 2020,
      body: 'Зимняя атмосферная песня.',
    },
    {
      id: 11,
      title: 'На связи',
      artist: 'Клава Кока',
      album: 'На связи (Single)',
      year: 2021,
      body: 'Современная поп-композиция о коммуникации.',
    },
    {
      id: 12,
      title: 'Самба белого мотылька',
      artist: 'Егор Крид',
      album: 'Самба белого мотылька (Single)',
      year: 2021,
      body: 'Танцевальный хит с латиноамериканскими ритмами.',
    },
    {
      id: 13,
      title: 'Невеста',
      artist: 'Егор Крид',
      album: 'Невеста (Single)',
      year: 2020,
      body: 'Романтическая баллада о свадьбе.',
    },
    {
      id: 14,
      title: '58',
      artist: 'Егор Крид',
      album: '58 (Single)',
      year: 2019,
      body: 'Номерной трек, ставший хитом.',
    },
    {
      id: 15,
      title: 'Если ты меня не любишь',
      artist: 'Егор Крид x Molly',
      album: 'Холостяк (Soundtrack)',
      year: 2020,
      body: 'Саундтрек к популярному шоу.',
    },
    {
      id: 16,
      title: 'Малышка',
      artist: 'Миа Бойка',
      album: 'Малышка (Single)',
      year: 2021,
      body: 'Нежная песня о первой любви.',
    },
    {
      id: 17,
      title: 'Заколдован',
      artist: "Ramil'",
      album: 'Заколдован (Single)',
      year: 2020,
      body: 'Меланхоличный R&B трек.',
    },
    {
      id: 18,
      title: 'Эта ночь',
      artist: "Ramil'",
      album: 'Эта ночь (Single)',
      year: 2021,
      body: 'Ночная романтика в современном звучании.',
    },
    {
      id: 19,
      title: 'Берега',
      artist: 'XOLIDAYBOY',
      album: 'Берега (Single)',
      year: 2022,
      body: 'Задумчивый трек о расстояниях.',
    },
    {
      id: 20,
      title: 'LUV',
      artist: 'The Limba',
      album: 'LUV (Single)',
      year: 2020,
      body: 'Англоязычный хит русского артиста.',
    },
    {
      id: 21,
      title: 'Гори',
      artist: 'Jony x Andro',
      album: 'Гори (Single)',
      year: 2020,
      body: 'Хит о страсти и эмоциях.',
    },
    {
      id: 22,
      title: 'Комета',
      artist: 'Jony',
      album: 'Комета (Single)',
      year: 2019,
      body: 'Космическая романтика.',
    },
    {
      id: 23,
      title: 'Лали',
      artist: 'Jony',
      album: 'Лали (Single)',
      year: 2021,
      body: 'Восточные мотивы в современной обработке.',
    },
    {
      id: 24,
      title: 'Титры',
      artist: 'Jony x HammAli & Navai',
      album: 'Титры (Single)',
      year: 2020,
      body: 'Трек о финале отношений.',
    },
    {
      id: 25,
      title: 'Детка',
      artist: 'Rauf & Faik',
      album: 'Детка (Single)',
      year: 2019,
      body: 'Нежная песня-посвящение.',
    },
    {
      id: 26,
      title: 'Колыбельная',
      artist: 'Rauf & Faik',
      album: 'Колыбельная (Single)',
      year: 2019,
      body: 'Убаюкивающая мелодия.',
    },
    {
      id: 27,
      title: 'Я люблю тебя',
      artist: 'Rauf & Faik',
      album: 'Я люблю тебя (Single)',
      year: 2020,
      body: 'Признание в любви.',
    },
    {
      id: 28,
      title: '5 минут',
      artist: 'Rauf & Faik',
      album: '5 минут (Single)',
      year: 2021,
      body: 'Песня о коротком времени вместе.',
    },
    {
      id: 29,
      title: 'Грустный дэнс',
      artist: 'Artik & Asti',
      album: 'Грустный дэнс (Single)',
      year: 2020,
      body: 'Танцевальная меланхолия.',
    },
    {
      id: 30,
      title: 'Девочка танцуй',
      artist: 'Artik & Asti',
      album: 'Девочка танцуй (Single)',
      year: 2021,
      body: 'Энергичный клубный трек.',
    },
  ];

  // --- simple Cache (memory + localStorage fallback) ---
  class Cache {
    constructor(ttl = CACHE_TTL_MS) {
      this.ttl = ttl;
      this.map = new Map();
      this.prefix = 'lr03_cache_v1:';
      this._loadFromLocal();
    }
    _now() {
      return Date.now();
    }
    _loadFromLocal() {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key.startsWith(this.prefix)) continue;
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const obj = JSON.parse(raw);
          if (obj.expiry > this._now()) this.map.set(key.slice(this.prefix.length), obj);
          else localStorage.removeItem(key);
        }
      } catch (e) {
        /* ignore */
      }
    }
    get(key) {
      const entry = this.map.get(key);
      if (!entry) return null;
      if (entry.expiry <= this._now()) {
        this.delete(key);
        return null;
      }
      return entry.value;
    }
    set(key, value, ttl = this.ttl) {
      const entry = { value, expiry: this._now() + ttl };
      this.map.set(key, entry);
      try {
        localStorage.setItem(this.prefix + key, JSON.stringify(entry));
      } catch (e) {
        /* storage may be full */
      }
    }
    delete(key) {
      this.map.delete(key);
      try {
        localStorage.removeItem(this.prefix + key);
      } catch (e) {}
    }
    clear() {
      this.map.clear();
      try {
        for (let k in Object.keys(localStorage)) {
        }
      } catch (e) {}
    }
  }

  const cache = new Cache();

  // --- fetchWithRetry with timeout and AbortController ---
  async function fetchWithRetry(
    url,
    { retries = 2, backoffMs = 400, timeoutMs = 5000, signal = null, etag = null } = {}
  ) {
    let attempt = 0;
    while (true) {
      attempt++;
      const controller = new AbortController();
      const combinedSignal = mergeSignals(signal, controller.signal);

      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const headers = {};
        if (etag) headers['If-None-Match'] = etag;
        const res = await fetch(url, { signal: combinedSignal, headers });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return { data, fromNetwork: true, res };
      } catch (err) {
        clearTimeout(timer);
        if (err && err.name === 'AbortError') {
          // don't retry if external signal aborted
          if (signal && signal.aborted) throw err;
          // else it was our timeout; we may retry
        }
        if (attempt > retries) throw err;
        const wait = backoffMs * Math.pow(2, attempt - 1);
        await delay(wait);
      }
    }
  }

  function mergeSignals(a, b) {
    if (!a) return b;
    if (!b) return a;
    if (a.aborted) return a;
    const controller = new AbortController();
    function onAbort() {
      controller.abort();
      cleanup();
    }
    function cleanup() {
      a.removeEventListener('abort', onAbort);
      b.removeEventListener('abort', onAbort);
    }
    a.addEventListener('abort', onAbort);
    b.addEventListener('abort', onAbort);
    return controller.signal;
  }

  function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // --- UI state & elements ---
  const el = {
    search: document.getElementById('search'),
    refresh: document.getElementById('refresh'),
    list: document.getElementById('list'),
    status: document.getElementById('status'),
    banner: document.getElementById('banner'),
    pagination: document.getElementById('pagination'),
  };

  let state = { page: 1, q: '', total: 0 };
  let lastController = null;
  let usingFallback = false;

  // debounce input
  function debounce(fn, ms = 300) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  // render helpers
  function setStatus(html) {
    el.status.innerHTML = html || '';
  }
  function showSpinner(txt = 'Загрузка...') {
    setStatus(`<span class="spinner"></span> ${txt}`);
  }
  function showError(txt) {
    setStatus(`<span class="small">Ошибка: ${escapeHtml(txt)}</span>`);
  }
  function showBanner(txt) {
    if (!txt) {
      el.banner.classList.remove('show');
      el.banner.textContent = '';
      el.banner.setAttribute('aria-hidden', 'true');
      return;
    }
    el.banner.classList.add('show');
    el.banner.textContent = txt;
    el.banner.setAttribute('aria-hidden', 'false');
  }
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderSkeletons(count = 6) {
    const nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push(
        `<div class="skeleton-card"><div style="display:flex;gap:12px;align-items:flex-start"><div class="skeleton-poster"></div><div style="flex:1"><div style="height:18px;width:60%;background:rgba(255,255,255,0.04);border-radius:8px;margin-bottom:8px"></div><div style="height:12px;width:40%;background:rgba(255,255,255,0.03);border-radius:6px"></div></div></div></div>`
      );
    }
    el.list.innerHTML = nodes.join('');
  }

  // poster: prefer item.poster (server-provided data URL), else fallback to picsum
  function makePoster(item) {
    if (item && item.poster) return item.poster;
    const id = item && item.id ? item.id : Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/track${id}/240/240`;
  }
  function artistFrom(item) {
    return item && item.artist
      ? item.artist
      : `Artist ${item.userId || (item && item.id % 10) + 1}`;
  }
  function albumFrom(item) {
    return item && item.album
      ? item.album
      : `Album ${(item && item.userId) || (item && item.id % 10) + 1}`;
  }

  function renderList(items, { fromCache = false, res = null } = {}) {
    if (!items || items.length === 0) {
      el.list.innerHTML = '<div class="error-card">По вашему запросу ничего не найдено</div>';
      return;
    }
    // render cards as DOM to safely attach image handlers
    el.list.innerHTML = '';
    const frag = document.createDocumentFragment();
    items.forEach((it) => {
      const poster = makePoster(it);
      const safePoster = poster ? poster : '';
      const card = document.createElement('div');
      card.className = 'card';
      const img = document.createElement('img');
      img.className = 'poster-img';
      img.alt = it.title || 'poster';
      img.src = safePoster;
      img.onerror = function () {
        this.style.opacity = '0.18';
        this.src = '';
      };
      const body = document.createElement('div');
      body.className = 'card-body';
      const title = document.createElement('div');
      title.className = 'title';
      title.innerText = it.title || '';
      const meta = document.createElement('div');
      meta.className = 'meta';
      const badge = fromCache
        ? `<span class="badge cache">из кэша</span>`
        : `<span class="badge net">с сети</span>`;
      meta.innerHTML = `${escapeHtml(artistFrom(it))} • ${escapeHtml(albumFrom(it))} ${badge}`;
      const desc = document.createElement('div');
      desc.className = 'desc';
      desc.innerText = it.body || '';
      body.appendChild(title);
      body.appendChild(meta);
      body.appendChild(desc);
      card.appendChild(img);
      card.appendChild(body);
      frag.appendChild(card);
    });
    el.list.appendChild(frag);
  }

  function renderPagination() {
    const totalPages = Math.max(1, Math.ceil(state.total / PER_PAGE));
    const page = state.page;
    el.pagination.innerHTML = '';
    const prev = createBtn('Предыдущая', () => gotoPage(page - 1));
    prev.disabled = page <= 1;
    const next = createBtn('Следующая', () => gotoPage(page + 1));
    next.disabled = page >= totalPages;
    const info = document.createElement('div');
    info.className = 'small';
    info.style.color = 'var(--muted)';
    info.textContent = `Страница ${page} из ${totalPages}`;
    el.pagination.appendChild(prev);
    el.pagination.appendChild(info);
    el.pagination.appendChild(next);
  }

  function createBtn(text, onClick) {
    const b = document.createElement('button');
    b.className = 'page-btn';
    b.textContent = text;
    b.onclick = onClick;
    return b;
  }

  function gotoPage(p) {
    if (p < 1) p = 1;
    const totalPages = Math.ceil(state.total / PER_PAGE) || 1;
    if (p > totalPages) p = totalPages;
    state.page = p;
    loadData();
  }

  // --- main data loader ---
  async function loadData({ ignoreCache = false, signal: externalSignal = null } = {}) {
    const q = state.q.trim();
    const page = state.page;
    // choose endpoint: local mock uses /tracks, JSONPlaceholder uses /posts
    const endpoint = API_BASE && API_BASE.includes('jsonplaceholder') ? '/posts' : '/tracks';
    const url = new URL(API_BASE + endpoint);
    url.searchParams.set('_limit', PER_PAGE);
    url.searchParams.set('_page', page);
    if (q) url.searchParams.set('title_like', q);
    const key = url.toString();

    // abort previous
    if (lastController) {
      lastController.abort();
    }
    const controller = new AbortController();
    lastController = controller;
    const mergedSignal = mergeSignals(externalSignal, controller.signal);

    // check cache
    if (!ignoreCache) {
      const cached = cache.get(key);
      if (cached) {
        console.log('CACHE HIT', key);
        renderList(cached, { fromCache: true }); // set total from cached meta if any
        if (cached._meta && cached._meta.total != null) state.total = cached._meta.total;
        renderPagination();
        return { fromCache: true, data: cached };
      }
    }

    // actually fetch
    try {
      renderSkeletons(8);
      showSpinner('Загрузка...');
      // Try sending ETag if we have cached meta for this key
      const cachedMeta = cache.get(key) && cache.get(key)._meta ? cache.get(key)._meta : null;
      const etag = cachedMeta && cachedMeta.etag ? cachedMeta.etag : null;
      const { data, fromNetwork, res } = await fetchWithRetry(key, {
        retries: 2,
        backoffMs: 300,
        timeoutMs: 7000,
        signal: mergedSignal,
        etag,
      });
      if (res && res.status === 304) {
        // server says not modified — use cached
        const cached = cache.get(key);
        if (cached) {
          console.log('CACHE HIT (304)', key);
          renderList(cached, { fromCache: true });
          if (cached._meta && cached._meta.total != null) state.total = cached._meta.total;
          renderPagination();
          setStatus(`Последнее обновление: ${new Date().toLocaleTimeString()} (из кэша)`);
          return { fromCache: true, data: cached };
        }
      }
      // jsonplaceholder returns full list for this endpoint; but when using _page it includes X-Total-Count header
      const total =
        res && res.headers && res.headers.get('x-total-count')
          ? Number(res.headers.get('x-total-count'))
          : Array.isArray(data)
          ? data.length
          : 0;
      // store with meta and etag (if provided by server)
      const payload = Array.isArray(data) ? data : [];
      const respEtag = res && res.headers ? res.headers.get('etag') : null;
      payload._meta = { total, etag: respEtag };
      cache.set(key, payload);
      state.total = total;
      renderList(payload, { fromCache: false, res });
      renderPagination();
      setStatus(`Последнее обновление: ${new Date().toLocaleTimeString()}`);
      return { data: payload };
    } catch (err) {
      if (err && err.name === 'AbortError') {
        showStatusMessage('Запрос отменён');
        console.log('Aborted', err);
        return;
      }
      console.error(err);
      // Provide clearer guidance when network / server is unavailable
      const isNetwork =
        err instanceof TypeError || (err.message && /failed to fetch|network/i.test(err.message));
      if (isNetwork) {
        // Use embedded fallback data when server unavailable
        console.warn('Server unavailable, using embedded data');
        showBanner(
          '⚠️ Mock-сервер недоступен. Показаны 30 треков из встроенной коллекции. Для полной коллекции (120 треков) запустите сервер.'
        );
        const q = state.q.trim().toLowerCase();
        let filtered = EMBEDDED_TRACKS.slice();
        if (q) {
          filtered = filtered.filter(
            (t) =>
              (t.title && t.title.toLowerCase().includes(q)) ||
              (t.album && t.album.toLowerCase().includes(q)) ||
              (t.artist && t.artist.toLowerCase().includes(q))
          );
        }
        const start = (state.page - 1) * PER_PAGE;
        const pageItems = filtered.slice(start, start + PER_PAGE);
        state.total = filtered.length;
        renderList(pageItems, { fromCache: false });
        renderPagination();
        setStatus(
          `Показано ${pageItems.length} из ${filtered.length} треков (встроенная коллекция)`
        );
        return;
      }
      showError(err.message || 'Ошибка');
      el.list.innerHTML = `<div class="error-card"><div>Ошибка при загрузке данных. <div class="small">${escapeHtml(
        err.message || ''
      )}</div><button id="retry">Повторить</button></div></div>`;
      document.getElementById('retry').onclick = () => loadData({ ignoreCache: true });
    } finally {
      // clear controller if it's the same
      if (lastController === controller) lastController = null;
    }
  }

  function showStatusMessage(txt) {
    setStatus(txt);
  }

  // wire events
  const doSearch = debounce(() => {
    state.page = 1;
    state.q = el.search.value;
    loadData();
  }, 350);
  el.search.addEventListener('input', doSearch);
  el.refresh.addEventListener('click', () => loadData({ ignoreCache: true }));

  // initial
  loadData();

  // expose for console debugging
  window._lr03 = { cache, fetchWithRetry, loadData };
})();
