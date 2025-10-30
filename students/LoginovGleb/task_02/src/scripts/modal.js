/**
 * Компонент модального окна
 * Обрабатывает модальные диалоги с trap фокуса, поддержкой ARIA и клавиатурной навигацией
 */

let lastFocusedElement = null;

/**
 * Инициализация функциональности модального окна
 */
export function initModal() {
    const modal = document.getElementById('video-modal');
    if (!modal) return;
    
    // Найти все кнопки, открывающие модалку
    const openButtons = document.querySelectorAll('[data-video-id]');
    const closeButtons = modal.querySelectorAll('[data-close-modal]');
    
    // Добавить обработчики событий
    openButtons.forEach(button => {
        button.addEventListener('click', () => openModal(button));
    });
    
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });
    
    // Закрытие по клавише Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) {
            closeModal();
        }
    });
}

/**
 * Открыть модалку с видео
 * @param {HTMLElement} trigger - Кнопка, вызвавшая модальное окно
 */
function openModal(trigger) {
    const modal = document.getElementById('video-modal');
    if (!modal) return;
    
    // Сохранить элемент, который был в фокусе
    lastFocusedElement = trigger;
    
    // Получить данные видео из кнопки-триггера
    const videoTitle = trigger.getAttribute('data-video-title');
    const videoUrl = trigger.getAttribute('data-video-url');
    
    // Обновить содержимое модалки
    const modalTitle = modal.querySelector('.modal-title');
    const videoContainer = modal.querySelector('#video-container');
    
    if (modalTitle) {
        modalTitle.textContent = videoTitle || 'Видео';
    }
    
    if (videoContainer && videoUrl) {
        // Добавить параметры в URL для встраивания YouTube (автовоспроизведение, без релевантных видео, минимальный брендинг)
        const separator = videoUrl.includes('?') ? '&' : '?';
        const embedUrl = `${videoUrl}${separator}autoplay=1&rel=0&modestbranding=1`;
        
        videoContainer.innerHTML = `
            <iframe 
                src="${embedUrl}"
                title="${videoTitle || 'Видео'}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen>
            </iframe>
        `;
    }
    
    // Показать модалку
    modal.hidden = false;
    
    // Заблокировать прокрутку body
    document.body.style.overflow = 'hidden';
    
    // Установить фокус на первый фокусируемый элемент внутри модалки
    setTimeout(() => {
        const firstFocusable = getFirstFocusableElement(modal);
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }, 100);
    
    // Настроить trap фокуса
    setupFocusTrap(modal);
}

/**
 * Закрыть модальное окно
 */
function closeModal() {
    const modal = document.getElementById('video-modal');
    if (!modal) return;
    
    // Скрыть модалку
    modal.hidden = true;
    
    // Восстановить прокрутку body
    document.body.style.overflow = '';
    
    // Очистить контейнер с видео, чтобы остановить воспроизведение
    const videoContainer = modal.querySelector('#video-container');
    if (videoContainer) {
        videoContainer.innerHTML = '';
    }
    
    // Вернуть фокус на элемент, который открыл модалку
    if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }
    
    // Удалить trap фокуса
    removeFocusTrap(modal);
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
    if (e.key !== 'Tab') return;
    
    const modal = e.currentTarget;
    const focusableElements = getFocusableElements(modal);
    
    if (focusableElements.length === 0) return;
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    // Если Shift+Tab на первом элементе — перейти к последнему
    if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
    }
    // Если Tab на последнем элементе — перейти к первому
    else if (!e.shiftKey && document.activeElement === lastFocusable) {
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

/**
 * Получить первый фокусируемый элемент в контейнере
 * @param {HTMLElement} container - Контейнер
 * @returns {HTMLElement|null} Первый фокусируемый элемент или null
 */
function getFirstFocusableElement(container) {
    const focusableElements = getFocusableElements(container);
    return focusableElements.length > 0 ? focusableElements[0] : null;
}
