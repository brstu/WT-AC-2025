/**
 * Компонент модального окна подтверждения
 * Заменяет стандартный confirm() для улучшения UX и упрощения тестирования
 */

let resolvePromise = null;
let lastFocusedElement = null;

/**
 * Инициализация функциональности модального окна подтверждения
 */
export function initConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    if (!modal) {
        return;
    }

    const closeButtons = modal.querySelectorAll('[data-close-confirm]');
    const confirmButton = document.getElementById('confirm-delete-btn');

    // Добавить обработчики событий для кнопок закрытия (отмена)
    closeButtons.forEach(button => {
        button.addEventListener('click', () => closeConfirmModal(false));
    });

    // Обработчик кнопки подтверждения
    if (confirmButton) {
        confirmButton.addEventListener('click', () => closeConfirmModal(true));
    }

    // Закрытие по клавише Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) {
            closeConfirmModal(false);
        }
    });
}

/**
 * Открыть модальное окно подтверждения
 * @param {string} message - Сообщение для отображения (опционально)
 * @param {HTMLElement} triggerElement - Элемент, вызвавший модалку
 * @returns {Promise<boolean>} Promise, который резолвится в true (подтверждено) или false (отменено)
 */
export function showConfirmModal(message, triggerElement) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        if (!modal) {
            resolve(false);
            return;
        }

        // Сохранить элемент, который был в фокусе
        lastFocusedElement = triggerElement || document.activeElement;

        // Сохранить resolve для использования при закрытии
        resolvePromise = resolve;

        // Обновить сообщение, если передано
        if (message) {
            const descriptionElement = document.getElementById('confirm-modal-description');
            if (descriptionElement) {
                descriptionElement.textContent = message;
            }
        }

        // Показать модалку
        modal.hidden = false;

        // Заблокировать прокрутку body
        document.body.style.overflow = 'hidden';

        // Установить фокус на кнопку отмены для безопасности
        setTimeout(() => {
            const cancelButton = modal.querySelector('.btn-cancel');
            if (cancelButton) {
                cancelButton.focus();
            }
        }, 100);

        // Настроить trap фокуса
        setupFocusTrap(modal);
    });
}

/**
 * Закрыть модальное окно подтверждения
 * @param {boolean} confirmed - true если подтверждено, false если отменено
 */
function closeConfirmModal(confirmed) {
    const modal = document.getElementById('confirm-modal');
    if (!modal) {
        return;
    }

    // Скрыть модалку
    modal.hidden = true;

    // Восстановить прокрутку body
    document.body.style.overflow = '';

    // Вернуть фокус на элемент, который открыл модалку
    if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }

    // Удалить trap фокуса
    removeFocusTrap(modal);

    // Резолвить promise
    if (resolvePromise) {
        resolvePromise(confirmed);
        resolvePromise = null;
    }
}

/**
 * Установить trap фокуса внутри модального окна
 * @param {HTMLElement} modal - Элемент модального окна
 */
function setupFocusTrap(modal) {
    modal.addEventListener('keydown', handleFocusTrap);
}

/**
 * Удалить trap фокуса
 * @param {HTMLElement} modal - Элемент модального окна
 */
function removeFocusTrap(modal) {
    modal.removeEventListener('keydown', handleFocusTrap);
}

/**
 * Обработчик клавиатурной навигации для trap фокуса
 * @param {KeyboardEvent} e - Событие клавиатуры
 */
function handleFocusTrap(e) {
    if (e.key !== 'Tab') {
        return;
    }

    const modal = e.currentTarget;
    const focusableElements = getFocusableElements(modal);

    if (focusableElements.length === 0) {
        return;
    }

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Если Shift+Tab на первом элементе — перейти к последнему
    if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        // Если Tab на последнем элементе — перейти к первому
        e.preventDefault();
        firstFocusable.focus();
    }
}

/**
 * Получить все фокусируемые элементы внутри контейнера
 * @param {HTMLElement} container - Контейнер
 * @returns {Array} Массив фокусируемых элементов
 */
function getFocusableElements(container) {
    const selector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(container.querySelectorAll(selector));
}
