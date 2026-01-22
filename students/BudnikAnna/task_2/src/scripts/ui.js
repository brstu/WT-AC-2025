import { games } from "./data.js";

const LS_KEY = "lab27-liked";

const state = {
  activeGenre: "Все",
  liked: new Set(),
  lastFocusedEl: null,
};

function loadLikes() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) state.liked = new Set(arr);
  } catch (_) {}
}
function saveLikes() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...state.liked]));
  } catch (_) {}
}

function uniqueGenres(items) {
  const set = new Set(items.map((g) => g.genre));
  return ["Все", ...Array.from(set)];
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const ch of children) node.append(ch);
  return node;
}

export function initTabs() {
  loadLikes();

  const tablist = document.getElementById("genre-tabs");
  const panelsWrap = document.getElementById("genre-panels");

  const genres = uniqueGenres(games);

  tablist.innerHTML = "";
  panelsWrap.innerHTML = "";

  genres.forEach((genre, idx) => {
    const tabId = `tab-${idx}`;
    const panelId = `panel-${idx}`;

    const tabBtn = el("button", {
      class: "tab",
      type: "button",
      id: tabId,
      role: "tab",
      "aria-selected": idx === 0 ? "true" : "false",
      "aria-controls": panelId,
      tabindex: idx === 0 ? "0" : "-1",
      text: genre,
    });

    const panel = el("div", {
      class: "tabpanel",
      id: panelId,
      role: "tabpanel",
      "aria-labelledby": tabId,
      ...(idx === 0 ? {} : { hidden: "" }),
    });

    panel.append(el("div", { class: "cards", "data-panel": genre }));

    tablist.append(tabBtn);
    panelsWrap.append(panel);
  });

  setActiveGenre("Все");

  tablist.addEventListener("click", (e) => {
    const btn = e.target.closest('[role="tab"]');
    if (!btn) return;
    setActiveGenre(btn.textContent?.trim() || "Все");
    focusTab(btn);
  });

  tablist.addEventListener("keydown", (e) => {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const current = document.activeElement?.closest('[role="tab"]');
    if (!current) return;

    const idx = tabs.indexOf(current);
    if (idx < 0) return;

    const key = e.key;
    const nextIdx =
      key === "ArrowRight" ? (idx + 1) % tabs.length :
      key === "ArrowLeft" ? (idx - 1 + tabs.length) % tabs.length :
      key === "Home" ? 0 :
      key === "End" ? tabs.length - 1 :
      null;

    if (nextIdx === null) {
      if (key === "Enter" || key === " ") {
        e.preventDefault();
        setActiveGenre(current.textContent?.trim() || "Все");
      }
      return;
    }

    e.preventDefault();
    tabs[nextIdx].focus();
  });

  panelsWrap.addEventListener("click", onCardsClick);

  document.getElementById("accordion")?.addEventListener("click", onAccordionClick);

  document.getElementById("rules-modal")?.addEventListener("click", onModalClick);
}

function focusTab(btn) {
  const tablist = btn.closest('[role="tablist"]');
  const tabs = tablist ? Array.from(tablist.querySelectorAll('[role="tab"]')) : [];
  tabs.forEach((t) => t.setAttribute("tabindex", t === btn ? "0" : "-1"));
}

function setActiveGenre(genre) {
  state.activeGenre = genre;

  const tablist = document.getElementById("genre-tabs");
  const panelsWrap = document.getElementById("genre-panels");
  if (!tablist || !panelsWrap) return;

  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  const panels = Array.from(panelsWrap.querySelectorAll('[role="tabpanel"]'));

  tabs.forEach((t) => {
    const selected = (t.textContent?.trim() || "") === genre;
    t.setAttribute("aria-selected", String(selected));
    if (selected) t.removeAttribute("tabindex");
    else t.setAttribute("tabindex", "-1");
  });

  panels.forEach((p) => {
    const panelGenre = p.querySelector("[data-panel]")?.getAttribute("data-panel");
    const active = panelGenre === genre;
    if (active) p.removeAttribute("hidden");
    else p.setAttribute("hidden", "");
  });

  const activePanel = panels.find((p) => p.querySelector("[data-panel]")?.getAttribute("data-panel") === genre);
  const cardsHost = activePanel?.querySelector(".cards");
  if (!cardsHost) return;

  const filtered = genre === "Все" ? games : games.filter((g) => g.genre === genre);
  renderCards(filtered, cardsHost);
}

function renderCards(list, host) {
  host.innerHTML = "";
  if (list.length === 0) {
    host.append(el("p", { class: "muted", text: "Пока нет игр в этой категории." }));
    return;
  }

  list.forEach((g) => {
    const liked = state.liked.has(g.id);

    const card = el("article", { class: "card", "data-id": g.id });
    const media = el("div", { class: "card__media" }, [
      el("img", {
        src: g.image,
        alt: `Обложка/иконка игры: ${g.title}`,
        loading: "lazy",
        width: "320",
        height: "200",
      })
    ]);

    const title = el("h3", { class: "card__title", text: g.title });
    const meta = el("p", { class: "card__meta", text: `${g.genre} · ${g.players} игроков · ${g.time}` });
    const desc = el("p", { class: "card__desc", text: g.desc });

    const rulesBtn = el("button", {
      class: "btn btn--ghost",
      type: "button",
      "data-action": "open-rules",
      "aria-haspopup": "dialog",
      "aria-controls": "rules-modal",
      text: "Правила",
    });

    const likeBtn = el("button", {
      class: "btn like-btn",
      type: "button",
      "data-action": "toggle-like",
      "aria-pressed": String(liked),
      "aria-label": liked ? `Убрать лайк: ${g.title}` : `Поставить лайк: ${g.title}`,
    }, [
      el("span", { text: liked ? "♥" : "♡", "aria-hidden": "true" }),
      el("span", { text: liked ? "Лайк" : "Нравится" })
    ]);

    const actions = el("div", { class: "card__actions" }, [rulesBtn, likeBtn]);
    const body = el("div", { class: "card__body" }, [title, meta, desc, actions]);

    card.append(media, body);
    host.append(card);
  });
}

function onCardsClick(e) {
  const actionEl = e.target.closest("[data-action]");
  if (!actionEl) return;

  const action = actionEl.getAttribute("data-action");
  const card = e.target.closest(".card");
  const id = card?.getAttribute("data-id");
  if (!id) return;

  if (action === "toggle-like") toggleLike(id, actionEl);
  if (action === "open-rules") {
    const game = games.find((g) => g.id === id);
    if (game) openModal(game, actionEl);
  }
}

function toggleLike(id, btn) {
  const title = games.find((g) => g.id === id)?.title || id;
  const liked = state.liked.has(id);
  if (liked) state.liked.delete(id);
  else state.liked.add(id);
  saveLikes();

  const nowLiked = state.liked.has(id);
  btn.setAttribute("aria-pressed", String(nowLiked));
  btn.setAttribute("aria-label", nowLiked ? `Убрать лайк: ${title}` : `Поставить лайк: ${title}`);

  const icon = btn.querySelector("span");
  const text = btn.querySelectorAll("span")[1];
  if (icon) icon.textContent = nowLiked ? "♥" : "♡";
  if (text) text.textContent = nowLiked ? "Лайк" : "Нравится";
}

function onAccordionClick(e) {
  const btn = e.target.closest(".acc-btn");
  if (!btn) return;

  const expanded = btn.getAttribute("aria-expanded") === "true";
  const panelId = btn.getAttribute("aria-controls");
  const panel = panelId ? document.getElementById(panelId) : null;

  btn.setAttribute("aria-expanded", String(!expanded));
  if (!panel) return;
  if (expanded) panel.setAttribute("hidden", "");
  else panel.removeAttribute("hidden");
}

function onModalClick(e) {
  const closeEl = e.target.closest('[data-action="close-modal"]');
  if (!closeEl) return;
  closeModal();
}

function openModal(game, openerEl) {
  const modal = document.getElementById("rules-modal");
  if (!modal) return;

  state.lastFocusedEl = openerEl instanceof HTMLElement ? openerEl : document.activeElement;

  const title = document.getElementById("modal-title");
  const meta = document.getElementById("modal-meta");
  const content = document.getElementById("modal-content");

  if (title) title.textContent = `Правила: ${game.title}`;
  if (meta) meta.textContent = `${game.genre} · ${game.players} игроков · ${game.time}`;
  if (content) {
    content.innerHTML = "";
    const ul = document.createElement("ul");
    game.rules.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      ul.append(li);
    });
    content.append(ul);
  }

  modal.removeAttribute("hidden");
  document.body.style.overflow = "hidden";

  const focusables = getFocusable(modal);
  (focusables[0] || modal).focus?.();

  document.addEventListener("keydown", onModalKeydown);
}

function closeModal() {
  const modal = document.getElementById("rules-modal");
  if (!modal) return;

  modal.setAttribute("hidden", "");
  document.body.style.overflow = "";
  document.removeEventListener("keydown", onModalKeydown);

  const last = state.lastFocusedEl;
  if (last && typeof last.focus === "function") last.focus();
  state.lastFocusedEl = null;
}

function onModalKeydown(e) {
  const modal = document.getElementById("rules-modal");
  if (!modal || modal.hasAttribute("hidden")) return;

  if (e.key === "Escape") {
    e.preventDefault();
    closeModal();
    return;
  }

  if (e.key !== "Tab") return;

  const focusables = getFocusable(modal);
  if (focusables.length === 0) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;

  if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

function getFocusable(root) {
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
  ];
  return Array.from(root.querySelectorAll(selectors.join(",")))
    .filter((el) => el instanceof HTMLElement && !el.hasAttribute("hidden") && el.getClientRects().length > 0);
}
