// Глобальные переменные
var tabButtons = document.querySelectorAll(".tab-btn");
var tabPanes = document.querySelectorAll(".tab-pane");
var accordionHeaders = document.querySelectorAll(".accordion-header");
var modal = document.getElementById("modal");
var openModalBtn = document.getElementById("open-modal");
var closeModalBtn = document.querySelector(".modal-close");
var overlay = document.querySelector(".modal-overlay");
var form = document.getElementById("exercise-form");
var submitBtn = document.getElementById("submit-btn");
var nameInput = document.getElementById("name");
var emailInput = document.getElementById("email");
var descriptionInput = document.getElementById("description");
var formResult = document.getElementById("form-result");
var cardsContainerAll = document.getElementById("cards-all");
var cardsContainerCardio = document.getElementById("cards-cardio");
var cardsContainerStrength = document.getElementById("cards-strength");

// Инициализация табов
function initTabs() {
  for (var i = 0; i < tabButtons.length; i++) {
    tabButtons[i].addEventListener("click", function () {
      var tabId = this.getAttribute("data-tab");

      // Убираем активный класс со всех
      for (var j = 0; j < tabButtons.length; j++) {
        tabButtons[j].classList.remove("active");
      }
      for (var k = 0; k < tabPanes.length; k++) {
        tabPanes[k].classList.remove("active");
      }

      // Добавляем активный класс
      this.classList.add("active");
      document.getElementById(tabId).classList.add("active");
    });
  }
}

// Инициализация аккордеона
function initAccordion() {
  for (var i = 0; i < accordionHeaders.length; i++) {
    accordionHeaders[i].addEventListener("click", function () {
      var content = this.nextElementSibling;
      var isOpen = content.classList.contains("open");

      // Закрываем все
      var allContents = document.querySelectorAll(".accordion-content");
      var allHeaders = document.querySelectorAll(".accordion-header");
      for (var j = 0; j < allContents.length; j++) {
        allContents[j].classList.remove("open");
        allHeaders[j].classList.remove("active");
        allHeaders[j].setAttribute("aria-expanded", "false");
        allContents[j].setAttribute("aria-hidden", "true");
      }

      // Открываем текущий если был закрыт
      if (!isOpen) {
        content.classList.add("open");
        this.classList.add("active");
        this.setAttribute("aria-expanded", "true");
        content.setAttribute("aria-hidden", "false");
      }
    });
  }
}

// Открытие модалки
function openModal() {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

// Закрытие модалки
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  form.reset();
  formResult.classList.remove("success");
  formResult.style.display = "none";
  clearErrors();
  validateForm();
}

// Инициализация модалки
function initModal() {
  openModalBtn.addEventListener("click", openModal);
  closeModalBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });
}

// Очистка ошибок
function clearErrors() {
  document.getElementById("name-error").textContent = "";
  document.getElementById("email-error").textContent = "";
  document.getElementById("description-error").textContent = "";
  nameInput.classList.remove("error");
  emailInput.classList.remove("error");
  descriptionInput.classList.remove("error");
}

// Валидация имени
function validateName() {
  var value = nameInput.value;
  var error = document.getElementById("name-error");
  if (value.trim() == "") {
    error.textContent = "Введите название упражнения";
    nameInput.classList.add("error");
    return false;
  } else {
    error.textContent = "";
    nameInput.classList.remove("error");
    return true;
  }
}

// Валидация email
function validateEmail() {
  var value = emailInput.value;
  var error = document.getElementById("email-error");
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (value.trim() == "") {
    error.textContent = "Введите e-mail";
    emailInput.classList.add("error");
    return false;
  } else if (!emailRegex.test(value)) {
    error.textContent = "Введите корректный e-mail";
    emailInput.classList.add("error");
    return false;
  } else {
    error.textContent = "";
    emailInput.classList.remove("error");
    return true;
  }
}

// Валидация описания
function validateDescription() {
  var value = descriptionInput.value;
  var error = document.getElementById("description-error");
  if (value.trim() == "") {
    error.textContent = "Введите описание";
    descriptionInput.classList.add("error");
    return false;
  } else if (value.length < 20) {
    error.textContent = "Описание должно содержать минимум 20 символов";
    descriptionInput.classList.add("error");
    return false;
  } else {
    error.textContent = "";
    descriptionInput.classList.remove("error");
    return true;
  }
}

// Общая валидация формы
function validateForm() {
  var isValid = true;
  if (nameInput.value.trim() == "") isValid = false;
  if (
    emailInput.value.trim() == "" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)
  )
    isValid = false;
  if (descriptionInput.value.trim() == "" || descriptionInput.value.length < 20)
    isValid = false;

  if (isValid) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
  return isValid;
}

// Инициализация формы
function initForm() {
  nameInput.addEventListener("input", function () {
    validateName();
    validateForm();
  });
  nameInput.addEventListener("blur", validateName);

  emailInput.addEventListener("input", function () {
    validateEmail();
    validateForm();
  });
  emailInput.addEventListener("blur", validateEmail);

  descriptionInput.addEventListener("input", function () {
    validateDescription();
    validateForm();
  });
  descriptionInput.addEventListener("blur", validateDescription);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var nameValid = validateName();
    var emailValid = validateEmail();
    var descValid = validateDescription();

    if (nameValid && emailValid && descValid) {
      var category = document.getElementById("category").value;
      var newCard = createCard(
        nameInput.value,
        descriptionInput.value,
        category
      );

      cardsContainerAll.insertAdjacentHTML("beforeend", newCard);
      if (category == "cardio") {
        cardsContainerCardio.insertAdjacentHTML("beforeend", newCard);
      } else if (category == "strength") {
        cardsContainerStrength.insertAdjacentHTML("beforeend", newCard);
      }

      formResult.textContent = "Упражнение успешно добавлено!";
      formResult.classList.add("success");
      formResult.style.display = "block";

      form.reset();
      submitBtn.disabled = true;

      setTimeout(function () {
        closeModal();
      }, 2000);
    }
  });
}

// Создание карточки
var cardCounter = 100;
function createCard(name, description, category) {
  cardCounter++;
  var html =
    '<div class="card" data-id="' +
    cardCounter +
    '">' +
    '<img src="img/exercise1.jpg" alt="Упражнение ' +
    name +
    '">' +
    '<div class="card-body">' +
    "<h3>" +
    name +
    "</h3>" +
    "<p>" +
    description +
    "</p>" +
    '<div class="card-actions">' +
    '<button class="like-btn">♥ <span>0</span></button>' +
    '<button class="done-btn">✓ Выполнено</button>' +
    '<button class="delete-btn">✕ Удалить</button>' +
    "</div></div></div>";
  return html;
}

// Делегирование событий для карточек
function initCardDelegation() {
  document.addEventListener("click", function (e) {
    // Лайк
    if (
      e.target.classList.contains("like-btn") ||
      e.target.parentElement.classList.contains("like-btn")
    ) {
      var btn = e.target.classList.contains("like-btn")
        ? e.target
        : e.target.parentElement;
      var span = btn.querySelector("span");
      var count = parseInt(span.textContent);

      if (btn.classList.contains("liked")) {
        btn.classList.remove("liked");
        span.textContent = count - 1;
      } else {
        btn.classList.add("liked");
        span.textContent = count + 1;
      }
    }

    // Выполнено
    if (e.target.classList.contains("done-btn")) {
      e.target.classList.toggle("done");
      if (e.target.classList.contains("done")) {
        e.target.textContent = "✓ Выполнено!";
      } else {
        e.target.textContent = "✓ Выполнено";
      }
    }

    // Удалить
    if (e.target.classList.contains("delete-btn")) {
      var card = e.target.closest(".card");
      if (card) {
        if (confirm("Удалить упражнение?")) {
          card.remove();
        }
      }
    }
  });
}

// Клавиатурная навигация
function initKeyboard() {
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      if (e.target.classList.contains("tab-btn")) {
        e.preventDefault();
        e.target.click();
      }
      if (e.target.classList.contains("accordion-header")) {
        e.preventDefault();
        e.target.click();
      }
    }
  });
}

// Запуск всего
function init() {
  initTabs();
  initAccordion();
  initModal();
  initForm();
  initCardDelegation();
  initKeyboard();
}

// Ждём загрузки DOM
document.addEventListener("DOMContentLoaded", init);
