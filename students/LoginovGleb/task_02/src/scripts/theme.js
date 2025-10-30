/**
 * Компонент переключения темы
 * Обрабатывает переключение светлой/тёмной темы с сохранением в localStorage
 */

const THEME_STORAGE_KEY = 'theme-preference';
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

/**
 * Инициализация функционала темы
 */
export function initTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;
    
    // Загрузить сохранённую тему или определить системную настройку
    const savedTheme = loadTheme();
    applyTheme(savedTheme);
    updateThemeButton(themeToggle, savedTheme);
    
    // Добавить обработчик клика
    themeToggle.addEventListener('click', () => toggleTheme(themeToggle));
}

/**
 * Переключить тему между светлой и тёмной
 * @param {HTMLElement} button - Кнопка переключения темы
 */
function toggleTheme(button) {
    const currentTheme = document.documentElement.getAttribute('data-theme') || THEMES.LIGHT;
    const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    
    applyTheme(newTheme);
    saveTheme(newTheme);
    updateThemeButton(button, newTheme);
}

/**
 * Применить тему к документу
 * @param {string} theme - Название темы ('light' или 'dark')
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Обновить внешний вид кнопки переключения темы
 * @param {HTMLElement} button - Кнопка переключения темы
 * @param {string} theme - Текущая тема
 */
function updateThemeButton(button, theme) {
    const icon = button.querySelector('.theme-icon');
    if (!icon) return;
    
    if (theme === THEMES.DARK) {
        icon.textContent = '☀️';
        button.setAttribute('aria-label', 'Переключить на светлую тему');
        button.setAttribute('title', 'Переключить на светлую тему');
    } else {
        icon.textContent = '🌙';
        button.setAttribute('aria-label', 'Переключить на тёмную тему');
        button.setAttribute('title', 'Переключить на тёмную тему');
    }
}

/**
 * Сохранить предпочтение темы в localStorage
 * @param {string} theme - Тема для сохранения
 */
function saveTheme(theme) {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
        console.warn('Failed to save theme to localStorage', e);
    }
}

/**
 * Загрузить предпочтение темы из localStorage или использовать системную настройку
 * @returns {string} Выбранная тема
 */
function loadTheme() {
    try {
    // Попытка загрузить из localStorage
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === THEMES.LIGHT || savedTheme === THEMES.DARK) {
            return savedTheme;
        }
    } catch (e) {
        console.warn('Failed to load theme from localStorage', e);
    }
    
    // В противном случае — системная настройка
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return THEMES.DARK;
    }
    
    return THEMES.LIGHT;
}

/**
 * Отслеживать изменение системной темы
 */
export function watchSystemTheme() {
    if (!window.matchMedia) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
        // Применять только если пользователь не установил своё предпочтение
        try {
            const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
            if (!savedTheme) {
                const newTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
                applyTheme(newTheme);
                
                const themeToggle = document.querySelector('.theme-toggle');
                if (themeToggle) {
                    updateThemeButton(themeToggle, newTheme);
                }
            }
        } catch (err) {
            console.warn('Error handling system theme change', err);
        }
    });
}
