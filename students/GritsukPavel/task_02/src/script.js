// Глобальные переменные
var currentTab = 'concerts';
var isModalOpen = false;
var tooltipElement;
var modalElement;
var formData = {};

// Инициализация при загрузке страницы
window.onload = function() {
    console.log('Страница загружена');
    init();
}

function init() {
    tooltipElement = document.getElementById('tooltip');
    modalElement = document.getElementById('event-modal');
    
    // Табы
    setupTabs();
    
    // Бургер меню
    setupBurgerMenu();
    
    // Аккордеон
    setupAccordion();
    
    // Форма
    setupForm();
    
    // Делегирование событий для карточек
    setupEventCards();
    
    // Модальное окно
    setupModal();
    
    // Tooltip
    setupTooltips();
}

// Табы
function setupTabs() {
    var tabButtons = document.querySelectorAll('.tab-btn');
    
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].onclick = function() {
            var tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        }
        
        // Клавиатурная доступность
        tabButtons[i].onkeydown = function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        }
    }
}

function switchTab(tabName) {
    currentTab = tabName;
    
    // Скрыть все панели
    var panels = document.querySelectorAll('.tab-panel');
    for (var i = 0; i < panels.length; i++) {
        panels[i].classList.remove('active');
    }
    
    // Убрать активный класс у всех кнопок
    var buttons = document.querySelectorAll('.tab-btn');
    for (var j = 0; j < buttons.length; j++) {
        buttons[j].classList.remove('active');
    }
    
    // Показать нужную панель
    var targetPanel = document.getElementById(tabName);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
    
    // Активировать нужную кнопку
    var activeButton = document.querySelector('[data-tab="' + tabName + '"]');
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Бургер меню
function setupBurgerMenu() {
    var burgerBtn = document.querySelector('.burger-btn');
    var burgerNav = document.querySelector('.burger-nav');
    
    burgerBtn.onclick = function() {
        if (burgerNav.classList.contains('active')) {
            burgerNav.classList.remove('active');
        } else {
            burgerNav.classList.add('active');
        }
    }
    
    // Закрытие по клику вне меню
    document.onclick = function(e) {
        if (!e.target.closest('.burger-menu')) {
            burgerNav.classList.remove('active');
        }
    }
    
    // Клавиатура
    burgerBtn.onkeydown = function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
        if (e.key === 'Escape') {
            burgerNav.classList.remove('active');
        }
    }
}

// Аккордеон
function setupAccordion() {
    var accordionButtons = document.querySelectorAll('.accordion-btn');
    
    for (var i = 0; i < accordionButtons.length; i++) {
        accordionButtons[i].onclick = function() {
            toggleAccordion(this);
        }
        
        accordionButtons[i].onkeydown = function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        }
    }
}

function toggleAccordion(button) {
    var content = button.nextElementSibling;
    
    if (button.classList.contains('active')) {
        button.classList.remove('active');
        content.classList.remove('active');
    } else {
        // Закрыть все остальные
        var allButtons = document.querySelectorAll('.accordion-btn');
        var allContents = document.querySelectorAll('.accordion-content');
        
        for (var i = 0; i < allButtons.length; i++) {
            allButtons[i].classList.remove('active');
            allContents[i].classList.remove('active');
        }
        
        button.classList.add('active');
        content.classList.add('active');
    }
}

// Форма
function setupForm() {
    var form = document.getElementById('contact-form');
    var nameInput = document.getElementById('name');
    var emailInput = document.getElementById('email');
    var messageInput = document.getElementById('message');
    var submitBtn = document.getElementById('submit-btn');
    
    // Валидация при вводе
    nameInput.oninput = function() {
        validateName();
        checkFormValidity();
    }
    
    emailInput.oninput = function() {
        validateEmail();
        checkFormValidity();
    }
    
    messageInput.oninput = function() {
        validateMessage();
        checkFormValidity();
    }
    
    // Отправка формы
    form.onsubmit = function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    }
}

function validateName() {
    var nameInput = document.getElementById('name');
    var errorSpan = nameInput.nextElementSibling;
    
    if (nameInput.value.trim() === '') {
        errorSpan.textContent = 'Имя обязательно для заполнения';
        nameInput.classList.add('invalid');
        return false;
    } else {
        errorSpan.textContent = '';
        nameInput.classList.remove('invalid');
        return true;
    }
}

function validateEmail() {
    var emailInput = document.getElementById('email');
    var errorSpan = emailInput.nextElementSibling;
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailInput.value.trim() === '') {
        errorSpan.textContent = 'Email обязателен для заполнения';
        emailInput.classList.add('invalid');
        return false;
    } else if (!emailRegex.test(emailInput.value)) {
        errorSpan.textContent = 'Введите корректный email';
        emailInput.classList.add('invalid');
        return false;
    } else {
        errorSpan.textContent = '';
        emailInput.classList.remove('invalid');
        return true;
    }
}

function validateMessage() {
    var messageInput = document.getElementById('message');
    var errorSpan = messageInput.nextElementSibling;
    
    if (messageInput.value.trim().length < 20) {
        errorSpan.textContent = 'Сообщение должно содержать минимум 20 символов (сейчас: ' + messageInput.value.trim().length + ')';
        messageInput.classList.add('invalid');
        return false;
    } else {
        errorSpan.textContent = '';
        messageInput.classList.remove('invalid');
        return true;
    }
}

function validateForm() {
    var nameValid = validateName();
    var emailValid = validateEmail();
    var messageValid = validateMessage();
    
    return nameValid && emailValid && messageValid;
}

function checkFormValidity() {
    var submitBtn = document.getElementById('submit-btn');
    
    if (validateForm()) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
}

function submitForm() {
    var nameInput = document.getElementById('name');
    var emailInput = document.getElementById('email');
    var messageInput = document.getElementById('message');
    var resultDiv = document.getElementById('form-result');
    
    formData.name = nameInput.value;
    formData.email = emailInput.value;
    formData.message = messageInput.value;
    
    // Имитация отправки
    console.log('Отправка формы:', formData);
    
    resultDiv.className = 'success';
    resultDiv.textContent = 'Спасибо! Ваше сообщение успешно отправлено. Имя: ' + formData.name + ', Email: ' + formData.email;
    
    // Очистка формы
    nameInput.value = '';
    emailInput.value = '';
    messageInput.value = '';
    
    checkFormValidity();
    
    // Скрыть сообщение через 5 секунд
    setTimeout(function() {
        resultDiv.style.display = 'none';
    }, 5000);
}

// Делегирование событий для карточек событий
function setupEventCards() {
    var eventsLists = document.querySelectorAll('.events-list');
    
    for (var i = 0; i < eventsLists.length; i++) {
        eventsLists[i].onclick = function(e) {
            // Кнопка "Подробнее"
            if (e.target.classList.contains('btn-details')) {
                openModal(e.target);
            }
            
            // Кнопка "Лайк"
            if (e.target.classList.contains('btn-like')) {
                toggleLike(e.target);
            }
            
            // Кнопка "Удалить"
            if (e.target.classList.contains('btn-delete')) {
                deleteCard(e.target);
            }
        }
    }
}

function openModal(button) {
    var card = button.closest('.event-card');
    var title = card.querySelector('h3').textContent;
    var info = card.querySelectorAll('p');
    
    var modalTitle = document.getElementById('modal-title');
    var modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = '<p><strong>Дата:</strong> ' + info[0].textContent + '</p>';
    modalBody.innerHTML += '<p><strong>Место:</strong> ' + info[1].textContent + '</p>';
    modalBody.innerHTML += '<p>Это событие обещает быть захватывающим! Не пропустите возможность посетить его. Билеты можно приобрести онлайн или в кассах перед началом мероприятия.</p>';
    
    modalElement.classList.add('active');
    isModalOpen = true;
}

function toggleLike(button) {
    if (button.classList.contains('liked')) {
        button.classList.remove('liked');
        button.textContent = '♡';
    } else {
        button.classList.add('liked');
        button.textContent = '♥';
    }
}

function deleteCard(button) {
    var card = button.closest('.event-card');
    if (confirm('Вы уверены, что хотите удалить это событие?')) {
        card.remove();
    }
}

// Модальное окно
function setupModal() {
    var closeBtn = document.querySelector('.modal-close');
    
    closeBtn.onclick = function() {
        closeModal();
    }
    
    // Закрытие по клику вне модалки
    modalElement.onclick = function(e) {
        if (e.target === modalElement) {
            closeModal();
        }
    }
    
    // Закрытие по Escape
    document.onkeydown = function(e) {
        if (e.key === 'Escape' && isModalOpen) {
            closeModal();
        }
    }
}

function closeModal() {
    modalElement.classList.remove('active');
    isModalOpen = false;
}

// Tooltip
function setupTooltips() {
    var tooltipTriggers = document.querySelectorAll('[data-tooltip]');
    
    for (var i = 0; i < tooltipTriggers.length; i++) {
        tooltipTriggers[i].onmouseenter = function(e) {
            showTooltip(e, this.getAttribute('data-tooltip'));
        }
        
        tooltipTriggers[i].onmouseleave = function() {
            hideTooltip();
        }
        
        tooltipTriggers[i].onmousemove = function(e) {
            updateTooltipPosition(e);
        }
    }
}

function showTooltip(e, text) {
    tooltipElement.textContent = text;
    tooltipElement.classList.add('active');
    updateTooltipPosition(e);
}

function hideTooltip() {
    tooltipElement.classList.remove('active');
}

function updateTooltipPosition(e) {
    var x = e.pageX + 10;
    var y = e.pageY + 10;
    
    tooltipElement.style.left = x + 'px';
    tooltipElement.style.top = y + 'px';
}


function unusedFunction() {
    var temp = 'Эта функция никогда не вызывается';
    console.log(temp);
    for (var i = 0; i < 100; i++) {
        console.log(i);
    }
}


var anotherUnusedFunction = function() {
    return true;
}
