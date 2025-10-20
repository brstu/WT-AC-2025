// === Константы и DOM-элементы ===
const ACTIVE_TAB_KEY = 'lab02_active_tab';

const tabs = Array.from(document.querySelectorAll('.tabs [role="tab"]'));
const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.modal-close');
const main = document.querySelector('main');
let lastActiveElement = null;

// === Табы: обработчики клавиатуры ===
tabs.forEach((tab, index) => {
  tab.setAttribute('tabindex', tab.getAttribute('aria-selected') === 'true' ? '0' : '-1');
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      const next = (index + delta + tabs.length) % tabs.length;
      tabs[next].focus();
      activateTab(tabs[next]);
      e.preventDefault();
    } else if (e.key === 'Home') {
      tabs[0].focus();
      activateTab(tabs[0]);
      e.preventDefault();
    } else if (e.key === 'End') {
      tabs[tabs.length - 1].focus();
      activateTab(tabs[tabs.length - 1]);
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      activateTab(tab);
      e.preventDefault();
    }
  });
});

// === Активация вкладки ===
function activateTab(tab){
  tabs.forEach(t => {
    const selected = t === tab;
    t.setAttribute('aria-selected', selected ? 'true' : 'false');
    t.setAttribute('tabindex', selected ? '0' : '-1');
  });

  panels.forEach(p => {
    const visible = p.id === tab.getAttribute('aria-controls');
    p.hidden = !visible;
    p.setAttribute('aria-hidden', visible ? 'false' : 'true');
  });

  if (tab && tab.id) {
    try { localStorage.setItem(ACTIVE_TAB_KEY, tab.id); } catch (e) { /* ignore */ }
  }
}

// === Делегирование событий для кнопок уроков ===
document.querySelectorAll('.lessons').forEach(list => {
  list.addEventListener('click', e => {
    const btn = e.target.closest('.view-btn');
    if(!btn) return;
    const li = btn.closest('li');
    openModal(li.dataset.id, li.textContent.replace('Просмотр','').trim(), btn);
  });
});

// === Модальное окно: открытие ===
function openModal(id, title, opener){
  lastActiveElement = opener || document.activeElement;
  modalTitle.textContent = title;

  const metaById = {
    'html-1': { authors: ['Иван Иванов', 'Мария Петрова'], duration: '40 мин', tags: ['HTML', 'Семантика', 'Формы'], level: 'Начальный' },
    'html-2': { authors: ['Мария Петрова'], duration: '55 мин', tags: ['HTML', 'Доступность', 'Формы'], level: 'Начальный' },
    'css-1': { authors: ['Олег Смирнов'], duration: '60 мин', tags: ['CSS', 'Flexbox'], level: 'Начальный' },
    'css-2': { authors: ['Елена Новикова'], duration: '50 мин', tags: ['CSS', 'Адаптивность'], level: 'Средний' },
    'js-1': { authors: ['Анна Кузнецова'], duration: '75 мин', tags: ['JavaScript', 'DOM'], level: 'Средний' },
    'js-2': { authors: ['Сергей Ковалёв'], duration: '80 мин', tags: ['JavaScript', 'События'], level: 'Средний' }
  };
  const meta = metaById[id] || { authors: ['Преподаватель'], duration: '30 мин', tags: ['Общее'], level: 'Общий' };

  const topicsById = {
    'html-1': [
      'Структура HTML-документа: <!doctype>, head и body',
      'Семантические элементы: header, main, article, section, footer',
      'Практика: создание простой страницы с семантикой'
    ],
    'html-2': [
      'Формы: input, textarea, select и их типы',
      'Ассоциированные label и улучшение UX для форм',
      'ARIA-атрибуты и базовая доступность форм'
    ],
    'css-1': [
      'Flex container: display, flex-direction, flex-wrap',
      'Flex items: flex-grow, flex-shrink, flex-basis',
      'Практическая верстка: адаптивные карточки и навигация'
    ],
    'css-2': [
      'Mobile‑first подход и планирование точек перелома',
      'Медиазапросы, относительные единицы и макеты под разные экраны',
      'Оптимизация изображений и responsive techniques'
    ],
    'js-1': [
      'Навигация по DOM: parentNode, children, querySelector',
      'Создание/удаление элементов, DocumentFragment для производительности',
      'Практическое задание: динамическая галерея'
    ],
    'js-2': [
      'Пропагирование событий: capture vs bubble',
      'Делегирование событий: почему и когда использовать',
      'Паттерны: отписка обработчиков, предотвращение утечек'
    ]
  };

  const topics = topicsById[id] || [
    'Краткий обзор темы и цели занятия',
    'Практическая часть с пошаговыми заданиями',
    'Домашнее задание и полезные ресурсы'
  ];

  modalBody.innerHTML = `
    <div class="lesson-meta">
      <p class="muted small"><strong>Преподаватели:</strong> ${meta.authors.join(', ')} · <strong>Уровень:</strong> ${meta.level} · <strong>Длительность:</strong> ${meta.duration}</p>
    </div>
    <h4>Темы урока</h4>
    <ul class="lesson-topics">
      ${topics.map(t => `<li>${t}</li>`).join('')}
    </ul>
    <h4>Что вы получите</h4>
    <p>После урока вы освоите практические приёмы и получите задания для закрепления материала. Рекомендуется иметь под рукой редактор кода и браузер для отладки.</p>
  `;
  modal.setAttribute('aria-hidden','false');
  if (main) main.setAttribute('aria-hidden', 'true');

  restoreFocusable(modal);
  const modalContent = modal.querySelector('.modal-content');
  if (modalContent && typeof modalContent.focus === 'function') modalContent.focus();

  document.addEventListener('keydown', handleModalKeydown);
}

// === Модальное окно: закрытие ===
function closeModal(){
  modal.setAttribute('aria-hidden','true');
  if (main) main.removeAttribute('aria-hidden');
  disableFocusable(modal);
  document.removeEventListener('keydown', handleModalKeydown);
  try{ if(lastActiveElement && typeof lastActiveElement.focus === 'function') lastActiveElement.focus(); }catch(e){}
  lastActiveElement = null;
}

closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if(e.target === modal) closeModal(); });

// === Модальное окно: обработка клавиш ===
function handleModalKeydown(e){
  if (e.key === 'Escape') { closeModal(); return; }
  if (e.key === 'Tab') {
    const focusable = getFocusableElements(modal);
    if (focusable.length === 0) { e.preventDefault(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }
}

// === Утилиты для работы с фокусом ===
function getFocusableElements(container){
  return Array.from(container.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'))
    .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
}

function disableFocusable(container){
  const els = Array.from(container.querySelectorAll('a, button, input, textarea, select, [tabindex]'));
  els.forEach(el => {
    if (el.hasAttribute('tabindex')) el.dataset._savedTabindex = el.getAttribute('tabindex');
    el.setAttribute('tabindex', '-1');
  });
}

function restoreFocusable(container){
  const els = Array.from(container.querySelectorAll('[data-_saved-tabindex], [tabindex]'));
  els.forEach(el => {
    if (el.dataset._savedTabindex !== undefined) {
      el.setAttribute('tabindex', el.dataset._savedTabindex);
      delete el.dataset._savedTabindex;
    } else if (el.getAttribute('tabindex') === '-1') {
      el.removeAttribute('tabindex');
    }
  });
}

// === Форма: элементы и состояние ===
const form = document.getElementById('question-form');
const submitBtn = document.getElementById('submit-btn');
const fields = Array.from(form.querySelectorAll('input,textarea'));
const questionsEl = document.getElementById('questions');
let questions = [];

// === Вопросы: загрузка из localStorage ===
function loadQuestions(){
  try{
    const raw = localStorage.getItem('task02_questions');
    if(raw) questions = JSON.parse(raw);
  }catch(e){ questions = []; }
  renderQuestions();
}

// === Вопросы: сохранение в localStorage ===
function saveQuestions(){
  try{ localStorage.setItem('task02_questions', JSON.stringify(questions)); }catch(e){}
}

// === Вопросы: отрисовка списка ===
function renderQuestions(){
  if(!questionsEl) return;
  questionsEl.innerHTML = '';
  if(questions.length === 0){
    const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'Пока нет вопросов. Ваш вопрос будет отображён здесь после отправки.';
    questionsEl.appendChild(p);
    return;
  }
  questions.forEach(q => {
    const card = document.createElement('div'); card.className = 'card';
    const title = document.createElement('div'); title.className = 'q-title'; title.textContent = q.name + ' — ' + q.email;
    const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = q.date;
    const body = document.createElement('div'); body.className = 'q-body'; body.textContent = q.question;
    const actions = document.createElement('div'); actions.className = 'q-actions';
    const btnDelete = document.createElement('button'); btnDelete.className = 'btn-inline btn-delete'; btnDelete.textContent = 'Удалить';
    btnDelete.setAttribute('data-id', q.id);
    actions.appendChild(btnDelete);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(body);
    card.appendChild(actions);
    questionsEl.appendChild(card);
  });
}

// === Утилиты ===
function formatDate(d){
  const dt = new Date(d);
  return dt.toLocaleString();
}

function validateField(field){
  const err = field.parentElement.querySelector('.error');
  if(!field.checkValidity()){
    if(field.validity.valueMissing) err.textContent = 'Поле обязательно';
    else if(field.validity.typeMismatch) err.textContent = 'Неверный формат';
    else if(field.validity.tooShort) err.textContent = `Минимум ${field.getAttribute('minlength')} символов`;
    else err.textContent = 'Неверное значение';
    return false;
  }
  err.textContent = '';
  return true;
}

// === Форма: валидация при вводе ===
fields.forEach(f => {
  f.addEventListener('input', () => {
    validateField(f);
    submitBtn.disabled = !fields.every(validateField);
  });
});

// === Форма: отправка ===
form.addEventListener('submit', e => {
  e.preventDefault();
  const ok = fields.map(validateField).every(Boolean);
  if(!ok) return;
  const data = Object.fromEntries(new FormData(form));
  const q = { id: Date.now(), name: data.name, email: data.email, question: data.question, date: formatDate(Date.now()) };
  questions.unshift(q);
  saveQuestions();
  renderQuestions();
  form.reset();
  submitBtn.disabled = true;

  const result = document.getElementById('result');
  if (result) {
    result.textContent = `Сообщение отправлено. Спасибо, ${q.name}!`;
    setTimeout(() => result.textContent = '', 4000);
  }
});

// === Вопросы: делегированное удаление ===
if (questionsEl) {
  questionsEl.addEventListener('click', e => {
    const btn = e.target.closest('.btn-delete');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (!id) return;
    if (!confirm('Удалить этот вопрос?')) return;
    questions = questions.filter(q => String(q.id) !== String(id));
    saveQuestions();
    renderQuestions();
  });
}

// === Инициализация при загрузке ===
submitBtn.disabled = true;

document.addEventListener('DOMContentLoaded', () => {
  let initialTab = null;
  try {
    const saved = localStorage.getItem(ACTIVE_TAB_KEY);
    if (saved) initialTab = document.getElementById(saved);
  } catch (e) { /* ignore */ }

  if (!initialTab) {
    initialTab = document.querySelector('.tabs [role="tab"][aria-selected="true"]') || tabs[0];
  }
  if (initialTab) activateTab(initialTab);

  disableFocusable(modal);
  loadQuestions();
});