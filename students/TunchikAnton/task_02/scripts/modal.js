// scripts/modules/modal.js
export class Modal {
    constructor(overlaySelector, closeSelector, getContentCallback) {
        this.overlay = document.querySelector(overlaySelector);
        this.closeBtn = document.querySelector(closeSelector);
        this.modalTitle = this.overlay.querySelector('#modal-title');
        this.modalContent = this.overlay.querySelector('#modal-content');
        this.getContentCallback = getContentCallback;
        
        this.init();
    }

    init() {
        // Обработчики закрытия
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.overlay.hasAttribute('hidden')) {
                this.close();
            }
        });

        // Фокусировка внутри модалки
        this.trapFocus();
    }

    open(modalId, title) {
        // Устанавливаем заголовок
        this.modalTitle.textContent = title;
        
        // Загружаем контент
        if (this.getContentCallback) {
            this.modalContent.innerHTML = this.getContentCallback(modalId);
        }

        // Показываем модалку
        this.overlay.removeAttribute('hidden');
        this.overlay.setAttribute('aria-modal', 'true');
        
        // Отключаем скролл на фоне
        document.body.style.overflow = 'hidden';
        
        // Фокусируемся на кнопке закрытия
        setTimeout(() => {
            this.closeBtn.focus();
        }, 10);

        // Сохраняем текущий активный элемент
        this.previousActiveElement = document.activeElement;
    }

    close() {
        // Скрываем модалку
        this.overlay.setAttribute('hidden', '');
        this.overlay.setAttribute('aria-modal', 'false');
        
        // Восстанавливаем скролл
        document.body.style.overflow = '';
        
        // Возвращаем фокус
        if (this.previousActiveElement) {
            this.previousActiveElement.focus();
        }
    }

    trapFocus() {
        const focusableElements = this.overlay.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        this.overlay.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

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
        });
    }
}