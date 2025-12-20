// ====== Утилиты ======
const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];
const createEl = (tag, props = {}, children = []) => {
  const el = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'class') el.className = v;
    else if (k === 'dataset') Object.entries(v).forEach(([dk, dv]) => el.dataset[dk] = dv);
    else if (k in el) el[k] = v;
    else el.setAttribute(k, v);
  });
  children.forEach(c => el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return el;
};

// ====== Бургер-меню ======
const burgerBtn = qs('#burgerBtn');
const mainNav = qs('#mainNav');
burgerBtn?.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  burgerBtn.setAttribute('aria-expanded', String(open));
});

// ====== Табы (фильтры) ======
const tabs = qsa('.tab-btn');
const panels = [qs('#panel-all'), qs('#panel-liked'), qs('#panel-unliked')];
tabs.forEach(tab => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateTab(tab); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const idx = tabs.indexOf(tab);
      const nextIdx = e.key === 'ArrowRight' ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
      tabs[nextIdx].focus();
    }
  });
});
function activateTab(tab) {
  tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
  panels.forEach(p => p.hidden = true);
  tab.setAttribute('aria-selected', 'true');
  const panelId = tab.getAttribute('aria-controls');
  const panel = qs(`#${panelId}`);
  if (panel) panel.hidden = false;
  renderLists(); // обновить фильтрованные списки
}

// ====== Аккордеон ======
qsa('.accordion-trigger').forEach(btn => {
  btn.addEventListener('click', () => toggleAccordion(btn));
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAccordion(btn); }
  });
});
function toggleAccordion(btn) {
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!expanded));
  const panel = qs(`#${btn.getAttribute('aria-controls')}`);
  if (panel) panel.hidden = expanded;
}

// ====== Tooltip ======
const tooltip = qs('#tooltip');
let tooltipAnchor = null;
function showTooltip(anchor, text) {
  tooltipAnchor = anchor;
  tooltip.textContent = text;
  tooltip.hidden = false;
  const rect = anchor.getBoundingClientRect();
  const top = rect.bottom + 8 + window.scrollY;
  const left = rect.left + window.scrollX;
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}
function hideTooltip() {
  tooltip.hidden = true;
  tooltipAnchor = null;
}

// ====== To-Do состояние ======
let todos = []; // { id, text, liked }
let dragSrcId = null;

const todoForm = qs('#todoForm');
const todoInput = qs('#todoInput');
const listAll = qs('#todoList');
const listLiked = qs('#todoListLiked');
const listUnliked = qs('#todoListUnliked');

// Добавление задачи
todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  todos.push({ id: crypto.randomUUID(), text, liked: false });
  todoInput.value = '';
  renderLists();
});

// Рендер по табам
function renderLists() {
  renderList(listAll, todos);
  renderList(listLiked, todos.filter(t => t.liked));
  renderList(listUnliked, todos.filter(t => !t.liked));
}
function renderList(container, items) {
  container.innerHTML = '';
  items.forEach(item => container.appendChild(todoItemEl(item)));
}

// Создание элемента задачи
function todoItemEl(item) {
  const li = createEl('li', {
    class: 'todo-item',
    draggable: true,
    id: `todo-${item.id}`,
    dataset: { id: item.id }
  });

  const handle = createEl('span', { class: 'todo-handle', title: 'Перетащите для сортировки', tabindex: 0 }, ['⋮⋮']);
  handle.addEventListener('focus', () => showTooltip(handle, 'Зажмите и перетащите для сортировки'));
  handle.addEventListener('blur', hideTooltip);

  const text = createEl('div', { class: 'todo-text' }, [item.text]);

  const like = createEl('button', { class: `like-btn${item.liked ? ' liked' : ''}`, 'aria-pressed': String(item.liked) }, ['❤']);
  like.dataset.action = 'like';
  like.setAttribute('aria-label', item.liked ? 'Убрать из любимых' : 'Добавить в любимые');

  const del = createEl('button', { class: 'delete-btn', 'aria-label': 'Удалить задачу' }, ['Удалить']);
  del.dataset.action = 'delete';

  const actions = createEl('div', { class: 'todo-actions' }, [like, del]);
  li.append(handle, text, actions);

  // Drag-n-drop события на элемент
  li.addEventListener('dragstart', (e) => {
    dragSrcId = item.id;
    li.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  });
  li.addEventListener('dragend', () => {
    li.classList.remove('dragging');
    dragSrcId = null;
  });
  li.addEventListener('dragover', (e) => {
    e.preventDefault();
    li.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
  });
  li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
  li.addEventListener('drop', (e) => {
    e.preventDefault();
    li.classList.remove('drag-over');
    const srcId = e.dataTransfer.getData('text/plain') || dragSrcId;
    const dstId = item.id;
    if (!srcId || srcId === dstId) return;
    reorderTodos(srcId, dstId);
  });

  return li;
}

// Пересортировка массива
function reorderTodos(srcId, dstId) {
  const fromIdx = todos.findIndex(t => t.id === srcId);
  const toIdx = todos.findIndex(t => t.id === dstId);
  if (fromIdx < 0 || toIdx < 0) return;
  const [moved] = todos.splice(fromIdx, 1);
  todos.splice(toIdx, 0, moved);
  renderLists();
}

// ====== Делегирование событий на контейнер списков ======
[listAll, listLiked, listUnliked].forEach(container => {
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const li = e.target.closest('.todo-item');
    if (!li) return;
    const id = li.dataset.id;
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const action = btn.dataset.action;
    if (action === 'like') {
      todo.liked = !todo.liked;
      renderLists();
    } else if (action === 'delete') {
      openConfirmModal(id);
    }
  });

  container.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('todo-handle')) {
      e.preventDefault();
      showTooltip(e.target, 'Перемещайте мышью; клавиатурный перенос не реализован');
    }
  });
});

// ====== Модалка подтверждения удаления ======
const modal = qs('#confirmModal');
const confirmYes = qs('#confirmYes');
const confirmNo = qs('#confirmNo');

let pendingDeleteId = null;

function openConfirmModal(id) {
  pendingDeleteId = id;
  modal.hidden = false;
  // фокус на кнопку
  confirmYes.focus();
  document.addEventListener('keydown', onEscClose);
}
function closeConfirmModal() {
  modal.hidden = true;
  pendingDeleteId = null;
  document.removeEventListener('keydown', onEscClose);
}
function onEscClose(e) {
  if (e.key === 'Escape') closeConfirmModal();
}

confirmYes.addEventListener('click', () => {
  if (pendingDeleteId) {
    todos = todos.filter(t => t.id !== pendingDeleteId);
    renderLists();
  }
  closeConfirmModal();
});
modal.addEventListener('click', (e) => {
  if (e.target.dataset.close === 'true') closeConfirmModal();
});
confirmNo.addEventListener('click', () => closeConfirmModal());

// ====== Валидация формы контактов ======
const contactForm = qs('#contactForm');
const nameInput = qs('#name');
const emailInput = qs('#email');
const messageInput = qs('#message');
const submitBtn = qs('#contactSubmit');
const resultBox = qs('#contactResult');

function setError(el, msg) {
  const errorEl = qs(`#${el.id}Error`);
  if (errorEl) errorEl.textContent = msg || '';
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
}
function validateName() {
  const v = nameInput.value.trim();
  if (!v) { setError(nameInput, 'Введите имя'); return false; }
  setError(nameInput, '');
  return true;
}
function validateEmail() {
  const v = emailInput.value.trim();
  // Простой email-паттерн
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  if (!v) { setError(emailInput, 'Введите e‑mail'); return false; }
  if (!ok) { setError(emailInput, 'Введите корректный e‑mail'); return false; }
  setError(emailInput, '');
  return true;
}
function validateMessage() {
  const v = messageInput.value.trim();
  if (!v) { setError(messageInput, 'Введите сообщение'); return false; }
  if (v.length < 20) { setError(messageInput, 'Минимум 20 символов'); return false; }
  setError(messageInput, '');
  return true;
}
function updateSubmitState() {
  const valid = validateName() & validateEmail() & validateMessage(); // побитовое для вызова всех
  submitBtn.disabled = !Boolean(valid);
}

// Валидация при вводе
['input', 'blur'].forEach(evt => {
  nameInput.addEventListener(evt, () => { validateName(); updateSubmitState(); });
  emailInput.addEventListener(evt, () => { validateEmail(); updateSubmitState(); });
  messageInput.addEventListener(evt, () => { validateMessage(); updateSubmitState(); });
});

// Валидация при отправке
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const isName = validateName();
  const isEmail = validateEmail();
  const isMsg = validateMessage();
  updateSubmitState();

  if (isName && isEmail && isMsg) {
    const data = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      message: messageInput.value.trim()
    };
    resultBox.textContent = `Данные готовы к отправке: ${JSON.stringify(data, null, 2)}`;
    contactForm.reset();
    updateSubmitState();
  } else {
    resultBox.textContent = 'Форма содержит ошибки. Исправьте и попробуйте снова.';
  }
});

// ====== Начальная инициализация ======
activateTab(qs('#tab-all'));
renderLists();

// Пример стартовых задач
todos = [
  { id: crypto.randomUUID(), text: 'Купить кофе', liked: false },
  { id: crypto.randomUUID(), text: 'Сделать верстку', liked: true },
  { id: crypto.randomUUID(), text: 'Протестировать доступность', liked: false }
];
renderLists();
