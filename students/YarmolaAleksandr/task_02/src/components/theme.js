/**
 * Компонент переключателя тёмной темы
 * @module components/theme
 */

const THEME_KEY = 'lab02_theme';

/**
 * Инициализирует переключатель темы
 */
export function initTheme() {
  createThemeToggle();
  loadTheme();
}

/**
 * Создаёт кнопку переключения темы
 */
function createThemeToggle() {
  const header = document.querySelector('header');
  if (!header) return;

  const themeToggle = document.createElement('button');
  themeToggle.id = 'theme-toggle';
  themeToggle.className = 'theme-toggle';
  themeToggle.setAttribute('aria-label', 'Переключить тему');
  themeToggle.innerHTML = `
    <svg class="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
    <svg class="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  `;

  themeToggle.addEventListener('click', toggleTheme);
  header.appendChild(themeToggle);
}

/**
 * Загружает сохранённую тему или определяет системную
 */
function loadTheme() {
  let theme = null;

  // Проверяем сохранённую тему
  try {
    theme = localStorage.getItem(THEME_KEY);
  } catch (e) {
    console.warn('localStorage недоступен', e);
  }

  // Если темы нет, проверяем системные настройки
  if (!theme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = prefersDark ? 'dark' : 'light';
  }

  applyTheme(theme);

  // Слушаем изменения системной темы
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    // Применяем только если пользователь не установил тему вручную
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (!savedTheme) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    } catch (err) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/**
 * Переключает тему
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  applyTheme(newTheme);
  
  try {
    localStorage.setItem(THEME_KEY, newTheme);
  } catch (e) {
    console.warn('Не удалось сохранить тему', e);
  }
}

/**
 * Применяет тему к документу
 * @param {string} theme - 'light' или 'dark'
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', 
      theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'
    );
  }

  // Обновляем meta theme-color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.content = theme === 'dark' ? '#1e293b' : '#0f172a';
  }
}
