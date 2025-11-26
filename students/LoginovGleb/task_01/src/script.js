// ============================================
// THEME TOGGLE: Переключение темы с Web Vitals оптимизацией
// ============================================
//
// Web Vitals улучшения:
// - INP: Debouncing для уменьшения задержки взаимодействия
// - INP: RequestAnimationFrame для плавного обновления
// - INP: Passive event listeners
// - LCP: Минимальная блокировка main thread
//
// ============================================

(function () {
  const themeToggle = document.getElementById("themeToggle");
  const html = document.documentElement;

  // Проверяем сохраненную тему или используем системную
  const savedTheme = localStorage.getItem("theme");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  const currentTheme = savedTheme || systemTheme;

  // Устанавливаем начальную тему (до DOMContentLoaded для уменьшения FOUC)
  html.setAttribute("data-theme", currentTheme);

  // INP: Debounce функция для оптимизации
  function debounce(func, wait) {
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

  // INP: Функция обновления темы с requestAnimationFrame
  function updateTheme(newTheme) {
    // Используем requestAnimationFrame для плавного обновления
    requestAnimationFrame(() => {
      html.setAttribute("data-theme", newTheme);

      // Обновляем localStorage асинхронно (не блокирует UI)
      requestIdleCallback(
        () => {
          localStorage.setItem("theme", newTheme);
        },
        { timeout: 1000 }
      );
    });
  }

  // INP: Обработчик клика по кнопке с debouncing (предотвращает множественные клики)
  const handleThemeToggle = debounce(function () {
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    updateTheme(newTheme);
  }, 150); // 150ms debounce для баланса между отзывчивостью и производительностью

  // INP: Passive listener для улучшения scroll performance
  themeToggle.addEventListener("click", handleThemeToggle, { passive: true });

  // INP: Обновляем meta theme-color с оптимизацией
  const observer = new MutationObserver(function (mutations) {
    // Используем requestAnimationFrame для batch updates
    requestAnimationFrame(() => {
      mutations.forEach(function (mutation) {
        if (mutation.attributeName === "data-theme") {
          const theme = html.getAttribute("data-theme");
          const metaThemeColor = document.querySelector(
            'meta[name="theme-color"]'
          );
          if (metaThemeColor) {
            metaThemeColor.setAttribute(
              "content",
              theme === "dark" ? "#0a84ff" : "#0066cc"
            );
          }
        }
      });
    });
  });

  observer.observe(html, { attributes: true });

  // INP: Поддержка клавиатурной навигации (Enter/Space)
  themeToggle.addEventListener(
    "keydown",
    function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleThemeToggle();
      }
    },
    { passive: false } // Не passive т.к. используем preventDefault
  );
})();
