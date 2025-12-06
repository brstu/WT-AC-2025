// Глобальные переменные
var taskIdCounter = 3;
var currentTab = "all";
var accordionStates = [false, false, false];
var formData = {};
var isFormValid = false;

// Функция для бургер-меню
function toggleMenu() {
  var nav = document.getElementById("mainNav");
  if (nav.classList.contains("active")) {
    nav.classList.remove("active");
  } else {
    nav.classList.add("active");
  }
}

// Функции для табов
function showTab(tabName) {
  currentTab = tabName;
  var buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach(function (btn) {
    btn.classList.remove("active");
  });

  var panels = document.querySelectorAll(".tab-panel");
  panels.forEach(function (panel) {
    panel.classList.remove("active");
  });

  if (tabName === "all") {
    document.getElementById("tab-all").classList.add("active");
    buttons[0].classList.add("active");
  } else if (tabName === "active") {
    document.getElementById("tab-active").classList.add("active");
    buttons[1].classList.add("active");
  } else if (tabName === "completed") {
    document.getElementById("tab-completed").classList.add("active");
    buttons[2].classList.add("active");
  }
}

// Функция для аккордеона
function toggleAccordion(index) {
  var items = document.querySelectorAll(".accordion-item");
  var item = items[index];

  if (accordionStates[index]) {
    item.classList.remove("active");
    accordionStates[index] = false;
  } else {
    item.classList.add("active");
    accordionStates[index] = true;
  }
}

// Делегирование событий для списка задач
document.addEventListener("DOMContentLoaded", function () {
  var taskList = document.getElementById("taskList");

  taskList.addEventListener("click", function (e) {
    var target = e.target;

    // Обработка кнопки удаления
    if (target.classList.contains("btn-delete")) {
      var taskItem = target.closest(".task-item");
      taskItem.remove();
    }

    // Обработка кнопки лайка
    if (target.classList.contains("btn-like")) {
      if (target.classList.contains("liked")) {
        target.classList.remove("liked");
      } else {
        target.classList.add("liked");
      }
    }

    // Обработка чекбокса
    if (target.classList.contains("task-checkbox")) {
      var taskItem = target.closest(".task-item");
      if (target.checked) {
        taskItem.classList.add("completed");
      } else {
        taskItem.classList.remove("completed");
      }
    }
  });
});

// Валидация формы
function validateName() {
  var nameInput = document.getElementById("taskName");
  var nameError = document.getElementById("nameError");
  var value = nameInput.value;

  if (value.trim() === "") {
    nameError.textContent = "Название обязательно для заполнения";
    nameInput.classList.add("error");
    return false;
  } else {
    nameError.textContent = "";
    nameInput.classList.remove("error");
    return true;
  }
}

function validateEmail() {
  var emailInput = document.getElementById("taskEmail");
  var emailError = document.getElementById("emailError");
  var value = emailInput.value;
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(value)) {
    emailError.textContent = "Введите корректный email";
    emailInput.classList.add("error");
    return false;
  } else {
    emailError.textContent = "";
    emailInput.classList.remove("error");
    return true;
  }
}

function validateDescription() {
  var descInput = document.getElementById("taskDescription");
  var descError = document.getElementById("descError");
  var value = descInput.value;

  if (value.length < 20) {
    descError.textContent = "Описание должно содержать минимум 20 символов";
    descInput.classList.add("error");
    return false;
  } else {
    descError.textContent = "";
    descInput.classList.remove("error");
    return true;
  }
}

function checkFormValidity() {
  var nameValid = validateName();
  var emailValid = validateEmail();
  var descValid = validateDescription();

  var submitBtn = document.getElementById("submitBtn");
  if (nameValid && emailValid && descValid) {
    submitBtn.disabled = false;
    isFormValid = true;
  } else {
    submitBtn.disabled = true;
    isFormValid = false;
  }
}

// Обработчики событий для полей формы
document.addEventListener("DOMContentLoaded", function () {
  var nameInput = document.getElementById("taskName");
  var emailInput = document.getElementById("taskEmail");
  var descInput = document.getElementById("taskDescription");

  nameInput.addEventListener("input", function () {
    validateName();
    checkFormValidity();
  });

  emailInput.addEventListener("input", function () {
    validateEmail();
    checkFormValidity();
  });

  descInput.addEventListener("input", function () {
    validateDescription();
    checkFormValidity();
  });

  nameInput.addEventListener("blur", validateName);
  emailInput.addEventListener("blur", validateEmail);
  descInput.addEventListener("blur", validateDescription);
});

// Отправка формы
function submitForm() {
  if (!isFormValid) {
    return false;
  }

  var nameValue = document.getElementById("taskName").value;
  var emailValue = document.getElementById("taskEmail").value;
  var descValue = document.getElementById("taskDescription").value;

  // Создание новой задачи
  var taskList = document.getElementById("taskList");
  var newTask = document.createElement("div");
  newTask.className = "task-item";
  newTask.setAttribute("data-id", taskIdCounter);

  newTask.innerHTML =
    '<div class="task-content">' +
    '<input type="checkbox" class="task-checkbox">' +
    '<span class="task-text">' +
    nameValue +
    "</span>" +
    "</div>" +
    '<div class="task-actions">' +
    '<button class="btn-like">❤️</button>' +
    '<button class="btn-delete">🗑️</button>' +
    "</div>";

  taskList.appendChild(newTask);
  taskIdCounter++;

  // Показать результат
  var resultDiv = document.getElementById("formResult");
  resultDiv.className = "form-result success";
  resultDiv.textContent = 'Задача "' + nameValue + '" успешно создана!';

  // Очистка формы
  document.getElementById("taskName").value = "";
  document.getElementById("taskEmail").value = "";
  document.getElementById("taskDescription").value = "";

  document.getElementById("nameError").textContent = "";
  document.getElementById("emailError").textContent = "";
  document.getElementById("descError").textContent = "";

  document.getElementById("taskName").classList.remove("error");
  document.getElementById("taskEmail").classList.remove("error");
  document.getElementById("taskDescription").classList.remove("error");

  document.getElementById("submitBtn").disabled = true;

  setTimeout(function () {
    resultDiv.style.display = "none";
  }, 3000);

  return false;
}

// Модальное окно
function openModal() {
  var modal = document.getElementById("helpModal");
  modal.classList.add("active");
}

function closeModal() {
  var modal = document.getElementById("helpModal");
  modal.classList.remove("active");
}

// Закрытие модального окна по ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
  }
});

// Дополнительные обработчики для доступности
document.addEventListener("DOMContentLoaded", function () {
  // Обработка Enter для кнопок
  var buttons = document.querySelectorAll("button");
  buttons.forEach(function (btn) {
    btn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // Обработка табуляции в модальном окне
  var modal = document.getElementById("helpModal");
  modal.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      var focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      var firstElement = focusableElements[0];
      var lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  });
});

// Функция для фильтрации задач (не реализована)
function filterTasks() {
  var tasks = document.querySelectorAll(".task-item");
  // TODO: добавить фильтрацию
}

// Дополнительная функция
function countTasks() {
  var tasks = document.querySelectorAll(".task-item");
  return tasks.length;
}
