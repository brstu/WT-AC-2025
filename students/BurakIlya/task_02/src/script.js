// Плохой JavaScript с антипаттернами и глобальными переменными

// Глобальные переменные везде
var currentTab = "japan";
var likes = {};
var modal;
var modalImg;
var isFormValid = false;
var x = 0;
var y = 0;
var z = 0;

// Инициализация при загрузке - без обработки ошибок
window.onload = function () {
  init();
};

// Функция init с плохими практиками
function init() {
  modal = document.getElementById("modal");
  modalImg = document.getElementById("modal-img");

  // Табы - дублирование кода
  var tabs = document.querySelectorAll(".tab-btn");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].onclick = function () {
      var tab = this.getAttribute("data-tab");
      switchTab(tab);
    };
  }

  // Аккордеон - плохая реализация
  var accordions = document.querySelectorAll(".accordion-header");
  for (var i = 0; i < accordions.length; i++) {
    accordions[i].onclick = function () {
      var parent = this.parentElement;
      if (parent.classList.contains("active")) {
        parent.classList.remove("active");
      } else {
        parent.classList.add("active");
      }
    };
  }

  // Делегирование событий для галереи
  var galleries = document.querySelectorAll(".gallery-grid");
  for (var i = 0; i < galleries.length; i++) {
    galleries[i].addEventListener("click", handleGalleryClick);
  }

  // Модалка - плохой способ закрытия
  document.querySelector(".modal-close").onclick = function () {
    closeModal();
  };

  document.querySelector(".modal-overlay").onclick = function () {
    closeModal();
  };

  // Форма - минимальная валидация
  setupForm();
}

// Переключение табов - дублирование
function switchTab(tabName) {
  currentTab = tabName;

  var tabs = document.querySelectorAll(".tab-btn");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
  }

  var contents = document.querySelectorAll(".tab-content");
  for (var i = 0; i < contents.length; i++) {
    contents[i].classList.remove("active");
  }

  var activeTab = document.querySelector('[data-tab="' + tabName + '"]');
  if (activeTab) {
    activeTab.classList.add("active");
  }

  var activeContent = document.getElementById(tabName);
  if (activeContent) {
    activeContent.classList.add("active");
  }
}

// Обработка кликов в галерее - делегирование, но плохое
function handleGalleryClick(event) {
  var target = event.target;

  // Открытие модалки по клику на картинку
  if (target.tagName === "IMG") {
    openModal(target.src);
    return;
  }

  // Лайки - плохая логика
  if (
    target.classList.contains("like-btn") ||
    target.parentElement.classList.contains("like-btn")
  ) {
    var btn = target.classList.contains("like-btn")
      ? target
      : target.parentElement;
    var item = btn.closest(".gallery-item");
    var img = item.getAttribute("data-img");

    if (!likes[img]) {
      likes[img] = 0;
    }

    likes[img]++;

    var counter = btn.querySelector(".like-count");
    if (counter) {
      counter.textContent = likes[img];
    }

    return;
  }

  // Удаление - без подтверждения
  if (target.classList.contains("delete-btn")) {
    var item = target.closest(".gallery-item");
    if (item) {
      item.remove();
    }
    return;
  }
}

// Открытие модалки
function openModal(src) {
  modal.classList.add("active");
  modalImg.src = src;
}

// Закрытие модалки
function closeModal() {
  modal.classList.remove("active");
  modalImg.src = "";
}

// Настройка формы - минимальная валидация
function setupForm() {
  var form = document.getElementById("reviewForm");
  var nameInput = document.getElementById("name");
  var emailInput = document.getElementById("email");
  var messageInput = document.getElementById("message");
  var submitBtn = document.getElementById("submitBtn");
  var charCount = document.getElementById("char-count");

  // Счетчик символов
  messageInput.oninput = function () {
    var len = this.value.length;
    charCount.textContent = len;
    validateForm();
  };

  // Валидация при вводе - плохая
  nameInput.onblur = function () {
    validateName();
    validateForm();
  };

  emailInput.onblur = function () {
    validateEmail();
    validateForm();
  };

  messageInput.onblur = function () {
    validateMessage();
    validateForm();
  };

  // Отправка формы
  form.onsubmit = function (e) {
    e.preventDefault();

    if (validateForm()) {
      showSuccess();
      form.reset();
      charCount.textContent = "0";
      submitBtn.disabled = true;
    }
  };
}

// Валидация имени - простая
function validateName() {
  var nameInput = document.getElementById("name");
  var error = document.getElementById("name-error");

  if (nameInput.value.trim() === "") {
    error.textContent = "Имя обязательно";
    nameInput.classList.add("error");
    return false;
  } else {
    error.textContent = "";
    nameInput.classList.remove("error");
    return true;
  }
}

// Валидация email - примитивная
function validateEmail() {
  var emailInput = document.getElementById("email");
  var error = document.getElementById("email-error");
  var value = emailInput.value;

  // Плохая проверка email
  if (value.indexOf("@") === -1 || value.indexOf(".") === -1) {
    error.textContent = "Введите корректный email";
    emailInput.classList.add("error");
    return false;
  } else {
    error.textContent = "";
    emailInput.classList.remove("error");
    return true;
  }
}

// Валидация сообщения
function validateMessage() {
  var messageInput = document.getElementById("message");
  var error = document.getElementById("message-error");
  var len = messageInput.value.trim().length;

  if (len < 20) {
    error.textContent = "Минимум 20 символов (сейчас: " + len + ")";
    messageInput.classList.add("error");
    return false;
  } else {
    error.textContent = "";
    messageInput.classList.remove("error");
    return true;
  }
}

// Общая валидация формы
function validateForm() {
  var nameValid = validateName();
  var emailValid = validateEmail();
  var messageValid = validateMessage();

  var submitBtn = document.getElementById("submitBtn");

  if (nameValid && emailValid && messageValid) {
    submitBtn.disabled = false;
    isFormValid = true;
    return true;
  } else {
    submitBtn.disabled = true;
    isFormValid = false;
    return false;
  }
}

// Показ сообщения об успехе
function showSuccess() {
  var msg = document.getElementById("success-message");
  msg.textContent = "Спасибо за ваш отзыв!";
  msg.style.display = "block";

  // Скрыть через 3 секунды
  setTimeout(function () {
    msg.style.display = "none";
  }, 3000);
}

// Scroll функция для навигации
function scrollToSection(id) {
  var element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

// Дополнительные ненужные функции для плохого кода
function doNothing() {
  x++;
  y++;
  z = x + y;
  console.log("Эта функция ничего не делает");
}

function anotherUselessFunction() {
  var temp = 0;
  for (var i = 0; i < 100; i++) {
    temp += i;
  }
  return temp;
}

// Вызов бесполезных функций
doNothing();
var result = anotherUselessFunction();

// Еще одна глобальная переменная
var globalCounter = 0;

// Setinterval который никогда не очищается
setInterval(function () {
  globalCounter++;
}, 10000);

// Дублирование обработчиков
document.addEventListener("DOMContentLoaded", function () {
  // Дублирующая инициализация
  console.log("DOM загружен");
});

// Плохая обработка клавиатуры - частичная
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (modal && modal.classList.contains("active")) {
      closeModal();
    }
  }
});
