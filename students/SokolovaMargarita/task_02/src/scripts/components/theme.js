export function initializeTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // Загрузка сохраненной темы или установка в соответствии с системными настройками
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.dataset.theme = savedTheme;
        themeToggle.textContent = savedTheme === 'dark' ? '🌞' : '🌒';
    } else {
        const isDark = prefersDark.matches;
        document.body.dataset.theme = isDark ? 'dark' : 'light';
        themeToggle.textContent = isDark ? '🌞' : '🌒';
    }

    // Обработчик переключения темы
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.dataset.theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.dataset.theme = newTheme;
        themeToggle.textContent = newTheme === 'dark' ? '🌞' : '🌒';
        localStorage.setItem('theme', newTheme);
    });

    // Обработчик системных предпочтений
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.body.dataset.theme = newTheme;
            themeToggle.textContent = newTheme === 'dark' ? '🌞' : '🌒';
        }
    });
}