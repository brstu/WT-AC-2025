/**
 * Утилиты для работы с фокусом и доступностью
 * @module utils/focus
 */

/**
 * Получает все фокусируемые элементы в контейнере
 * @param {HTMLElement} container - Контейнер для поиска
 * @returns {HTMLElement[]} Массив фокусируемых элементов
 */
export function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
}

/**
 * Отключает возможность фокусировки элементов в контейнере
 * @param {HTMLElement} container - Контейнер с элементами
 */
export function disableFocusable(container) {
  const els = Array.from(
    container.querySelectorAll('a, button, input, textarea, select, [tabindex]')
  );
  els.forEach(el => {
    if (el.hasAttribute('tabindex')) {
      el.dataset.savedTabindex = el.getAttribute('tabindex');
    }
    el.setAttribute('tabindex', '-1');
  });
}

/**
 * Восстанавливает возможность фокусировки элементов в контейнере
 * @param {HTMLElement} container - Контейнер с элементами
 */
export function restoreFocusable(container) {
  const els = Array.from(
    container.querySelectorAll('[data-saved-tabindex], [tabindex]')
  );
  els.forEach(el => {
    const saved = el.dataset.savedTabindex || el.dataset.savedtabindex;
    if (saved !== undefined) {
      el.setAttribute('tabindex', saved);
      delete el.dataset.savedTabindex;
      delete el.dataset.savedtabindex;
    } else if (el.getAttribute('tabindex') === '-1') {
      el.removeAttribute('tabindex');
    }
  });
}

/**
 * Создаёт ловушку фокуса для модального окна
 * @param {HTMLElement} container - Модальное окно
 * @param {KeyboardEvent} e - Событие нажатия клавиши Tab
 */
export function trapFocus(container, e) {
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) {
    e.preventDefault();
    return;
  }
  
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  
  if (e.shiftKey && document.activeElement === first) {
    last.focus();
    e.preventDefault();
  } else if (!e.shiftKey && document.activeElement === last) {
    first.focus();
    e.preventDefault();
  }
}
