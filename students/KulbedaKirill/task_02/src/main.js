// Глобальные переменные
var cart = [];
var cartCount = 0;
var total = 0;

// DOM элементы
var productsContainer = document.getElementById("productsContainer");
var cartBtn = document.getElementById("cartBtn");
var cartModal = document.getElementById("cartModal");
var modalClose = document.getElementById("modalClose");
var cartItems = document.getElementById("cartItems");
var cartCountEl = document.getElementById("cartCount");
var cartTotalEl = document.getElementById("cartTotal");
var burgerBtn = document.getElementById("burgerBtn");
var navMenu = document.getElementById("navMenu");
var contactForm = document.getElementById("contactForm");
var submitBtn = document.getElementById("submitBtn");
var formResult = document.getElementById("formResult");
var accordion = document.getElementById("accordion");

// Делегирование событий на контейнере товаров
productsContainer.onclick = function (e) {
  var target = e.target;

  // Добавление в корзину
  if (target.className == "add-to-cart-btn") {
    var card = target.parentElement;
    var id = card.getAttribute("data-id");
    var name = card.getAttribute("data-name");
    var price = card.getAttribute("data-price");

    // Добавляем товар в корзину
    var found = false;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id == id) {
        cart[i].qty = cart[i].qty + 1;
        found = true;
      }
    }

    if (found == false) {
      cart.push({
        id: id,
        name: name,
        price: parseInt(price),
        qty: 1,
      });
    }

    updateCart();
  }

  // Лайк
  if (target.className == "like-btn") {
    target.className = "like-btn liked";
    target.innerHTML = "♥";
  }
  if (target.className == "like-btn liked") {
    // уже залайкан
  }
};

// Обновление корзины
function updateCart() {
  cartCount = 0;
  total = 0;

  for (var i = 0; i < cart.length; i++) {
    cartCount = cartCount + cart[i].qty;
    total = total + cart[i].price * cart[i].qty;
  }

  cartCountEl.innerHTML = cartCount;
  cartTotalEl.innerHTML = total;

  // Рендер элементов корзины
  var html = "";
  for (var i = 0; i < cart.length; i++) {
    html = html + '<div class="cart-item">';
    html = html + "<span>" + cart[i].name + " x" + cart[i].qty + "</span>";
    html = html + "<span>" + cart[i].price * cart[i].qty + " ₽</span>";
    html =
      html +
      '<button class="cart-item-remove" data-index="' +
      i +
      '">Удалить</button>';
    html = html + "</div>";
  }
  cartItems.innerHTML = html;
}

// Удаление из корзины
cartItems.onclick = function (e) {
  if (e.target.className == "cart-item-remove") {
    var index = e.target.getAttribute("data-index");
    cart.splice(index, 1);
    updateCart();
  }
};

// Открытие модалки корзины
cartBtn.onclick = function () {
  cartModal.className = "modal open";
};

// Закрытие модалки
modalClose.onclick = function () {
  cartModal.className = "modal";
};

cartModal.onclick = function (e) {
  if (e.target == cartModal) {
    cartModal.className = "modal";
  }
};

// Бургер меню
burgerBtn.onclick = function () {
  if (navMenu.className == "nav-menu") {
    navMenu.className = "nav-menu open";
  } else {
    navMenu.className = "nav-menu";
  }
};

// Аккордеон
var accordionHeaders = document.querySelectorAll(".accordion-header");
for (var i = 0; i < accordionHeaders.length; i++) {
  accordionHeaders[i].onclick = function () {
    var content = this.nextElementSibling;
    if (content.className == "accordion-content") {
      content.className = "accordion-content open";
    } else {
      content.className = "accordion-content";
    }
  };
}

// Валидация формы
var nameInput = document.getElementById("name");
var emailInput = document.getElementById("email");
var messageInput = document.getElementById("message");
var nameError = document.getElementById("nameError");
var emailError = document.getElementById("emailError");
var messageError = document.getElementById("messageError");

function validateName() {
  if (nameInput.value == "") {
    nameError.innerHTML = "Введите имя";
    nameInput.className = "invalid";
    return false;
  } else {
    nameError.innerHTML = "";
    nameInput.className = "";
    return true;
  }
}

function validateEmail() {
  var email = emailInput.value;
  if (email == "") {
    emailError.innerHTML = "Введите e-mail";
    emailInput.className = "invalid";
    return false;
  }
  // Простая проверка email
  if (email.indexOf("@") == -1) {
    emailError.innerHTML = "Неверный формат e-mail";
    emailInput.className = "invalid";
    return false;
  }
  emailError.innerHTML = "";
  emailInput.className = "";
  return true;
}

function validateMessage() {
  if (messageInput.value.length < 20) {
    messageError.innerHTML = "Сообщение должно содержать минимум 20 символов";
    messageInput.className = "invalid";
    return false;
  }
  messageError.innerHTML = "";
  messageInput.className = "";
  return true;
}

function validateForm() {
  var isValid = true;

  if (validateName() == false) {
    isValid = false;
  }
  if (validateEmail() == false) {
    isValid = false;
  }
  if (validateMessage() == false) {
    isValid = false;
  }

  if (isValid) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }

  return isValid;
}

nameInput.onkeyup = function () {
  validateForm();
};
emailInput.onkeyup = function () {
  validateForm();
};
messageInput.onkeyup = function () {
  validateForm();
};

contactForm.onsubmit = function (e) {
  e.preventDefault();

  if (validateForm()) {
    formResult.innerHTML = "Спасибо! Ваше сообщение отправлено.";
    formResult.className = "success";

    // Очистка формы
    nameInput.value = "";
    emailInput.value = "";
    messageInput.value = "";
    submitBtn.disabled = true;
  }
};

// Обработка клавиатуры для модалки
document.onkeydown = function (e) {
  if (e.keyCode == 27) {
    cartModal.className = "modal";
  }
};
