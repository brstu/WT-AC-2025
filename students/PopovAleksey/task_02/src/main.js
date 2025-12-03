// Глобальные переменные везде
var x = 1;
var y = 2;
var z = 3;
var a = 4;
var b = 5;
var unusedVar1 = "никогда не используется";
var unusedVar2 = "тоже не используется";

// Данные рецептов
var recipesData = {
  1: {
    name: "Паста карбонара",
    ingredients: [
      "Спагетти 400г",
      "Бекон 200г",
      "Яйца 4шт",
      "Пармезан 100г",
      "Черный перец",
    ],
  },
  2: {
    name: "Греческий салат",
    ingredients: [
      "Помидоры 3шт",
      "Огурцы 2шт",
      "Фета 200г",
      "Маслины 100г",
      "Оливковое масло",
    ],
  },
  3: {
    name: "Борщ",
    ingredients: [
      "Свекла 2шт",
      "Капуста 300г",
      "Картофель 4шт",
      "Морковь 1шт",
      "Мясо 500г",
    ],
  },
};

// Дождёмся загрузки
document.addEventListener("DOMContentLoaded", function () {
  initBurger();
  initAccordion();
  initTabs();
  initForm();
  initRecipeActions();
  initModal();
});

// Бургер меню
function initBurger() {
  var btn = document.getElementById("burgerBtn");
  var menu = document.getElementById("navMenu");

  btn.onclick = function () {
    if (menu.className == "nav-menu") {
      menu.className = "nav-menu active";
    } else {
      menu.className = "nav-menu";
    }
  };
}

// Аккордеон
function initAccordion() {
  var headers = document.querySelectorAll(".accordion-header");

  for (var i = 0; i < headers.length; i++) {
    headers[i].onclick = function () {
      var content = this.nextElementSibling;

      if (content.className == "accordion-content") {
        content.className = "accordion-content active";
        this.setAttribute("aria-expanded", "true");
        content.setAttribute("aria-hidden", "false");
      } else {
        content.className = "accordion-content";
        this.setAttribute("aria-expanded", "false");
        content.setAttribute("aria-hidden", "true");
      }
    };
  }
}

// Табы
function initTabs() {
  var buttons = document.querySelectorAll(".tab-btn");

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].onclick = function () {
      var tabId = this.getAttribute("data-tab");

      // Убираем активный класс у всех
      var allBtns = document.querySelectorAll(".tab-btn");
      for (var j = 0; j < allBtns.length; j++) {
        allBtns[j].className = "tab-btn";
      }

      var allContents = document.querySelectorAll(".tab-content");
      for (var k = 0; k < allContents.length; k++) {
        allContents[k].className = "tab-content";
      }

      // Делаем текущий активным
      this.className = "tab-btn active";
      document.getElementById(tabId).className = "tab-content active";
    };
  }
}

// Форма с валидацией
function initForm() {
  var form = document.getElementById("preferencesForm");
  var nameInput = document.getElementById("name");
  var emailInput = document.getElementById("email");
  var messageInput = document.getElementById("message");
  var submitBtn = document.getElementById("submitBtn");

  // Проверка при вводе
  nameInput.oninput = function () {
    validateForm();
  };
  emailInput.oninput = function () {
    validateForm();
  };
  messageInput.oninput = function () {
    validateForm();
  };

  function validateForm() {
    var isValid = true;
    var nameError = document.getElementById("nameError");
    var emailError = document.getElementById("emailError");
    var messageError = document.getElementById("messageError");

    // Проверка имени
    if (nameInput.value == "") {
      nameError.innerHTML = "Введите имя";
      nameInput.className = "invalid";
      isValid = false;
    } else {
      nameError.innerHTML = "";
      nameInput.className = "";
    }

    // Проверка email (очень простая)
    if (emailInput.value.indexOf("@") == -1) {
      emailError.innerHTML = "Введите корректный email";
      emailInput.className = "invalid";
      isValid = false;
    } else {
      emailError.innerHTML = "";
      emailInput.className = "";
    }

    // Проверка сообщения
    if (messageInput.value.length < 20) {
      messageError.innerHTML =
        "Минимум 20 символов (сейчас: " + messageInput.value.length + ")";
      messageInput.className = "invalid";
      isValid = false;
    } else {
      messageError.innerHTML = "";
      messageInput.className = "";
    }

    // Активация кнопки
    if (isValid == true) {
      submitBtn.disabled = false;
    } else {
      submitBtn.disabled = true;
    }

    return isValid;
  }

  // Отправка формы
  form.onsubmit = function (e) {
    e.preventDefault();

    if (validateForm() == true) {
      var result = document.getElementById("formResult");
      result.innerHTML =
        "Спасибо, " + nameInput.value + "! Ваши предпочтения сохранены.";
      result.className = "success";

      // Очистка формы
      nameInput.value = "";
      emailInput.value = "";
      messageInput.value = "";
      submitBtn.disabled = true;
    }
  };
}

// Делегирование событий для карточек рецептов
function initRecipeActions() {
  var container = document.getElementById("recipesContainer");

  container.onclick = function (e) {
    var target = e.target;
    var card = target.closest(".recipe-card");

    if (card == null) return;

    var recipeId = card.getAttribute("data-id");

    // Лайк
    if (
      target.className == "like-btn" ||
      target.className == "like-btn liked"
    ) {
      if (target.className == "like-btn") {
        target.className = "like-btn liked";
        target.innerHTML = "💚 Liked";
      } else {
        target.className = "like-btn";
        target.innerHTML = "❤ Лайк";
      }
    }

    // Удаление
    if (target.className == "delete-btn") {
      card.remove();
    }

    // Ингредиенты
    if (target.className == "ingredients-btn") {
      openModal(recipeId);
    }
  };
}

// Модальное окно
function initModal() {
  var modal = document.getElementById("ingredientsModal");
  var closeBtn = document.getElementById("modalClose");

  closeBtn.onclick = function () {
    modal.className = "modal";
  };

  // Закрытие по клику на фон
  modal.onclick = function (e) {
    if (e.target == modal) {
      modal.className = "modal";
    }
  };

  // Закрытие по Escape
  document.onkeydown = function (e) {
    if (e.key == "Escape") {
      modal.className = "modal";
    }
  };
}

function openModal(recipeId) {
  var modal = document.getElementById("ingredientsModal");
  var title = document.getElementById("modalTitle");
  var list = document.getElementById("ingredientsList");

  var recipe = recipesData[recipeId];

  if (recipe != undefined) {
    title.innerHTML = recipe.name + " - Ингредиенты";

    var html = "";
    for (var i = 0; i < recipe.ingredients.length; i++) {
      html = html + "<li>" + recipe.ingredients[i] + "</li>";
    }
    list.innerHTML = html;
  }

  modal.className = "modal active";
}

// Бесполезная функция 1
function doNothing() {
  var temp = 1 + 1;
  return temp;
}

// Бесполезная функция 2
function alsoDoNothing() {
  console.log("эта функция ничего не делает");
}

// Бесполезная функция 3
function yetAnotherUselessFunction() {
  var arr = [1, 2, 3, 4, 5];
  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i] * 2;
  }
  return arr;
}
