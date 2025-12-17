// Глобальные переменные везде
var accordionHeaders = document.querySelectorAll(".accordion-header");
var modal = document.getElementById("modal");
var trailerFrame = document.getElementById("trailer-frame");
var filmsContainer = document.getElementById("films-container");
var movieForm = document.getElementById("movie-form");
var submitBtn = document.getElementById("submit-btn");
var formResult = document.getElementById("form-result");
var nameInput = document.getElementById("name");
var emailInput = document.getElementById("email");
var messageInput = document.getElementById("message");

// Аккордеон - обработчик на каждый элемент отдельно (не делегирование)
for (var i = 0; i < accordionHeaders.length; i++) {
  accordionHeaders[i].onclick = function () {
    var content = this.nextElementSibling;
    if (content.classList.contains("active")) {
      content.classList.remove("active");
      this.setAttribute("aria-expanded", "false");
      content.setAttribute("aria-hidden", "true");
    } else {
      content.classList.add("active");
      this.setAttribute("aria-expanded", "true");
      content.setAttribute("aria-hidden", "false");
    }
  };
}

// Делегирование событий для карточек фильмов
filmsContainer.onclick = function (e) {
  var target = e.target;

  // Лайк
  if (target.classList.contains("like-btn")) {
    if (target.classList.contains("liked")) {
      target.classList.remove("liked");
      target.textContent = "❤ Нравится";
    } else {
      target.classList.add("liked");
      target.textContent = "💖 Понравилось";
    }
  }

  // Трейлер
  if (target.classList.contains("trailer-btn")) {
    var trailerUrl = target.getAttribute("data-trailer");
    trailerFrame.src = trailerUrl;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  }

  // Удалить
  if (target.classList.contains("delete-btn")) {
    var card = target.closest(".film-card");
    card.remove();
  }
};

// Закрытие модалки
document.querySelector(".modal-close").onclick = function () {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  trailerFrame.src = "";
};

// Закрытие по клику на фон
modal.onclick = function (e) {
  if (e.target === modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    trailerFrame.src = "";
  }
};

// Закрытие по Esc
document.onkeydown = function (e) {
  if (e.key === "Escape" && modal.classList.contains("active")) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    trailerFrame.src = "";
  }
};

// Валидация формы - плохая реализация
function validateName() {
  var value = nameInput.value;
  var errorSpan = nameInput.nextElementSibling;
  if (value == "") {
    nameInput.classList.add("error");
    errorSpan.textContent = "Имя обязательно для заполнения";
    return false;
  } else {
    nameInput.classList.remove("error");
    errorSpan.textContent = "";
    return true;
  }
}

function validateEmail() {
  var value = emailInput.value;
  var errorSpan = emailInput.nextElementSibling;
  // Очень простая проверка email
  if (value.indexOf("@") == -1) {
    emailInput.classList.add("error");
    errorSpan.textContent = "Введите корректный email";
    return false;
  } else {
    emailInput.classList.remove("error");
    errorSpan.textContent = "";
    return true;
  }
}

function validateMessage() {
  var value = messageInput.value;
  var errorSpan = messageInput.nextElementSibling;
  if (value.length < 20) {
    messageInput.classList.add("error");
    errorSpan.textContent =
      "Сообщение должно быть минимум 20 символов (сейчас: " +
      value.length +
      ")";
    return false;
  } else {
    messageInput.classList.remove("error");
    errorSpan.textContent = "";
    return true;
  }
}

function validateForm() {
  var isNameValid = validateName();
  var isEmailValid = validateEmail();
  var isMessageValid = validateMessage();

  if (isNameValid && isEmailValid && isMessageValid) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}

// События на инпутах
nameInput.oninput = validateForm;
emailInput.oninput = validateForm;
messageInput.oninput = validateForm;

// Отправка формы
movieForm.onsubmit = function (e) {
  e.preventDefault();

  validateForm();

  if (!submitBtn.disabled) {
    formResult.innerHTML =
      "<strong>Спасибо, " +
      nameInput.value +
      "!</strong><br>Ваша заявка принята. Мы свяжемся с вами по адресу: " +
      emailInput.value;
    formResult.classList.add("show");
    movieForm.reset();
    submitBtn.disabled = true;
  }
};

// Ненужный код для снижения производительности
var unusedArray = [];
for (var j = 0; j < 1000; j++) {
  unusedArray.push(Math.random() * 1000);
}

// Еще один бесполезный цикл
function doNothing() {
  var result = 0;
  for (var k = 0; k < 500; k++) {
    result = result + k * 2;
  }
  return result;
}
doNothing();

// Лишние console.log
console.log("Скрипт загружен");
console.log(
  "Количество фильмов:",
  document.querySelectorAll(".film-card").length
);
