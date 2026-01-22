// scripts/main.js (ES6+)

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** ---------- Данные (медиатека) ---------- */
const TRACKS = [
  { id: "t1", title: "Night Drive", artist: "Aurora Echo", genre: "electro", playlist: "chill", duration: "3:18" },
  { id: "t2", title: "Deep Focus", artist: "Mono Wave", genre: "focus", playlist: "study", duration: "2:54" },
  { id: "t3", title: "Coffee & Code", artist: "Byte Jazz", genre: "jazz", playlist: "workout", duration: "3:41" },
  { id: "t4", title: "No Distractions", artist: "Calm Unit", genre: "focus", playlist: "study", duration: "4:05" },
  { id: "t5", title: "Electro Sprint", artist: "Pulse Maker", genre: "electro", playlist: "workout", duration: "2:49" },
  { id: "t6", title: "Blue Notes", artist: "Late Night Trio", genre: "jazz", playlist: "chill", duration: "3:26" },
];

/** ---------- Состояние (bonus: localStorage) ---------- */
const STORAGE_KEY = "lab02_music_library_state_v1";
const state = loadState();

/** state:
 * {
 *  activeTab: "tab-genres" | "tab-playlists",
 *  genre: "all" | "focus" | "jazz" | "electro",
 *  playlist: "all" | "study" | "workout" | "chill",
 *  query: string,
 *  likes: { [id]: true }
 * }
 */
function defaultState() {
  return {
    activeTab: "tab-genres",
    genre: "all",
    playlist: "all",
    query: "",
    likes: {},
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed, likes: parsed.likes || {} };
  } catch {
    return defaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

/** ---------- Элементы ---------- */
const announceEl = $("#announce");
const trackListEl = $("#trackList");
const emptyStateEl = $("#emptyState");

const burgerBtn = $(".burger");
const navEl = $("#site-nav");

const tabsEl = $(".tabs");
const tabButtons = $$(".tab", tabsEl);
const tabPanels = $$(".tabpanel", tabsEl);

const searchForm = $("#searchForm");
const searchInput = $("#query");
const resetSearchBtn = $("#resetSearch");

const accordionEl = $("#accordion");

const modal = $("#nowPlayingModal");
const modalBackdrop = $("#modalBackdrop");
const closeModalBtn = $("#closeModal");
const modalOkBtn = $("#modalOk");
const modalLikeBtn = $("#modalLike");
const npTitle = $("#npTitle");
const npArtist = $("#npArtist");
const npGenre = $("#npGenre");
const npDuration = $("#npDuration");

let modalOpener = null;
let modalTrackId = null;

/** ---------- Инициализация ---------- */
initBurgerMenu();
initTabs();
initPills();
initTrackListDelegation();
initAccordion();
initSearch();
initFeedbackForm();

applyInitialState();
render();

/** ---------- Burger menu (a11y + клавиатура) ---------- */
function initBurgerMenu() {
  burgerBtn.addEventListener("click", () => {
    const isOpen = navEl.dataset.open === "true";
    setNavOpen(!isOpen);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setNavOpen(false);
  });

  // закрытие при клике по ссылке
  navEl.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    setNavOpen(false);
  });
}

function setNavOpen(open) {
  navEl.dataset.open = String(open);
  burgerBtn.setAttribute("aria-expanded", String(open));
}

/** ---------- Tabs (ARIA + стрелки/Enter/Space) ---------- */
function initTabs() {
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => setActiveTab(btn.id, true));
    btn.addEventListener("keydown", (e) => {
      const currentIndex = tabButtons.indexOf(btn);

      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (currentIndex + dir + tabButtons.length) % tabButtons.length;
        tabButtons[nextIndex].focus();
      }

      if (e.key === "Home") {
        e.preventDefault();
        tabButtons[0].focus();
      }

      if (e.key === "End") {
        e.preventDefault();
        tabButtons[tabButtons.length - 1].focus();
      }

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setActiveTab(btn.id, true);
      }
    });
  });
}

function setActiveTab(tabId, userAction = false) {
  tabButtons.forEach((btn) => {
    const selected = btn.id === tabId;
    btn.setAttribute("aria-selected", String(selected));
    btn.tabIndex = selected ? 0 : -1;
  });

  tabPanels.forEach((panel) => {
    const isForTab = panel.getAttribute("aria-labelledby") === tabId;
    panel.hidden = !isForTab;
  });

  state.activeTab = tabId;
  if (userAction) saveState();
}

/** ---------- Pills (жанры/плейлисты) ---------- */
function initPills() {
  tabsEl.addEventListener("click", (e) => {
    const pill = e.target.closest(".pill");
    if (!pill) return;

    const genre = pill.dataset.genre;
    const playlist = pill.dataset.playlist;

    if (genre) {
      state.genre = genre;
      state.playlist = "all"; // чтобы фильтры не конфликтовали
      updatePillsPressed();
      saveState();
      render();
      announce(`Фильтр по жанру: ${genreLabel(genre)}`);
    }

    if (playlist) {
      state.playlist = playlist;
      state.genre = "all";
      updatePillsPressed();
      saveState();
      render();
      announce(`Фильтр по плейлисту: ${playlistLabel(playlist)}`);
    }
  });
}

function updatePillsPressed() {
  $$(".pill[data-genre]", tabsEl).forEach((p) =>
    p.setAttribute("aria-pressed", String(p.dataset.genre === state.genre))
  );
  $$(".pill[data-playlist]", tabsEl).forEach((p) =>
    p.setAttribute("aria-pressed", String(p.dataset.playlist === state.playlist))
  );
}

/** ---------- Делегирование на списке треков ---------- */
function initTrackListDelegation() {
  trackListEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const card = e.target.closest("[data-track-id]");
    if (!card) return;
    const trackId = card.dataset.trackId;

    if (btn.dataset.action === "play") {
      const track = TRACKS.find((t) => t.id === trackId);
      if (!track) return;
      openModal(track, btn);
      return;
    }

    if (btn.dataset.action === "like") {
      toggleLike(trackId, btn);
      return;
    }

    if (btn.dataset.action === "delete") {
      deleteTrack(trackId);
      return;
    }
  });
}

function toggleLike(trackId, btnEl) {
  const liked = !!state.likes[trackId];
  if (liked) delete state.likes[trackId];
  else state.likes[trackId] = true;

  saveState();
  render();

  announce(liked ? "Лайк снят" : "Поставлен лайк");
}

function deleteTrack(trackId) {
  // Для учебного примера: удаляем из DOM через фильтр "удалённых" в памяти
  // (не меняем исходный TRACKS, просто пометим)
  const deletedKey = `deleted_${trackId}`;
  state[deletedKey] = true;

  saveState();
  render();

  announce("Трек удалён из списка");
}

/** ---------- Аккордеон ---------- */
function initAccordion() {
  accordionEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".acc-btn");
    if (!btn) return;

    toggleAccordion(btn);
  });

  // Enter/Space работают по умолчанию на button — доп. обработчик не нужен
}

function toggleAccordion(btn) {
  const expanded = btn.getAttribute("aria-expanded") === "true";
  const panelId = btn.getAttribute("aria-controls");
  const panel = document.getElementById(panelId);

  btn.setAttribute("aria-expanded", String(!expanded));
  panel.hidden = expanded;

  announce(!expanded ? "Раздел раскрыт" : "Раздел свернут");
}

/** ---------- Поиск (форма по варианту) ---------- */
function initSearch() {
  searchInput.value = state.query || "";

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    state.query = (searchInput.value || "").trim();
    saveState();
    render();
    announce(state.query ? `Поиск: ${state.query}` : "Поиск очищен");
  });

  resetSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    state.query = "";
    saveState();
    render();
    announce("Поиск сброшен");
  });

  searchInput.addEventListener("input", () => {
    // “валидация при вводе” тут мягкая: просто обновляем состояние и рендер по желанию
    // Чтобы не дёргать DOM сильно — не рендерим на каждый символ, только сохраняем
    state.query = (searchInput.value || "").trim();
    saveState();
  });
}

/** ---------- Модалка: фокус + Esc + (простая ловушка фокуса) ---------- */
function openModal(track, openerEl) {
  modalTrackId = track.id;
  modalOpener = openerEl;

  npTitle.textContent = track.title;
  npArtist.textContent = track.artist;
  npGenre.textContent = genreLabel(track.genre);
  npDuration.textContent = track.duration;

  // sync like button in modal
  const liked = !!state.likes[track.id];
  modalLikeBtn.setAttribute("aria-pressed", String(liked));
  modalLikeBtn.textContent = liked ? "Лайк (уже)" : "Лайк";

  modal.hidden = false;
  modalBackdrop.hidden = false;

  // фокус в модалку
  closeModalBtn.focus();

  document.addEventListener("keydown", onModalKeydown);
  modalBackdrop.addEventListener("click", onBackdropClick);
  closeModalBtn.addEventListener("click", closeModal);
  modalOkBtn.addEventListener("click", closeModal);
  modalLikeBtn.addEventListener("click", onModalLike);
}

function closeModal() {
  modal.hidden = true;
  modalBackdrop.hidden = true;

  document.removeEventListener("keydown", onModalKeydown);
  modalBackdrop.removeEventListener("click", onBackdropClick);
  closeModalBtn.removeEventListener("click", closeModal);
  modalOkBtn.removeEventListener("click", closeModal);
  modalLikeBtn.removeEventListener("click", onModalLike);

  // вернуть фокус
  if (modalOpener && typeof modalOpener.focus === "function") {
    modalOpener.focus();
  }
  modalOpener = null;
  modalTrackId = null;
}

function onBackdropClick() {
  closeModal();
}

function onModalLike() {
  if (!modalTrackId) return;
  const liked = !!state.likes[modalTrackId];
  if (liked) delete state.likes[modalTrackId];
  else state.likes[modalTrackId] = true;

  saveState();
  render();

  const nowLiked = !!state.likes[modalTrackId];
  modalLikeBtn.setAttribute("aria-pressed", String(nowLiked));
  modalLikeBtn.textContent = nowLiked ? "Лайк (уже)" : "Лайк";

  announce(nowLiked ? "Лайк поставлен" : "Лайк снят");
}

function onModalKeydown(e) {
  if (e.key === "Escape") {
    e.preventDefault();
    closeModal();
    return;
  }

  // простой focus trap
  if (e.key === "Tab") {
    const focusables = getFocusable(modal);
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    }
  }
}

function getFocusable(root) {
  const sel = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");
  return $$(sel, root).filter((el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length));
}

/** ---------- Обязательная форма (name/email/message) ---------- */
function initFeedbackForm() {
  const form = $("#feedbackForm");
  const submitBtn = $("#submitBtn");

  const name = $("#name");
  const email = $("#email");
  const message = $("#message");

  const nameError = $("#nameError");
  const emailError = $("#emailError");
  const messageError = $("#messageError");
  const result = $("#formResult");

  const validators = [
    {
      el: name,
      errorEl: nameError,
      check: () => {
        if (!name.value.trim()) return "Введите имя (обязательное поле).";
        return "";
      },
    },
    {
      el: email,
      errorEl: emailError,
      check: () => {
        const v = email.value.trim();
        if (!v) return ""; // e-mail необязательный, но если введён — должен быть валидным
        // лёгкая проверка (плюс браузерная валидация type="email")
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        if (!ok) return "Введите корректный e-mail (например, name@example.com).";
        return "";
      },
    },
    {
      el: message,
      errorEl: messageError,
      check: () => {
        const v = message.value.trim();
        if (!v) return "Введите сообщение (обязательное поле).";
        if (v.length < 20) return "Сообщение должно быть минимум 20 символов.";
        return "";
      },
    },
  ];

  function validateField(v) {
    const msg = v.check();
    v.errorEl.textContent = msg;
    v.el.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  function validateForm() {
    const ok = validators.every(validateField);
    submitBtn.disabled = !ok;
    return ok;
  }

  validators.forEach((v) => {
    v.el.addEventListener("input", () => {
      validateField(v);
      validateForm();
    });
    v.el.addEventListener("blur", () => {
      validateField(v);
      validateForm();
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    result.textContent = "";
    const ok = validateForm();

    if (!ok) {
      // мягко фокусируем первое невалидное
      const firstBad = validators.find((v) => v.el.getAttribute("aria-invalid") === "true");
      if (firstBad) firstBad.el.focus();
      result.textContent = "Форма не отправлена: исправьте ошибки и попробуйте снова.";
      return;
    }

    // “Отправку предотвращать, выводить результат на странице”
    const payload = {
      name: name.value.trim(),
      email: email.value.trim(),
      message: message.value.trim(),
    };

    result.textContent = `Сообщение принято ✅
Имя: ${payload.name}
E-mail: ${payload.email || "—"}
Текст: ${payload.message}`;

    form.reset();
    validators.forEach((v) => {
      v.errorEl.textContent = "";
      v.el.setAttribute("aria-invalid", "false");
    });

    submitBtn.disabled = true;
    announce("Форма отправлена (локально), результат показан на странице");
  });

  // старт: кнопка выключена
  validateForm();
}

/** ---------- Рендер ---------- */
function applyInitialState() {
  setActiveTab(state.activeTab, false);
  updatePillsPressed();
}

function render() {
  const filtered = getFilteredTracks();

  trackListEl.innerHTML = "";
  for (const t of filtered) {
    trackListEl.appendChild(renderTrackCard(t));
  }

  emptyStateEl.hidden = filtered.length !== 0;
}

function renderTrackCard(track) {
  const li = document.createElement("li");
  li.className = "track-card";
  li.dataset.trackId = track.id;

  const liked = !!state.likes[track.id];

  const deletedKey = `deleted_${track.id}`;
  if (state[deletedKey]) {
    // не показываем “удалённые”
    li.hidden = true;
  }

  li.innerHTML = `
    <div class="track-top">
      <div>
        <p class="track-title">${escapeHtml(track.title)}</p>
        <p class="track-meta">${escapeHtml(track.artist)} • ${escapeHtml(genreLabel(track.genre))} • ${escapeHtml(track.duration)}</p>
      </div>
    </div>

    <div class="track-actions">
      <button class="icon-btn" type="button" data-action="play">▶ Играть</button>
      <button class="icon-btn" type="button" data-action="like" aria-pressed="${liked ? "true" : "false"}">
        ${liked ? "★ Лайк" : "☆ Лайк"}
      </button>
      <button class="icon-btn" type="button" data-action="delete">🗑 Удалить</button>
    </div>
  `;

  return li;
}

function getFilteredTracks() {
  const query = (state.query || "").toLowerCase();

  return TRACKS.filter((t) => {
    const deletedKey = `deleted_${t.id}`;
    if (state[deletedKey]) return false;

    const matchesQuery =
      !query ||
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query);

    const byGenre = state.genre === "all" ? true : t.genre === state.genre;
    const byPlaylist = state.playlist === "all" ? true : t.playlist === state.playlist;

    return matchesQuery && byGenre && byPlaylist;
  });
}

/** ---------- Утилиты ---------- */
function announce(text) {
  announceEl.textContent = text;
}

function genreLabel(g) {
  const map = { all: "Все", focus: "Focus", jazz: "Jazz", electro: "Electro" };
  return map[g] || g;
}
function playlistLabel(p) {
  const map = { all: "Все", study: "Учёба", workout: "Тренировка", chill: "Чилл" };
  return map[p] || p;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
