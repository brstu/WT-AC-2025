/**
 * Компонент для отображения toast уведомлений
 */
export class Toast {
    static container = null;
    static toasts = new Map();
    static nextId = 1;

    /**
     * Инициализация контейнера для toast
     */
    static init() {
        this.container = document.querySelector('.toast-container');
        if (!this.container) {
            console.error('Toast container not found');
        }
    }

    /**
     * Показать toast уведомление
     * @param {string} message - Сообщение
     * @param {string} type - Тип (success, error, warning)
     * @param {number} duration - Длительность в мс (0 = не скрывать автоматически)
     */
    static show(message, type = 'success', duration = 3000) {
        if (!this.container) {
            this.init();
        }

        const id = this.nextId++;
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">${icons[type] || icons.success}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;

        this.container.appendChild(toast);
        this.toasts.set(id, toast);

        if (duration > 0) {
            setTimeout(() => this.hide(id), duration);
        }

        return id;
    }

    /**
     * Скрыть toast уведомление
     * @param {number} id - ID toast
     */
    static hide(id) {
        const toast = this.toasts.get(id);
        if (toast) {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                toast.remove();
                this.toasts.delete(id);
            }, 300);
        }
    }

    /**
     * Показать успех
     * @param {string} message - Сообщение
     */
    static success(message) {
        return this.show(message, 'success');
    }

    /**
     * Показать ошибку
     * @param {string} message - Сообщение
     */
    static error(message) {
        return this.show(message, 'error', 5000);
    }

    /**
     * Показать предупреждение
     * @param {string} message - Сообщение
     */
    static warning(message) {
        return this.show(message, 'warning', 4000);
    }

    /**
     * Очистить все toast
     */
    static clear() {
        this.toasts.forEach((_, id) => this.hide(id));
    }
}
