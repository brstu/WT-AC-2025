// scripts/modules/tooltips.js
export class Tooltip {
    constructor(triggerSelector, tooltipSelector) {
        this.triggers = document.querySelectorAll(triggerSelector);
        this.tooltips = document.querySelectorAll(tooltipSelector);
        
        this.init();
    }

    init() {
        this.triggers.forEach(trigger => {
            const tooltipId = trigger.getAttribute('aria-describedby');
            const tooltip = document.getElementById(tooltipId);
            
            if (!tooltip) return;

            // Показ при фокусе/ховере
            trigger.addEventListener('mouseenter', () => this.showTooltip(trigger, tooltip));
            trigger.addEventListener('focus', () => this.showTooltip(trigger, tooltip));
            
            // Скрытие
            trigger.addEventListener('mouseleave', () => this.hideTooltip(tooltip));
            trigger.addEventListener('blur', () => this.hideTooltip(tooltip));
            
            // Для сенсорных устройств
            trigger.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.toggleTooltip(trigger, tooltip);
            });
        });

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllTooltips();
            }
        });
    }

    showTooltip(trigger, tooltip) {
        // Сначала скрываем все тултипы
        this.hideAllTooltips();
        
        // Показываем нужный тултип
        tooltip.removeAttribute('hidden');
        tooltip.style.position = 'fixed';
        
        // Позиционируем относительно триггера
        const triggerRect = trigger.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Позиционируем сверху
        let top = triggerRect.top - tooltipRect.height - 10;
        let left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        
        // Если не помещается сверху, показываем снизу
        if (top < 10) {
            top = triggerRect.bottom + 10;
        }
        
        // Корректируем по горизонтали
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        
        // Добавляем ARIA
        trigger.setAttribute('aria-expanded', 'true');
    }

    hideTooltip(tooltip) {
        tooltip.setAttribute('hidden', '');
        const trigger = document.querySelector(`[aria-describedby="${tooltip.id}"]`);
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
        }
    }

    hideAllTooltips() {
        this.tooltips.forEach(tooltip => {
            tooltip.setAttribute('hidden', '');
        });
        
        this.triggers.forEach(trigger => {
            trigger.setAttribute('aria-expanded', 'false');
        });
    }

    toggleTooltip(trigger, tooltip) {
        if (tooltip.hasAttribute('hidden')) {
            this.showTooltip(trigger, tooltip);
        } else {
            this.hideTooltip(tooltip);
        }
    }
}