// scripts/main.js
import { Tabs } from './modules/tabs.js';
import { Tooltip } from './modules/tooltips.js';
import { FormValidator } from './modules/form.js';
import { setupEventDelegation, saveAppState, loadAppState, setupThemeToggle } from './modules/utils.js';

// Инициализация приложения
class GadgetCollection {
    constructor() {
        this.init();
    }

    async init() {
        // Загружаем сохраненное состояние
        const savedState = loadAppState();
        
        // Инициализация компонентов
        this.tabs = new Tabs('.tabs', '.panel', savedState?.activeTab);
        this.tooltip = new Tooltip('[data-tooltip-target]', '.tooltip');
        this.formValidator = new FormValidator('#feedback-form');
        
        // Настройка делегирования событий
        this.setupDelegation();
        
        // Настройка переключателя темы
        setupThemeToggle('#theme-toggle', savedState?.theme);
        
        // Восстановление лайков
        this.restoreLikes(savedState?.likedItems || []);
        
        console.log('Gadget Collection инициализирован!');
    }

    setupDelegation() {
        // Делегирование для лайков
        setupEventDelegation('.gadgets-grid', 'click', '.like-btn', (event, target) => {
            event.preventDefault();
            const likeBtn = target;
            const isLiked = likeBtn.classList.toggle('liked');
            
            // Обновляем иконку
            const icon = likeBtn.querySelector('i');
            if (isLiked) {
                icon.classList.remove('far', 'fa-heart');
                icon.classList.add('fas', 'fa-heart');
                likeBtn.setAttribute('aria-label', likeBtn.getAttribute('aria-label').replace('Добавить', 'Убрать из'));
            } else {
                icon.classList.remove('fas', 'fa-heart');
                icon.classList.add('far', 'fa-heart');
                likeBtn.setAttribute('aria-label', likeBtn.getAttribute('aria-label').replace('Убрать из', 'Добавить'));
            }
            
            // Сохраняем состояние
            saveAppState();
        });

        // Делегирование для удаления
        setupEventDelegation('.gadgets-grid', 'click', '.delete-btn', (event, target) => {
            event.preventDefault();
            const card = target.closest('.gadget-card');
            const gadgetName = card.querySelector('.gadget-title').textContent;
            
            if (confirm(`Удалить "${gadgetName}" из коллекции?`)) {
                card.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    card.remove();
                    saveAppState();
                }, 300);
            }
        });

        // ВОССТАНАВЛИВАЕМ кнопки "Характеристики" (без модалки)
        setupEventDelegation('.gadgets-grid', 'click', '.specs-btn', (event, target) => {
            event.preventDefault();
            const card = target.closest('.gadget-card');
            const gadgetName = card.querySelector('.gadget-title').textContent;
            
            // Показываем информацию в alert вместо модалки
            alert(`Характеристики ${gadgetName}:\n\nЭто демо-версия. В полной версии здесь будет подробная информация о характеристиках устройства.`);
        });
    }

    restoreLikes(likedItems) {
        likedItems.forEach(id => {
            const likeBtn = document.querySelector(`.gadget-card[data-id="${id}"] .like-btn`);
            if (likeBtn) {
                likeBtn.classList.add('liked');
                const icon = likeBtn.querySelector('i');
                icon.classList.remove('far', 'fa-heart');
                icon.classList.add('fas', 'fa-heart');
            }
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем CSS для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(20px); }
        }
        
        .gadget-card {
            animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Исправляем focus стили */
        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible,
        .tab:focus-visible,
        .specs-btn:focus-visible,
        .like-btn:focus-visible,
        .delete-btn:focus-visible {
            outline: 2px solid #2563eb !important;
            outline-offset: 2px !important;
        }
        
        /* Убираем disabled с кнопок характеристик */
        .specs-btn {
            opacity: 1 !important;
            cursor: pointer !important;
        }
        
        .specs-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);

    // Восстанавливаем кнопки "Характеристики" в HTML
    const specsButtons = document.querySelectorAll('.specs-btn');
    specsButtons.forEach(btn => {
        btn.removeAttribute('disabled');
        btn.innerHTML = '<i class="fas fa-info-circle"></i> Характеристики';
        btn.style.opacity = '';
        btn.style.cursor = '';
        
        // Добавляем tabindex если его нет
        if (!btn.hasAttribute('tabindex')) {
            btn.setAttribute('tabindex', '0');
        }
    });

    // Запускаем приложение
    new GadgetCollection();
});

// Экспортируем для тестов
export { GadgetCollection };