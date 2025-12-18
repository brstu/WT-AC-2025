export function initializeModal() {
    const modal = document.querySelector('.modal');
    const closeBtn = modal.querySelector('.modal-close');
    let previouslyFocused;

    // Открытие модального окна
    window.openModal = function(content) {
        previouslyFocused = document.activeElement;
        modal.setAttribute('aria-hidden', 'false');
        
        // Установка содержимого
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = content;

        // Фокус на кнопке закрытия
        closeBtn.focus();

        // Trap focus
        modal.addEventListener('keydown', trapFocus);
    };

    // Закрытие модального окна
    function closeModal() {
        modal.setAttribute('aria-hidden', 'true');
        modal.removeEventListener('keydown', trapFocus);
        if (previouslyFocused) {
            previouslyFocused.focus();
        }
    }

    // Обработчики закрытия
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
            closeModal();
        }
    });

    // Focus trap для модального окна
    function trapFocus(e) {
        if (e.key !== 'Tab') return;

        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    }
}