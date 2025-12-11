// scripts/modules/utils.js
export function delegateEvent(parentSelector, eventType, childSelector, callback) {
    document.addEventListener(eventType, (e) => {
        const child = e.target.closest(childSelector);
        if (child) {
            const parent = child.closest(parentSelector);
            if (parent) {
                callback(e, child);
            }
        }
    });
}

export function setupEventDelegation(containerSelector, eventType, targetSelector, callback) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.addEventListener(eventType, (e) => {
        const target = e.target.closest(targetSelector);
        if (target && container.contains(target)) {
            callback(e, target);
        }
    });
}

export function saveAppState() {
    try {
        const state = {
            // Активная вкладка
            activeTab: document.querySelector('.tab.active')?.id || 'apple-tab',
            
            // Лайкнутые гаджеты
            likedItems: Array.from(document.querySelectorAll('.like-btn.liked'))
                .map(btn => btn.closest('.gadget-card')?.dataset.id)
                .filter(id => id),
            
            // Данные формы
            formData: {
                name: document.querySelector('#name')?.value || '',
                email: document.querySelector('#email')?.value || '',
                message: document.querySelector('#message')?.value || ''
            },
            
            // Тема
            theme: document.body.classList.contains('theme-dark') ? 'dark' : 
                   document.body.classList.contains('theme-light') ? 'light' : 'auto',
            
            // Время сохранения
            savedAt: new Date().toISOString()
        };
        
        localStorage.setItem('gadgetCollectionState', JSON.stringify(state));
        console.log('Состояние сохранено:', new Date().toLocaleTimeString());
    } catch (error) {
        console.error('Ошибка при сохранении состояния:', error);
    }
}

export function loadAppState() {
    try {
        const saved = localStorage.getItem('gadgetCollectionState');
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Ошибка при загрузке состояния:', error);
        return null;
    }
}

export function setupThemeToggle(toggleSelector, savedTheme = null) {
    const toggleBtn = document.querySelector(toggleSelector);
    if (!toggleBtn) return;

    // Восстанавливаем сохраненную тему
    if (savedTheme) {
        if (savedTheme === 'dark') {
            document.body.classList.add('theme-dark');
            toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else if (savedTheme === 'light') {
            document.body.classList.add('theme-light');
            toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    toggleBtn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('theme-dark');
        const isLight = document.body.classList.toggle('theme-light');
        
        if (isDark) {
            toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            toggleBtn.setAttribute('aria-label', 'Переключить на светлую тему');
        } else if (isLight) {
            toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            toggleBtn.setAttribute('aria-label', 'Переключить на темную тему');
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-adjust"></i>';
            toggleBtn.setAttribute('aria-label', 'Переключить на системную тему');
        }
        
        // Сохраняем выбор
        saveAppState();
    });
}

// Вспомогательные функции
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        const target = e.target;
        
        // Enter или Space на кликабельном элементе
        if ((e.key === 'Enter' || e.key === ' ') && 
            (target.tagName === 'BUTTON' || 
             target.getAttribute('role') === 'button' ||
             target.classList.contains('tab') ||
             target.classList.contains('nav-link'))) {
            
            e.preventDefault();
            
            // Для Enter
            if (e.key === 'Enter') {
                target.click();
            }
            
            // Для Space (предотвращаем прокрутку страницы)
            if (e.key === ' ') {
                e.preventDefault();
                target.click();
            }
        }
        
        // Tab для навигации по табам
        if (e.key === 'Tab' && target.classList.contains('tab')) {
            const tabs = Array.from(document.querySelectorAll('.tab'));
            const currentIndex = tabs.indexOf(target);
            
            if (e.shiftKey && currentIndex > 0) {
                // Shift+Tab - предыдущая вкладка
                setTimeout(() => tabs[currentIndex - 1].focus(), 10);
            } else if (!e.shiftKey && currentIndex < tabs.length - 1) {
                // Tab - следующая вкладка
                setTimeout(() => tabs[currentIndex + 1].focus(), 10);
            }
        }
    });
}

// Инициализация доступности
export function initAccessibility() {
    // Добавляем tabindex всем интерактивным элементам
    document.querySelectorAll('button, .tab, .nav-link, .specs-btn, .like-btn, .delete-btn')
        .forEach(el => {
            if (!el.hasAttribute('tabindex') && !el.disabled) {
                el.setAttribute('tabindex', '0');
            }
        });
    
    // Убираем tabindex у disabled элементов
    document.querySelectorAll('button:disabled, .submit-btn:disabled')
        .forEach(el => {
            el.setAttribute('tabindex', '-1');
        });
    
    // Настройка клавиатурной навигации
    setupKeyboardNavigation();
}