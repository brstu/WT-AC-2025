class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');
        this.init();
    }

    init() {
        // Проверяем системные настройки и сохраненную тему
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            this.enableDarkTheme();
        } else {
            this.enableLightTheme();
        }

        // Обработчик переключения темы
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Слушаем изменения системной темы
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                e.matches ? this.enableDarkTheme() : this.enableLightTheme();
            }
        });
    }

    toggleTheme() {
        if (document.body.classList.contains('dark-theme')) {
            this.enableLightTheme();
        } else {
            this.enableDarkTheme();
        }
    }

    enableDarkTheme() {
        document.body.classList.add('dark-theme');
        this.themeIcon.textContent = '☀️';
        this.themeToggle.setAttribute('aria-label', 'Переключить на светлую тему');
        localStorage.setItem('theme', 'dark');
    }

    enableLightTheme() {
        document.body.classList.remove('dark-theme');
        this.themeIcon.textContent = '🌙';
        this.themeToggle.setAttribute('aria-label', 'Переключить на темную тему');
        localStorage.setItem('theme', 'light');
    }
}

export default ThemeManager;