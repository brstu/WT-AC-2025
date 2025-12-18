// ES Module
const quotes = [
  { id: 1, text: 'Жизнь — это то, что с тобой происходит, пока ты строишь планы.', author: 'Джон Леннон', category: 'life', liked: false },
  { id: 2, text: 'Любовь — единственная сила, способная превратить врага в друга.', author: 'Мартин Лютер Кинг', category: 'love', liked: false },
  { id: 3, text: 'Выберите работу по душе, и вам не придется работать ни дня.', author: 'Конфуций', category: 'work', liked: true },
  { id: 4, text: 'Лучший способ предсказать будущее — создать его.', author: 'Питер Друкер', category: 'work', liked: false },
  { id: 5, text: 'Мы — это то, что мы постоянно делаем. Следовательно, совершенство — не действие, а привычка.', author: 'Аристотель', category: 'life', liked: false },
  { id: 6, text: 'Любовь — это когда счастье другого человека важнее собственного.', author: 'Г. Голсуорси', category: 'love', liked: false },
];

let activeCategory = 'all';
let lastFocusedElement = null;
let currentShareQuote = null;

// Helpers
const qs = (sel, parent = document) => parent.querySelector(sel);
const qsa = (sel, parent = document) => [...parent.querySelectorAll(sel)];
const setHidden = (el, hidden) => { el.hidden = !!hidden; };

function renderQuotes() {
  const container = qs('#quotesContainer');
  const search = qs('#searchInput').value.trim().toLowerCase();

  const filtered = quotes.filter(q => {
    const matchesCategory = activeCategory === 'all' ? true : q.category === activeCategory;
    const matchesSearch = (q.text + ' ' + q.author).toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });

  container.innerHTML = filtered.map(q => `
    <article class="card" data-id="${q.id}">
      <header>
        <h3 class="card-title">Цитата</h3>
        <span class="author">${q.author}</span>
      </header>
      <p class="card-text">${q.text}</p>
      <div class="card-actions">
        <button class="button like ${q.liked ? 'liked' : ''}" data-action="like" aria-pressed="${q.liked}" aria-describedby="tooltip">
          ❤️ ${q.liked ? 'Убрать лайк' : 'Лайк'}
        </button>
        <button class="button primary" data-action="share" aria-haspopup="dialog">Поделиться</button>
        <button class="button" data-action="delete">Удалить</button>
      </div>
    </article>
  `).join('');

  // Если категория не all, дублируем в соответствующий таб-панель (для демонстрации)
  ['life', 'love', 'work'].forEach(cat => {
    const panel = qs(`#panel-${cat}`);
    const items = quotes.filter(q => q.category === cat);
    panel.innerHTML = items.map(q => `
      <article class="card" data-id="${q.id}">
        <header>
          <h3 class="card-title">Цитата</h3>
          <span class="author">${q.author}</span>
        </header>
        <p class="card-text">${q.text}</p>
        <div class="card-actions">
          <button class="button like ${q.liked ? 'liked' : ''}" data-action="like" aria-pressed="${q.liked}" aria-describedby="tooltip">
            ❤️ ${q.liked ? 'Убрать лайк' : 'Лайк'}
          </button>
          <button class="button primary" data-action="share" aria-haspopup="dialog">Поделиться</button>
          <button class="button" data-action="delete">Удалить</button>
        </div>
      </article>
    `).join('');
  });
}

function initTabs() {
  const tabs = qsa('[role="tab"]');
  const panels = qsa('[role="tabpanel"]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (e) => {
      const idx = tabs.indexOf(tab);
      if (e.key === 'ArrowRight') tabs[(idx + 1) % tabs.length].focus();
      if (e.key === 'ArrowLeft') tabs[(idx - 1 + tabs.length) % tabs.length].focus();
      if (e.key === 'Enter' || e.key === ' ') activateTab(tab);
    });
  });

  function activateTab(tab) {
    tabs.forEach(t => {
      t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      t.tabIndex = t === tab ? 0 : -1;
    });
    panels.forEach(p => {
      const show = p.id === tab.getAttribute('aria-controls');
      setHidden(p, !show);
    });
    activeCategory = tab.id.replace('tab-', '');
    renderQuotes();
  }
}

function initAccordion() {
  const triggers = qsa('.accordion-trigger');
  triggers.forEach(btn => {
    btn.addEventListener('click', () => togglePanel(btn));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePanel(btn); }
    });
  });
  function togglePanel(btn) {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    const panel = qs(`#${btn.getAttribute('aria-controls')}`);
    setHidden(panel, expanded);
  }
}

function openModal(quote) {
  currentShareQuote = quote;
  lastFocusedElement = document.activeElement;

  const backdrop = qs('#shareModalBackdrop');
  const modal = qs('#shareModal');

  setHidden(backdrop, false);
  setHidden(modal, false);

  // Фокус в модалку
  const firstFocusable = qsa('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])', modal)[0];
  firstFocusable?.focus();

  // Trap focus
  function trap(e) {
    const focusables = qsa('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])', modal);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    } else if (e.key === 'Escape') {
      closeModal();
    }
  }
  modal.addEventListener('keydown', trap);
  modal.dataset.trap = 'true';
}

function closeModal() {
  const backdrop = qs('#shareModalBackdrop');
  const modal = qs('#shareModal');
  setHidden(backdrop, true);
  setHidden(modal, true);
  // Вернуть фокус
  lastFocusedElement?.focus();
}

function initModal() {
  const backdrop = qs('#shareModalBackdrop');
  const modal = qs('#shareModal');
  backdrop.addEventListener('click', closeModal);
  qs('[data-modal-close]').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    const btn = e.target.closest('.share-option');
    if (!btn) return;
    const type = btn.dataset.share;
    if (type === 'copy') {
      const text = `"${currentShareQuote?.text}" — ${currentShareQuote?.author}`;
      navigator.clipboard?.writeText(text).then(() => {
        alert('Текст цитаты скопирован!');
      }).catch(() => {
        alert('Не удалось скопировать. Скопируйте вручную.');
      });
    } else if (type === 'tweet') {
      const url = new URL('https://twitter.com/intent/tweet');
      url.searchParams.set('text', `"${currentShareQuote?.text}" — ${currentShareQuote?.author}`);
      window.open(url, '_blank', 'noopener');
    } else if (type === 'mail') {
      window.location.href = `mailto:?subject=Цитата&body=${encodeURIComponent(`"${currentShareQuote?.text}" — ${currentShareQuote?.author}`)}`;
    }
    closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
}

function initBurger() {
  const burger = qs('.burger');
  const menu = qs('#primary-menu');
  burger.addEventListener('click', () => {
    const expanded = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('show', !expanded);
  });
  burger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); burger.click(); }
  });
}

function initDelegation() {
  // Один обработчик на контейнер: лайк/удалить/поделиться
  document.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    const card = e.target.closest('.card');
    if (!card) return;
    const id = Number(card.dataset.id);
    const quote = quotes.find(q => q.id === id);
    if (!quote) return;

    const action = actionBtn.dataset.action;
    if (action === 'like') {
      quote.liked = !quote.liked;
      renderQuotes();
      // Показать tooltip
      showTooltip(actionBtn, quote.liked ? 'Лайк поставлен' : 'Лайк снят');
    } else if (action === 'delete') {
      const idx = quotes.findIndex(q => q.id === id);
      quotes.splice(idx, 1);
      renderQuotes();
    } else if (action === 'share') {
      openModal(quote);
    }
  });
}

function showTooltip(target, text) {
  const tooltip = qs('#tooltip');
  tooltip.textContent = text;
  tooltip.className = 'tooltip';
  const rect = target.getBoundingClientRect();
  tooltip.style.left = `${rect.left + rect.width / 2}px`;
  tooltip.style.top = `${rect.top + window.scrollY - 8}px`;
  setHidden(tooltip, false);
  setTimeout(() => setHidden(tooltip, true), 1200);
}

function initSearch() {
  const input = qs('#searchInput');
  input.addEventListener('input', renderQuotes);
}

function initForm() {
  const form = qs('#contactForm');
  const submitBtn = qs('#submitBtn');
  const result = qs('#formResult');

  const fields = {
    name: {
      input: qs('#name'),
      errorEl: qs('#nameError'),
      validate: (value) => value.trim() ? '' : 'Введите имя',
    },
    email: {
      input: qs('#email'),
      errorEl: qs('#emailError'),
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Введите корректный e‑mail',
    },
    message: {
      input: qs('#message'),
      errorEl: qs('#messageError'),
      validate: (value) => value.trim().length >= 20 ? '' : 'Сообщение должно быть не короче 20 символов',
    }
  };

  function updateValidity(fieldKey) {
    const { input, errorEl, validate } = fields[fieldKey];
    const error = validate(input.value);
    input.setAttribute('aria-invalid', String(Boolean(error)));
    errorEl.textContent = error;
  }

  function updateSubmitState() {
    const invalid = Object.keys(fields).some(k => fields[k].validate(fields[k].input.value));
    submitBtn.disabled = invalid;
    submitBtn.setAttribute('aria-disabled', String(invalid));
  }

  Object.keys(fields).forEach(k => {
    fields[k].input.addEventListener('input', () => {
      updateValidity(k);
      updateSubmitState();
    });
    fields[k].input.addEventListener('blur', () => {
      updateValidity(k);
      updateSubmitState();
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Проверка всех полей
    Object.keys(fields).forEach(updateValidity);
    updateSubmitState();
    const isValid = !submitBtn.disabled;

    if (isValid) {
      result.textContent = 'Спасибо! Ваше сообщение принято.';
      result.style.color = 'var(--success)';
      form.reset();
      Object.keys(fields).forEach(k => {
        fields[k].input.setAttribute('aria-invalid', 'false');
        fields[k].errorEl.textContent = '';
      });
      updateSubmitState();
    } else {
      result.textContent = 'Проверьте поля формы и исправьте ошибки.';
      result.style.color = 'var(--error)';
    }
  });

  updateSubmitState();
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initAccordion();
  initModal();
  initBurger();
  initDelegation();
  initSearch();
  renderQuotes();
  initForm();
});
