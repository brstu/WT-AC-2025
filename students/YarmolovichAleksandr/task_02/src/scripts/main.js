/*jslint
  browser,
  long,
  this,
  devel
*/

document.addEventListener("DOMContentLoaded", function () {
  // ===== Бургер-меню =====
  const burger = document.getElementById("burger");
  const nav = document.getElementById("main-nav");

  burger.addEventListener("click", function () {
    const expanded = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!expanded));
    burger.textContent = expanded
      ? "☰"
      : "✖";

    if (expanded) {
      nav.setAttribute("hidden", "");
    } else {
      nav.removeAttribute("hidden");
    }
  });

  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A" && window.innerWidth <= 768) {
      nav.setAttribute("hidden", "");
      burger.setAttribute("aria-expanded", "false");
      burger.textContent = "☰";
    }
  });

  // ===== Переключатель темы =====
  const toggleBtn = document.getElementById("theme-toggle");
  const body = document.body;

  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-theme");
    toggleBtn.textContent = "☀️ Светлая тема";
  }

  toggleBtn.addEventListener("click", function () {
    const dark = body.classList.toggle("dark-theme");
    toggleBtn.textContent = dark
      ? "☀️ Светлая тема"
      : "🌙 Тёмная тема";
    localStorage.setItem("theme", dark ? "dark" : "light");
  });

  // ===== Аккордеон FAQ =====
  document.querySelectorAll(".accordion button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));

      const content = document.getElementById(
        btn.getAttribute("aria-controls")
      );

      content.hidden = expanded;
    });
  });

  // ===== Модальное окно =====
  const modal = document.getElementById("modal");
  const openModalBtn = document.getElementById("open-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const form = document.getElementById("modal-form");
  const submitBtn = document.getElementById("submit-btn");
  const nameInput = form.elements.name;
  const emailInput = form.elements.email;
  const messageInput = form.elements.message;
  const nameError = document.getElementById("name-error");
  const emailError = document.getElementById("email-error");
  const messageError = document.getElementById("message-error");
  const formResult = document.getElementById("form-result");

  openModalBtn.addEventListener("click", function () {
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    modal.scrollIntoView({behavior: "smooth", block: "center"});
    nameInput.focus();
  });

  function closeModal() {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    formResult.textContent = "";
    form.reset();
    submitBtn.disabled = true;
    openModalBtn.focus();
  }

  closeModalBtn.addEventListener("click", closeModal);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });

  function validate() {
    let valid = true;

    if (!nameInput.value.trim()) {
      nameError.textContent = "Имя обязательно";
      valid = false;
    } else {
      nameError.textContent = "";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailInput.value)) {
      emailError.textContent = "Неверный e-mail";
      valid = false;
    } else {
      emailError.textContent = "";
    }

    if (messageInput.value.trim().length < 20) {
      messageError.textContent = "Сообщение минимум 20 символов";
      valid = false;
    } else {
      messageError.textContent = "";
    }

    submitBtn.disabled = !valid;
    return valid;
  }

  nameInput.addEventListener("input", validate);
  emailInput.addEventListener("input", validate);
  messageInput.addEventListener("input", validate);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    formResult.textContent =
      "Спасибо, " + nameInput.value + "! Ваше сообщение получено.";
    form.reset();
    submitBtn.disabled = true;
  });

  // ===== Делегирование событий для карточек =====
  const playlistContainer = document.getElementById("playlist-container");
  const likedState = JSON.parse(localStorage.getItem("likedState")) || {};

  // Восстановление состояния лайков
  playlistContainer.querySelectorAll("article").forEach(function (article) {
    const id = article.dataset.id;
    const likeBtn = article.querySelector(".like-btn");
    if (!likeBtn) {
      return;
    }
    if (likedState[id]) {
      likeBtn.classList.add("liked");
      likeBtn.textContent = "❤️";
    }
  });

  playlistContainer.addEventListener("click", function (e) {
    const target = e.target;
    const article = target.closest("article");
    if (!article) {
      return;
    }
    const id = article.dataset.id;

    // Кнопка лайка
    if (target.classList.contains("like-btn")) {
      target.classList.toggle("liked");
      target.textContent = target.classList.contains("liked")
        ? "❤️"
        : "🤍";
      likedState[id] = target.classList.contains("liked");
      localStorage.setItem("likedState", JSON.stringify(likedState));
    }

    // Кнопка удаления
    if (target.classList.contains("delete-btn")) {
      article.remove();
      delete likedState[id];
      localStorage.setItem("likedState", JSON.stringify(likedState));
    }
  });

  // ===== Управление клавиатурой =====
  document.addEventListener("keydown", function (e) {
    if (
      (e.key === "Enter" || e.key === " ") &&
      document.activeElement.classList.contains("like-btn")
    ) {
      document.activeElement.click();
    }
  });
});
