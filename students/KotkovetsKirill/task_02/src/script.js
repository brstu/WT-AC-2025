// Глобальные переменные - плохая практика!
var currentFilter = "all";
var currentTab = "beginner";
var accordionOpen = false;
var exercises = [];
var formValid = false;
var nameValid = false;
var emailValid = false;
var messageValid = false;

// Данные упражнений
var exercisesData = [
  {
    id: 1,
    name: "Жим штанги лежа",
    category: "chest",
    level: "beginner",
    description: "Базовое упражнение для груди",
    risks: "Травма плечевого сустава при неправильной технике",
    image: "img/exercise1.jpg",
    likes: 0,
  },
  {
    id: 2,
    name: "Подтягивания",
    category: "back",
    level: "intermediate",
    description: "Упражнение для развития спины",
    risks: "Перенапряжение локтей",
    image: "img/exercise2.jpg",
    likes: 0,
  },
  {
    id: 3,
    name: "Приседания со штангой",
    category: "legs",
    level: "intermediate",
    description: "Базовое упражнение для ног",
    risks: "Травма коленей при плохой технике",
    image: "img/exercise3.jpg",
    likes: 0,
  },
  {
    id: 4,
    name: "Сгибание рук с гантелями",
    category: "arms",
    level: "beginner",
    description: "Изолированное упражнение на бицепс",
    risks: "Растяжение бицепса",
    image: "img/exercise4.jpg",
    likes: 0,
  },
  {
    id: 5,
    name: "Жим гантелей стоя",
    category: "shoulders",
    level: "intermediate",
    description: "Упражнение для дельтовидных мышц",
    risks: "Травма ротаторной манжеты",
    image: "img/exercise5.jpg",
    likes: 0,
  },
  {
    id: 6,
    name: "Становая тяга",
    category: "back",
    level: "advanced",
    description: "Комплексное базовое упражнение",
    risks: "Травма поясницы при неправильной технике",
    image: "img/exercise6.jpg",
    likes: 0,
  },
];

// Инициализация при загрузке страницы
window.onload = function () {
  exercises = exercisesData;
  renderExercises();
  setupEventDelegation();
  console.log("Страница загружена");
};

// Функция для аккордеона
function toggleAccordion() {
  var content = document.getElementById("accordion-content");
  var icon = document.getElementById("accordion-icon");

  if (accordionOpen) {
    content.style.display = "none";
    icon.innerHTML = "▼";
    accordionOpen = false;
  } else {
    content.style.display = "block";
    icon.innerHTML = "▲";
    accordionOpen = true;
  }
}

// Функция для переключения табов
function switchTab(tabName) {
  currentTab = tabName;

  // Скрыть все табы
  var tab1 = document.getElementById("content-beginner");
  var tab2 = document.getElementById("content-intermediate");
  var tab3 = document.getElementById("content-advanced");

  tab1.style.display = "none";
  tab2.style.display = "none";
  tab3.style.display = "none";

  // Сбросить стили всех кнопок
  var btn1 = document.getElementById("tab-beginner");
  var btn2 = document.getElementById("tab-intermediate");
  var btn3 = document.getElementById("tab-advanced");

  btn1.style.background = "#e0e0e0";
  btn1.style.color = "black";
  btn2.style.background = "#e0e0e0";
  btn2.style.color = "black";
  btn3.style.background = "#e0e0e0";
  btn3.style.color = "black";

  // Показать нужный таб
  if (tabName === "beginner") {
    tab1.style.display = "block";
    btn1.style.background = "#4CAF50";
    btn1.style.color = "white";
  } else if (tabName === "intermediate") {
    tab2.style.display = "block";
    btn2.style.background = "#4CAF50";
    btn2.style.color = "white";
  } else if (tabName === "advanced") {
    tab3.style.display = "block";
    btn3.style.background = "#4CAF50";
    btn3.style.color = "white";
  }

  renderExercises();
}

// Фильтрация упражнений
function filterExercises(category) {
  currentFilter = category;
  renderExercises();
}

// Рендер упражнений - много дублирования
function renderExercises() {
  var container = document.getElementById("exercises-list");
  container.innerHTML = "";

  var filtered = exercises;

  // Фильтр по категории
  if (currentFilter !== "all") {
    filtered = exercises.filter(function (ex) {
      return ex.category === currentFilter;
    });
  }

  // Фильтр по уровню
  filtered = filtered.filter(function (ex) {
    return ex.level === currentTab;
  });

  // Создание карточек
  for (var i = 0; i < filtered.length; i++) {
    var ex = filtered[i];
    var card = document.createElement("div");
    card.className = "exercise-card";
    card.setAttribute("data-id", ex.id);

    var img = document.createElement("img");
    img.src = ex.image;
    img.alt = ex.name;
    card.appendChild(img);

    var title = document.createElement("h3");
    title.textContent = ex.name;
    card.appendChild(title);

    var desc = document.createElement("p");
    desc.textContent = ex.description;
    card.appendChild(desc);

    var badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = getCategoryName(ex.category);
    card.appendChild(badge);

    var br = document.createElement("br");
    card.appendChild(br);

    // Tooltip с рисками
    var tooltip = document.createElement("span");
    tooltip.className = "tooltip";
    tooltip.style.marginTop = "10px";
    tooltip.style.display = "inline-block";
    tooltip.innerHTML = "⚠️ Риски";
    var tooltiptext = document.createElement("span");
    tooltiptext.className = "tooltiptext";
    tooltiptext.textContent = ex.risks;
    tooltip.appendChild(tooltiptext);
    card.appendChild(tooltip);

    var br2 = document.createElement("br");
    card.appendChild(br2);

    var btnInfo = document.createElement("button");
    btnInfo.className = "btn-info";
    btnInfo.textContent = "Техника";
    btnInfo.setAttribute("data-action", "info");
    btnInfo.style.marginTop = "10px";
    card.appendChild(btnInfo);

    var btnLike = document.createElement("button");
    btnLike.className = "btn-like";
    btnLike.textContent = "❤️ " + ex.likes;
    btnLike.setAttribute("data-action", "like");
    card.appendChild(btnLike);

    var btnDelete = document.createElement("button");
    btnDelete.className = "btn-delete";
    btnDelete.textContent = "Удалить";
    btnDelete.setAttribute("data-action", "delete");
    card.appendChild(btnDelete);

    container.appendChild(card);
  }
}

// Получение имени категории
function getCategoryName(category) {
  if (category === "chest") return "Грудь";
  if (category === "back") return "Спина";
  if (category === "legs") return "Ноги";
  if (category === "arms") return "Руки";
  if (category === "shoulders") return "Плечи";
  return category;
}

// Делегирование событий - обработчик на контейнере
function setupEventDelegation() {
  var container = document.getElementById("exercises-list");

  container.addEventListener("click", function (event) {
    var target = event.target;

    if (target.tagName === "BUTTON") {
      var card = target.closest(".exercise-card");
      var id = parseInt(card.getAttribute("data-id"));
      var action = target.getAttribute("data-action");

      if (action === "info") {
        showExerciseInfo(id);
      } else if (action === "like") {
        likeExercise(id);
      } else if (action === "delete") {
        deleteExercise(id);
      }
    }
  });
}

// Показать информацию об упражнении в модалке
function showExerciseInfo(id) {
  var ex = null;
  for (var i = 0; i < exercises.length; i++) {
    if (exercises[i].id === id) {
      ex = exercises[i];
      break;
    }
  }

  if (!ex) return;

  var modal = document.getElementById("modal");
  var modalBody = document.getElementById("modal-body");

  modalBody.innerHTML = "";

  var title = document.createElement("h2");
  title.textContent = ex.name;
  modalBody.appendChild(title);

  var img = document.createElement("img");
  img.src = ex.image;
  img.alt = ex.name;
  img.style.width = "100%";
  img.style.borderRadius = "8px";
  img.style.marginBottom = "15px";
  modalBody.appendChild(img);

  var descTitle = document.createElement("h3");
  descTitle.textContent = "Описание:";
  modalBody.appendChild(descTitle);

  var desc = document.createElement("p");
  desc.textContent = ex.description;
  modalBody.appendChild(desc);

  var techTitle = document.createElement("h3");
  techTitle.textContent = "Техника выполнения:";
  modalBody.appendChild(techTitle);

  var tech = document.createElement("p");
  tech.textContent =
    "Правильная техника очень важна для избежания травм. Следуйте инструкциям тренера.";
  modalBody.appendChild(tech);

  var risksTitle = document.createElement("h3");
  risksTitle.textContent = "Возможные риски:";
  risksTitle.style.color = "red";
  modalBody.appendChild(risksTitle);

  var risks = document.createElement("p");
  risks.textContent = ex.risks;
  modalBody.appendChild(risks);

  modal.classList.add("show");
  modal.style.display = "block";
}

// Закрыть модальное окно
function closeModal() {
  var modal = document.getElementById("modal");
  modal.classList.remove("show");
  modal.style.display = "none";
}

// Закрытие по клику вне модалки
window.onclick = function (event) {
  var modal = document.getElementById("modal");
  if (event.target === modal) {
    closeModal();
  }
};

// Лайк упражнения
function likeExercise(id) {
  for (var i = 0; i < exercises.length; i++) {
    if (exercises[i].id === id) {
      exercises[i].likes++;
      break;
    }
  }
  renderExercises();
}

// Удаление упражнения
function deleteExercise(id) {
  var newExercises = [];
  for (var i = 0; i < exercises.length; i++) {
    if (exercises[i].id !== id) {
      newExercises.push(exercises[i]);
    }
  }
  exercises = newExercises;
  renderExercises();
}

// Валидация формы
function validateForm() {
  var name = document.getElementById("name").value;
  var email = document.getElementById("email").value;
  var message = document.getElementById("message").value;

  var nameError = document.getElementById("name-error");
  var emailError = document.getElementById("email-error");
  var messageError = document.getElementById("message-error");

  var submitBtn = document.getElementById("submit-btn");

  // Валидация имени
  if (name.length === 0) {
    nameError.textContent = "Имя обязательно";
    nameError.style.display = "block";
    document.getElementById("name").classList.add("error");
    nameValid = false;
  } else {
    nameError.style.display = "none";
    document.getElementById("name").classList.remove("error");
    nameValid = true;
  }

  // Валидация email - простая проверка
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    emailError.textContent = "Введите корректный email";
    emailError.style.display = "block";
    document.getElementById("email").classList.add("error");
    emailValid = false;
  } else {
    emailError.style.display = "none";
    document.getElementById("email").classList.remove("error");
    emailValid = true;
  }

  // Валидация сообщения
  if (message.length < 20) {
    messageError.textContent =
      "Сообщение должно содержать минимум 20 символов (сейчас: " +
      message.length +
      ")";
    messageError.style.display = "block";
    document.getElementById("message").classList.add("error");
    messageValid = false;
  } else {
    messageError.style.display = "none";
    document.getElementById("message").classList.remove("error");
    messageValid = true;
  }

  // Проверка общей валидности
  if (nameValid && emailValid && messageValid) {
    formValid = true;
    submitBtn.disabled = false;
    submitBtn.style.background = "#4CAF50";
    submitBtn.style.color = "white";
    submitBtn.style.cursor = "pointer";
  } else {
    formValid = false;
    submitBtn.disabled = true;
    submitBtn.style.background = "#ccc";
    submitBtn.style.color = "#666";
    submitBtn.style.cursor = "not-allowed";
  }
}

// Отправка формы
function submitForm() {
  if (!formValid) {
    return false;
  }

  var name = document.getElementById("name").value;
  var email = document.getElementById("email").value;
  var message = document.getElementById("message").value;

  var result = document.getElementById("form-result");
  result.innerHTML =
    "<strong>Спасибо за обращение!</strong><br>Имя: " +
    name +
    "<br>Email: " +
    email +
    "<br>Сообщение: " +
    message;
  result.className = "success";
  result.style.display = "block";

  // Очистка формы
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("message").value = "";

  nameValid = false;
  emailValid = false;
  messageValid = false;
  formValid = false;

  var submitBtn = document.getElementById("submit-btn");
  submitBtn.disabled = true;
  submitBtn.style.background = "#ccc";
  submitBtn.style.color = "#666";
  submitBtn.style.cursor = "not-allowed";

  return false;
}

// Клавиатурная навигация - минимальная реализация
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    var modal = document.getElementById("modal");
    if (modal.style.display === "block") {
      closeModal();
    }
  }
});

console.log("Script loaded");
