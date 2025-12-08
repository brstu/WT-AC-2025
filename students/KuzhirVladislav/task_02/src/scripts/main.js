document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('add-bookmark');
  const modal = document.getElementById('modal');
  const modalOverlay = modal.querySelector('.modal-overlay');
  const modalClose = modal.querySelector('.modal-close');
  const cancelBtn = document.getElementById('cancel');
  const form = document.getElementById('bookmark-form');
  const saveBtn = document.getElementById('save');
  const searchInput = document.getElementById('search');
  const tooltip = document.getElementById('tooltip');
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('[role="tabpanel"]');

  const storage = {
    personal: [
      {
        id: 1,
        name: 'GitHub',
        url: 'https://github.com',
        description: 'Хранилище кода и открытого ПО. Лучшее место для проектов.',
      },
      {
        id: 2,
        name: 'Figma',
        url: 'https://figma.com',
        description: 'Онлайн-редактор для дизайна интерфейсов и прототипов.',
      },
    ],
    work: [
      {
        id: 3,
        name: 'Google Docs',
        url: 'https://docs.google.com',
        description: 'Онлайн-документы для совместной работы.',
      },
    ],
    study: [
      {
        id: 4,
        name: 'Khan Academy',
        url: 'https://khanacademy.org',
        description: 'Бесплатные уроки по математике и наукам.',
      },
    ],
  };

  let activeTabBtn = document.querySelector('.tab.active');
  let currentTab = activeTabBtn ? activeTabBtn.id.replace('tab-', '') : 'personal';
  let editingId = null;

  function renderBookmarks() {
    const container = document.querySelector(`#panel-${currentTab} .bookmarks-grid`);
    const items = storage[currentTab];
    const query = searchInput.value.toLowerCase();

    container.innerHTML = '';

    const filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.url.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
    );

    const noResults = document.querySelector(`#panel-${currentTab} .no-results`);
    noResults.hidden = filtered.length > 0 || query === '';

    if (filtered.length === 0 && query !== '') {
      return;
    }

    filtered.forEach((bookmark, index) => {
      const card = document.createElement('article');
      card.className = `bookmark-card ${query ? 'filtered' : ''}`;
      card.dataset.id = bookmark.id;
      card.style.transitionDelay = `${index * 0.05}s`;
      card.innerHTML = `
        <h3 class="bookmark-card-title">${escapeHtml(bookmark.name)}</h3>
        <a href="${bookmark.url}" target="_blank" class="bookmark-card-url">${bookmark.url}</a>
        <p class="bookmark-card-description">${escapeHtml(bookmark.description || '')}</p>
        <div class="bookmark-card-actions">
          <button class="action-btn edit-btn" data-tooltip="Редактировать" aria-label="Редактировать закладку ${bookmark.name}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="action-btn delete-btn" data-tooltip="Удалить" aria-label="Удалить закладку ${bookmark.name}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-10 0v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/>
            </svg>
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  }
  function openModal(bookmark = null) {
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const nameInput = modal.querySelector('#name');
    nameInput.focus();
    modal.addEventListener('keydown', trapFocus);
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    form.reset();
    editingId = null;
    document.getElementById('modal-title').textContent = 'Добавить закладку';
    saveBtn.disabled = true;
    clearErrors();
    modal.removeEventListener('keydown', trapFocus);
  }

  function trapFocus(e) {
    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
  }
  function validateForm() {
    let isValid = true;
    clearErrors();

    const name = document.getElementById('name').value.trim();
    const url = document.getElementById('url').value.trim();
    const desc = document.getElementById('description').value.trim();

    if (!name) {
      showError('name', 'Имя обязательно');
      isValid = false;
    }

    if (!url || !isValidURL(url)) {
      showError('url', 'Введите корректный URL (например, https://example.com)');
      isValid = false;
    }

    if (desc && desc.length > 0 && desc.length < 20) {
      showError('description', 'Описание должно быть минимум 20 символов');
      isValid = false;
    }

    saveBtn.disabled = !isValid;
    return isValid;
  }
  function showError(fieldId, message) {
    const errorEl = document.querySelector(`#${fieldId}`).parentElement.querySelector('.error');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }

  function clearErrors() {
    document.querySelectorAll('.error').forEach((el) => {
      el.textContent = '';
      el.style.display = 'none';
    });
  }

  function isValidURL(string) {
    if (!string || typeof string !== 'string') return false;
    const trimmed = string.trim();
    if (trimmed === '') return false;
    // basic invalid chars check
    if (/\s/.test(trimmed)) return false;
    try {
      const withProto = /^(https?:)?\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed;
      const url = new URL(withProto);
      const host = url.hostname;
      if (!host) return false;
      if (host === 'localhost') return true;
      // require a dot in hostname (simple TLD check)
      if (host.indexOf('.') === -1) return false;
      const parts = host.split('.');
      const tld = parts[parts.length - 1];
      if (!tld || tld.length < 2) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const rawUrl = document.getElementById('url').value.trim();
    const normalizedUrl = /^(https?:)?\/\//i.test(rawUrl) ? rawUrl : 'https://' + rawUrl;

    const bookmark = {
      id: editingId || Date.now(),
      name: document.getElementById('name').value.trim(),
      url: normalizedUrl,
      description: document.getElementById('description').value.trim(),
    };

    if (editingId) {
      const index = storage[currentTab].findIndex((b) => b.id === editingId);
      if (index !== -1) storage[currentTab][index] = bookmark;
    } else {
      storage[currentTab].push(bookmark);
    }

    renderBookmarks();
    closeModal();
    showToast(editingId ? 'Закладка обновлена' : 'Закладка добавлена');
  });

  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'toast';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('.edit-btn')) {
      const card = e.target.closest('.bookmark-card');
      const id = Number(card.dataset.id);
      const bookmark = storage[currentTab].find((b) => b.id === id);
      if (bookmark) {
        editingId = id;
        document.getElementById('name').value = bookmark.name;
        document.getElementById('url').value = bookmark.url;
        document.getElementById('description').value = bookmark.description || '';
        document.getElementById('modal-title').textContent = 'Редактировать закладку';
        openModal();
      }
      return;
    }

    if (e.target.closest('.delete-btn')) {
      if (confirm('Удалить эту закладку?')) {
        const card = e.target.closest('.bookmark-card');
        const id = Number(card.dataset.id);
        storage[currentTab] = storage[currentTab].filter((b) => b.id !== id);
        renderBookmarks();
      }
      return;
    }

    const tab = e.target.closest('.tab');
    if (tab && !tab.classList.contains('active')) {
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach((p) => {
        p.classList.remove('active');
        p.setAttribute('hidden', '');
        p.setAttribute('aria-hidden', 'true');
      });

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentTab = tab.id.replace('tab-', '');
      const panel = document.getElementById(`panel-${currentTab}`);
      if (panel) {
        panel.classList.add('active');
        panel.removeAttribute('hidden');
        panel.setAttribute('aria-hidden', 'false');
      }

      searchInput.value = '';
      renderBookmarks();
    }
  });
  document.addEventListener('mouseover', (e) => {
    const btn = e.target.closest('[data-tooltip]');
    if (!btn) {
      tooltip.hidden = true;
      return;
    }

    const content = tooltip.querySelector('.tooltip-content');
    content.textContent = btn.dataset.tooltip;
    tooltip.hidden = false;

    const rect = btn.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    let top = rect.bottom + window.scrollY + 8;
    let left = rect.left + window.scrollX + rect.width / 2;

    if (left + tooltipRect.width / 2 > window.innerWidth) {
      left = window.innerWidth - 20;
    }
    if (top + tooltipRect.height > window.innerHeight) {
      top = rect.top + window.scrollY - tooltipRect.height - 8;
      tooltip.querySelector('.tooltip-arrow').style.borderBottomColor = '#1e293b';
      tooltip.querySelector('.tooltip-arrow').style.borderTopColor = 'transparent';
      tooltip.querySelector('.tooltip-arrow').style.top = '100%';
      tooltip.querySelector('.tooltip-arrow').style.bottom = 'auto';
    } else {
      tooltip.querySelector('.tooltip-arrow').style.borderTopColor = '#1e293b';
      tooltip.querySelector('.tooltip-arrow').style.borderBottomColor = 'transparent';
      tooltip.querySelector('.tooltip-arrow').style.top = 'auto';
      tooltip.querySelector('.tooltip-arrow').style.bottom = '-6px';
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.transform = 'translateX(-50%)';
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('[data-tooltip]')) return;
    tooltip.hidden = true;
  });

  searchInput.addEventListener(
    'input',
    debounce(() => {
      renderBookmarks();
    }, 300)
  );
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  addBtn.addEventListener('click', () => {
    editingId = null;
    document.getElementById('modal-title').textContent = 'Добавить закладку';
    form.reset();
    clearErrors();
    openModal();
  });
  modalOverlay.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
  form.addEventListener('input', validateForm);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const activeTab = document.querySelector('.tab[aria-selected="true"]');
      const direction = e.key === 'ArrowRight' ? 1 : -1;
      const tabsArray = Array.from(tabs);
      const currentIndex = tabsArray.indexOf(activeTab);
      const nextIndex = (currentIndex + direction + tabsArray.length) % tabsArray.length;
      tabsArray[nextIndex].focus();
      tabsArray[nextIndex].click();
      e.preventDefault();
    }
  });
  panels.forEach((p) => {
    if (p.id === `panel-${currentTab}`) {
      p.classList.add('active');
      p.removeAttribute('hidden');
      p.setAttribute('aria-hidden', 'false');
    } else {
      p.classList.remove('active');
      p.setAttribute('hidden', '');
      p.setAttribute('aria-hidden', 'true');
    }
  });
  tabs.forEach((t) => {
    t.setAttribute('aria-selected', t.classList.contains('active') ? 'true' : 'false');
  });
  renderBookmarks();
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fade-in-out {
      0%, 100% { opacity: 0; transform: translate(-50%, 20px); }
      15%, 85% { opacity: 1; transform: translate(-50%, 0); }
    }
    .toast {
      position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
      background: #1e293b; color: white; padding: 1rem 1.5rem; border-radius: 12px;
      z-index: 10000; animation: fade-in-out 3s forwards;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 10%);
    }
    .bookmark-card.filtered {
      animation: fade-in-up 0.3s ease-out;
    }
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .bookmarks {
      display: none;
    }
    .bookmarks.active {
      display: block;
    }
  `;
  document.head.appendChild(style);
});
