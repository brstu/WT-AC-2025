const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('primary-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
}

const tabButtons = Array.from(document.querySelectorAll('[role="tab"]'));
const tabPanels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

function activateTab(nextBtn) {
  tabButtons.forEach(btn => {
    const selected = btn === nextBtn;
    btn.setAttribute('aria-selected', String(selected));
    btn.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (panel) panel.hidden = !selected;
  });
  nextBtn.focus();
}

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn));
  btn.addEventListener('keydown', (e) => {
    const i = tabButtons.indexOf(btn);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      activateTab(tabButtons[(i + 1) % tabButtons.length]);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      activateTab(tabButtons[(i - 1 + tabButtons.length) % tabButtons.length]);
    } else if (e.key === 'Home') {
      e.preventDefault(); activateTab(tabButtons[0]);
    } else if (e.key === 'End') {
      e.preventDefault(); activateTab(tabButtons[tabButtons.length - 1]);
    }
  });
});

const accTriggers = Array.from(document.querySelectorAll('.acc-trigger'));
accTriggers.forEach(btn => {
  const panel = document.getElementById(btn.getAttribute('aria-controls'));
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    if (panel) panel.hidden = expanded;
  });
  btn.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && panel) {
      e.preventDefault();
      btn.click();
    }
  });
});

const cards = document.getElementById('cards');
if (cards) {
  cards.addEventListener('click', (e) => {
    const target = e.target;
    const card = target.closest('.card');
    if (!card) return;

    if (target.classList.contains('like-btn')) {
      const pressed = target.getAttribute('aria-pressed') === 'true';
      target.setAttribute('aria-pressed', String(!pressed));
    }

    if (target.classList.contains('delete-btn')) {
      card.remove();
    }

    if (target.classList.contains('review-btn')) {
      openModal();
   
      modalState.contextCardTitle = card.querySelector('h4')?.textContent ?? '';
      document.getElementById('modal-title').textContent = `Отзыв: ${modalState.contextCardTitle || 'Кофейня'}`;
    }
  });
}

const backdrop = document.getElementById('review-backdrop');
const modal = document.getElementById('review-modal');
const closeBtn = document.querySelector('.modal-close');
const openModalButtons = Array.from(document.querySelectorAll('[data-modal-open="review"]'));

const modalState = {
  lastFocus: null,
  contextCardTitle: ''
};

function getFocusable(el) {
  return Array.from(el.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'))
    .filter(n => !n.hasAttribute('disabled') && !n.getAttribute('aria-hidden'));
}

function openModal() {
  modalState.lastFocus = document.activeElement;
  backdrop.hidden = false;
  modal.hidden = false;

  const focusables = getFocusable(modal);
  (focusables[0] ?? modal).focus();

  function trap(e) {
    if (e.key !== 'Tab') return;
    const fs = getFocusable(modal);
    if (fs.length === 0) return;
    const first = fs[0];
    const last = fs[fs.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
  modal.addEventListener('keydown', trap);
  modal.dataset.trap = 'true';
}

function closeModal() {
  backdrop.hidden = true;
  modal.hidden = true;
  if (modal.dataset.trap === 'true') {
    modal.removeEventListener('keydown', () => {});
    delete modal.dataset.trap;
  }
  modalState.contextCardTitle = '';
  modalState.lastFocus?.focus();
}

openModalButtons.forEach(b => b.addEventListener('click', openModal));
closeBtn?.addEventListener('click', closeModal);
backdrop?.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

const form = document.querySelector('.review-form');
const submitBtn = document.querySelector('.submit-btn');
const resultBox = document.getElementById('result');

function setError(id, msg) {
  const box = document.getElementById(`error-${id}`);
  if (box) box.textContent = msg || '';
}
function validateName(value) {
  if (!value || value.trim().length === 0) return 'Введите имя.';
  if (value.trim().length < 2) return 'Минимум 2 символа в имени.';
  return '';
}
function validateEmail(value) {
  if (!value || value.trim().length === 0) return 'Введите e‑mail.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  if (!re.test(value)) return 'Укажите валидный e‑mail.';
  return '';
}
function validateMessage(value) {
  if (!value || value.trim().length === 0) return 'Введите сообщение.';
  if (value.trim().length < 20) return 'Минимум 20 символов.';
  return '';
}

function formIsValid() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;
  return !validateName(name) && !validateEmail(email) && !validateMessage(message);
}

function updateSubmitState() {
  const valid = formIsValid();
  submitBtn.disabled = !valid;
  submitBtn.setAttribute('aria-disabled', String(!valid));
}

['name', 'email', 'message'].forEach(id => {
  const el = document.getElementById(id);
  el?.addEventListener('input', () => {
    let err = '';
    if (id === 'name') err = validateName(el.value);
    if (id === 'email') err = validateEmail(el.value);
    if (id === 'message') err = validateMessage(el.value);
    setError(id, err);
    updateSubmitState();
  });
  el?.addEventListener('blur', () => {

    el.dispatchEvent(new Event('input'));
  });
});

form?.addEventListener('submit', (e) => {
  e.preventDefault();

  const nameEl = document.getElementById('name');
  const emailEl = document.getElementById('email');
  const messageEl = document.getElementById('message');

  setError('name', validateName(nameEl.value));
  setError('email', validateEmail(emailEl.value));
  setError('message', validateMessage(messageEl.value));
  updateSubmitState();

  if (!formIsValid()) {
    resultBox.textContent = 'Форма содержит ошибки. Исправьте поля и попробуйте снова.';
    return;
  }

  resultBox.innerHTML = `
    <strong>Отзыв сохранён:</strong><br>
    <strong>Кофейня:</strong> ${modalState.contextCardTitle || '—'}<br>
    <strong>Имя:</strong> ${nameEl.value}<br>
    <strong>E‑mail:</strong> ${emailEl.value}<br>
    <strong>Сообщение:</strong> ${messageEl.value}
  `;

  form.reset();
  updateSubmitState();
});

updateSubmitState();
