/**
 * Управление списком вопросов
 * @module features/questions
 */

const QUESTIONS_KEY = 'task02_questions';
let questions = [];

/**
 * Инициализирует функциональность списка вопросов
 */
export function initQuestions() {
  loadQuestions();
  renderQuestions();
  setupDeleteHandlers();
}

/**
 * Загружает вопросы из localStorage
 */
function loadQuestions() {
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (raw) {
      questions = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Не удалось загрузить вопросы из localStorage', e);
    questions = [];
  }
}

/**
 * Сохраняет вопросы в localStorage
 */
function saveQuestions() {
  try {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
  } catch (e) {
    console.warn('Не удалось сохранить вопросы в localStorage', e);
  }
}

/**
 * Отрисовывает список вопросов
 */
function renderQuestions() {
  const questionsEl = document.getElementById('questions');
  if (!questionsEl) return;

  questionsEl.innerHTML = '';

  if (questions.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'empty';
    emptyMsg.textContent = 'Пока нет вопросов. Ваш вопрос будет отображён здесь после отправки.';
    questionsEl.appendChild(emptyMsg);
    return;
  }

  questions.forEach(q => {
    const card = createQuestionCard(q);
    questionsEl.appendChild(card);
  });
}

/**
 * Создаёт DOM-элемент карточки вопроса
 * @param {Object} q - Объект вопроса
 * @param {number} q.id - ID вопроса
 * @param {string} q.name - Имя автора
 * @param {string} q.email - Email автора
 * @param {string} q.question - Текст вопроса
 * @param {string} q.date - Дата создания
 * @returns {HTMLElement} Карточка вопроса
 */
function createQuestionCard(q) {
  const card = document.createElement('div');
  card.className = 'card';

  const title = document.createElement('div');
  title.className = 'q-title';
  title.textContent = `${q.name} — ${q.email}`;

  const meta = document.createElement('div');
  meta.className = 'meta';
  
  const time = document.createElement('time');
  // q.date уже отформатированная строка, не пытаемся конвертировать
  time.textContent = q.date;
  meta.appendChild(time);

  const body = document.createElement('div');
  body.className = 'q-body';
  body.textContent = q.question;

  const actions = document.createElement('div');
  actions.className = 'q-actions';

  const btnDelete = document.createElement('button');
  btnDelete.className = 'btn-inline btn-delete';
  btnDelete.textContent = 'Удалить';
  btnDelete.setAttribute('data-id', q.id);
  btnDelete.setAttribute('aria-label', `Удалить вопрос от ${q.name}`);

  actions.appendChild(btnDelete);

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(body);
  card.appendChild(actions);

  return card;
}

/**
 * Настраивает обработчики удаления вопросов (делегирование событий)
 */
function setupDeleteHandlers() {
  const questionsEl = document.getElementById('questions');
  if (!questionsEl) return;

  questionsEl.addEventListener('click', e => {
    const btn = e.target.closest('.btn-delete');
    if (!btn) return;

    const id = btn.getAttribute('data-id');
    if (!id) return;

    if (!confirm('Удалить этот вопрос?')) return;

    deleteQuestion(id);
  });
}

/**
 * Добавляет новый вопрос
 * @param {Object} question - Объект вопроса
 */
export function addQuestion(question) {
  questions.unshift(question);
  saveQuestions();
  renderQuestions();
}

/**
 * Удаляет вопрос по ID
 * @param {string|number} id - ID вопроса
 */
function deleteQuestion(id) {
  questions = questions.filter(q => String(q.id) !== String(id));
  saveQuestions();
  renderQuestions();
}
