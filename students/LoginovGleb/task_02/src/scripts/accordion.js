/**
 * Компонент аккордеона
 * Обрабатывает поведение аккордеона с поддержкой клавиатуры и сохранением состояния в localStorage
 */

const STORAGE_KEY = 'accordion-state';

/**
 * Инициализация аккордеона
 */
export function initAccordion() {
    const accordion = document.querySelector('.accordion');
    if (!accordion) return;

    const buttons = accordion.querySelectorAll('.accordion-button');
    
    // Загрузить сохранённое состояние из localStorage
    loadAccordionState(buttons);
    
    // Добавить обработчики событий для всех кнопок аккордеона
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => toggleAccordion(button));
        
        // Клавиатурная навигация
        button.addEventListener('keydown', (e) => handleKeyboardNavigation(e, buttons, index));
    });
}

/**
 * Переключить панель аккордеона
 * @param {HTMLElement} button - Элемент-кнопка аккордеона
 */
function toggleAccordion(button) {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    const panelId = button.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);
    
    if (!panel) return;
    
    // Переключить состояние
    button.setAttribute('aria-expanded', !isExpanded);
    
    if (isExpanded) {
        // Закрыть панель
        panel.hidden = true;
    } else {
        // Открыть панель
        panel.hidden = false;
    }
    
    // Сохранить состояние в localStorage
    saveAccordionState();
}

/**
 * Обработчик клавиатурной навигации для аккордеона
 * @param {KeyboardEvent} e - Событие клавиатуры
 * @param {NodeList} buttons - Все кнопки аккордеона
 * @param {number} currentIndex - Индекс текущей кнопки
 */
function handleKeyboardNavigation(e, buttons, currentIndex) {
    let newIndex = currentIndex;
    
    switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
            e.preventDefault();
            newIndex = (currentIndex + 1) % buttons.length;
            buttons[newIndex].focus();
            break;
            
        case 'ArrowUp':
        case 'ArrowLeft':
            e.preventDefault();
            newIndex = currentIndex === 0 ? buttons.length - 1 : currentIndex - 1;
            buttons[newIndex].focus();
            break;
            
        case 'Home':
            e.preventDefault();
            buttons[0].focus();
            break;
            
        case 'End':
            e.preventDefault();
            buttons[buttons.length - 1].focus();
            break;
            
        case 'Enter':
        case ' ':
            e.preventDefault();
            toggleAccordion(buttons[currentIndex]);
            break;
    }
}

/**
 * Сохранить состояние аккордеона в localStorage
 */
function saveAccordionState() {
    const buttons = document.querySelectorAll('.accordion-button');
    const state = {};
    
    buttons.forEach(button => {
        const id = button.id;
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        state[id] = isExpanded;
    });
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to save accordion state to localStorage', e);
    }
}

/**
 * Загрузить состояние аккордеона из localStorage
 * @param {NodeList} buttons - Все кнопки аккордеона
 */
function loadAccordionState(buttons) {
    try {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (!savedState) return;
        
        const state = JSON.parse(savedState);
        
        buttons.forEach(button => {
            const id = button.id;
            if (state[id] === true) {
                const panelId = button.getAttribute('aria-controls');
                const panel = document.getElementById(panelId);
                
                if (panel) {
                    button.setAttribute('aria-expanded', 'true');
                    panel.hidden = false;
                }
            }
        });
    } catch (e) {
        console.warn('Failed to load accordion state from localStorage', e);
    }
}
