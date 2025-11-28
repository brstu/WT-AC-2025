/**
 * Компонент модального окна
 * @module components/modal
 */

import { disableFocusable, restoreFocusable, trapFocus } from '../utils/focus.js';
import { getLessonMeta, getLessonTopics } from '../data/lessons.js';

let lastActiveElement = null;
let keydownHandler = null;

/**
 * Инициализирует модальное окно
 */
export function initModal() {
  const modal = document.getElementById('modal');
  const closeBtn = document.querySelector('.modal-close');
  const main = document.querySelector('main');

  // Изначально отключаем фокус в модальном окне
  disableFocusable(modal);

  // Делегирование событий для кнопок просмотра уроков
  document.querySelectorAll('.lessons').forEach(list => {
    list.addEventListener('click', e => {
      const btn = e.target.closest('.view-btn');
      if (!btn) return;
      
      const li = btn.closest('li');
      const lessonId = li.dataset.id;
      const lessonTitle = li.textContent.replace('Просмотр', '').trim();
      
      openModal(lessonId, lessonTitle, btn);
    });
  });

  // Закрытие модального окна
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeModal());
  }

  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
}

/**
 * Открывает модальное окно с содержимым урока
 * @param {string} id - ID урока
 * @param {string} title - Название урока
 * @param {HTMLElement} opener - Элемент, открывший модалку
 */
function openModal(id, title, opener) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const main = document.querySelector('main');

  lastActiveElement = opener || document.activeElement;

  // Установка заголовка
  modalTitle.textContent = title;

  // Получение данных урока
  const meta = getLessonMeta(id);
  const topics = getLessonTopics(id);

  // Формирование контента
  modalBody.innerHTML = `
    <div class="lesson-meta">
      <p class="muted small">
        <strong>Преподаватели:</strong> ${meta.authors.join(', ')} · 
        <strong>Уровень:</strong> ${meta.level} · 
        <strong>Длительность:</strong> ${meta.duration}
      </p>
    </div>
    <h4>Темы урока</h4>
    <ul class="lesson-topics">
      ${topics.map(t => `<li>${t}</li>`).join('')}
    </ul>
    <h4>Что вы получите</h4>
    <p>После урока вы освоите практические приёмы и получите задания для закрепления материала. Рекомендуется иметь под рукой редактор кода и браузер для отладки.</p>
  `;

  // Показываем модальное окно
  modal.setAttribute('aria-hidden', 'false');
  if (main) main.setAttribute('aria-hidden', 'true');

  // Восстанавливаем фокусировку элементов
  restoreFocusable(modal);

  // Фокус на содержимое модалки
  const modalContent = modal.querySelector('.modal-content');
  if (modalContent && typeof modalContent.focus === 'function') {
    modalContent.focus();
  }

  // Обработчик клавиатуры для модального окна
  keydownHandler = (e) => handleModalKeydown(e);
  document.addEventListener('keydown', keydownHandler);
}

/**
 * Закрывает модальное окно
 */
function closeModal() {
  const modal = document.getElementById('modal');
  const main = document.querySelector('main');

  modal.setAttribute('aria-hidden', 'true');
  if (main) main.removeAttribute('aria-hidden');

  disableFocusable(modal);

  // Удаляем обработчик клавиатуры
  if (keydownHandler) {
    document.removeEventListener('keydown', keydownHandler);
    keydownHandler = null;
  }

  // Возвращаем фокус на элемент, который открыл модалку
  try {
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  } catch (e) {
    console.warn('Не удалось вернуть фокус', e);
  }

  lastActiveElement = null;
}

/**
 * Обработчик клавиш для модального окна
 * @param {KeyboardEvent} e - Событие клавиатуры
 */
function handleModalKeydown(e) {
  const modal = document.getElementById('modal');

  if (e.key === 'Escape') {
    closeModal();
    return;
  }

  if (e.key === 'Tab') {
    trapFocus(modal, e);
  }
}
