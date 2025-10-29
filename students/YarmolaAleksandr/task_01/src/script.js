// Переключатель темы
const toggleBtn = document.getElementById('theme-toggle');

// Проверяем сохранённую тему или системные настройки
function getPreferredTheme() {
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
  } catch (e) {
    // localStorage недоступен
  }
  
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
}

// Применяем тему
function applyTheme(theme) {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.style.setProperty('--color-bg', '#121212');
    root.style.setProperty('--color-text', '#f5f5f5');
    root.style.setProperty('--color-accent', '#39f');
    root.style.setProperty('--color-accent-contrast', '#000');
    root.style.setProperty('--color-section-bg', '#262626');
    root.style.setProperty('--color-footer-bg', '#1a1a1a');
    root.style.setProperty('--color-border', '#444');
    
    if (toggleBtn) toggleBtn.textContent = '☀️';
  } else {
    root.style.setProperty('--color-bg', '#fff');
    root.style.setProperty('--color-text', '#222');
    root.style.setProperty('--color-accent', '#05b');
    root.style.setProperty('--color-accent-contrast', '#fff');
    root.style.setProperty('--color-section-bg', '#eaeaea');
    root.style.setProperty('--color-footer-bg', '#eee');
    root.style.setProperty('--color-border', '#ccc');
    
    if (toggleBtn) toggleBtn.textContent = '🌙';
  }
  
  try {
    localStorage.setItem('theme', theme);
  } catch (e) {
    // Игнорируем ошибки localStorage
  }
}

// Инициализация темы при загрузке
if (toggleBtn) {
  applyTheme(getPreferredTheme());

  // Обработчик клика по кнопке
  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.style.getPropertyValue('--color-bg') === '#121212' ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  });

  // Отслеживание изменения системной темы
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    try {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    } catch (err) {
      // Игнорируем ошибки localStorage
    }
  });
}

