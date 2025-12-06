// Глобальные переменные
var menuOpen = false;
var formData = {};

// Бургер меню
function toggleMenu() {
  var nav = document.getElementById("nav");
  menuOpen = !menuOpen;
  if (menuOpen) {
    nav.style.display = "block";
  } else {
    nav.style.display = "none";
  }
}

// Табы
function openTab(evt, tabName) {
  var i;
  var tabcontent = document.getElementsByClassName("tab-content");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  var tabButtons = document.getElementsByClassName("tab-btn");
  for (i = 0; i < tabButtons.length; i++) {
    tabButtons[i].className = tabButtons[i].className.replace(" active", "");
  }

  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

// Аккордеон
function toggleAccordion(element) {
  var parent = element.parentElement;
  var icon = element.querySelector(".icon");

  if (parent.classList.contains("active")) {
    parent.classList.remove("active");
    icon.textContent = "+";
  } else {
    // Закрываем все аккордеоны
    var items = document.querySelectorAll(".accordion-item");
    for (var i = 0; i < items.length; i++) {
      items[i].classList.remove("active");
      items[i].querySelector(".icon").textContent = "+";
    }
    parent.classList.add("active");
    icon.textContent = "-";
  }
}

// Модальное окно
function openModal() {
  document.getElementById("modal").style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

window.onclick = function (event) {
  var modal = document.getElementById("modal");
  if (event.target == modal) {
    closeModal();
  }
};

// Делегирование событий для карточек
document.addEventListener("DOMContentLoaded", function () {
  var container = document.getElementById("cardsContainer");

  container.addEventListener("click", function (e) {
    if (e.target.classList.contains("like-btn")) {
      var currentLikes = parseInt(e.target.getAttribute("data-likes"));
      currentLikes++;
      e.target.setAttribute("data-likes", currentLikes);
      e.target.textContent = "❤️ " + currentLikes;
    }

    if (e.target.classList.contains("delete-btn")) {
      var card = e.target.closest(".card");
      card.remove();
    }
  });

  // Валидация формы
  var nameInput = document.getElementById("name");
  var emailInput = document.getElementById("email");
  var messageInput = document.getElementById("message");
  var submitBtn = document.getElementById("submitBtn");
  var form = document.getElementById("contactForm");

  function validateName() {
    var name = nameInput.value;
    var error = document.getElementById("nameError");
    if (name.length == 0) {
      error.textContent = "Имя обязательно";
      return false;
    } else {
      error.textContent = "";
      return true;
    }
  }

  function validateEmail() {
    var email = emailInput.value;
    var error = document.getElementById("emailError");
    var re = /\S+@\S+\.\S+/;
    if (!re.test(email)) {
      error.textContent = "Введите корректный email";
      return false;
    } else {
      error.textContent = "";
      return true;
    }
  }

  function validateMessage() {
    var message = messageInput.value;
    var error = document.getElementById("messageError");
    if (message.length < 20) {
      error.textContent = "Сообщение должно содержать минимум 20 символов";
      return false;
    } else {
      error.textContent = "";
      return true;
    }
  }

  function checkFormValidity() {
    var isValid = validateName() && validateEmail() && validateMessage();
    submitBtn.disabled = !isValid;
  }

  nameInput.addEventListener("input", function () {
    validateName();
    checkFormValidity();
  });

  emailInput.addEventListener("input", function () {
    validateEmail();
    checkFormValidity();
  });

  messageInput.addEventListener("input", function () {
    validateMessage();
    checkFormValidity();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (validateName() && validateEmail() && validateMessage()) {
      var result = document.getElementById("result");
      result.style.display = "block";
      result.textContent =
        "Форма успешно отправлена! Имя: " +
        nameInput.value +
        ", Email: " +
        emailInput.value;

      // Очистка формы
      setTimeout(function () {
        nameInput.value = "";
        emailInput.value = "";
        messageInput.value = "";
        result.style.display = "none";
        submitBtn.disabled = true;
      }, 3000);
    }
  });
});

// Обработка клавиатуры для аккордеона
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
  }
});
