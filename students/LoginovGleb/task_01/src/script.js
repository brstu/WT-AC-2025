// Переключение темы
(function () {
  const themeToggle = document.getElementById("themeToggle");
  const html = document.documentElement;

  // Проверяем сохраненную тему или используем системную
  const savedTheme = localStorage.getItem("theme");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  const currentTheme = savedTheme || systemTheme;

  // Устанавливаем начальную тему
  html.setAttribute("data-theme", currentTheme);

  // Обработчик клика по кнопке
  themeToggle.addEventListener("click", function () {
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });

  // Обновляем meta theme-color при переключении темы
  const observer = new MutationObserver(function (mutations) {
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

  observer.observe(html, { attributes: true });
})();
