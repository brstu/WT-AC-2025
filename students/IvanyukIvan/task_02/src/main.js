// Данные для галереи
const galleryData = {
    portrait: [
        {
            id: 1,
            src: 'assets/w1.jpg',
            title: 'Фото женщины',
            exif: 'Canon EOS R5, f/2.8, 1/125s, ISO 200'
        },
        {
            id: 2,
            src: 'assets/m1.jpg',
            title: 'Фото мужчины',
            exif: 'Sony A7III, f/1.8, 1/250s, ISO 100'
        },
        {
            id: 3,
            src: 'assets/c1.jpg',
            title: 'Детское фото',
            exif: 'Nikon Z6, f/2.0, 1/200s, ISO 400'
        },
        {
            id: 4,
            src: 'assets/e1.png',
            title: 'Фото пожилой пары',
            exif: 'Fujifilm X-T4, f/2.8, 1/160s, ISO 320'
        }
    ],
    nature: [
        {
            id: 5,
            src: 'assets/forest.jpg',
            title: 'Лесной пейзаж',
            exif: 'Canon 5D Mark IV, f/8, 1/60s, ISO 100'
        },
        {
            id: 6,
            src: 'assets/mountan.jpg',
            title: 'Горный пейзаж',
            exif: 'Sony A7R IV, f/11, 1/125s, ISO 100'
        },
        {
            id: 7,
            src: 'assets/waterfall.jpg',
            title: 'Водопад',
            exif: 'Nikon D850, f/16, 1s, ISO 50'
        },
        {
            id: 8,
            src: 'assets/sunset.jpg',
            title: 'Закат',
            exif: 'Fujifilm GFX 100, f/5.6, 1/250s, ISO 200'
        }
    ],
    urban: [
        {
            id: 9,
            src: 'assets/nightcity.jpg',
            title: 'Ночной город',
            exif: 'Sony A7S III, f/1.4, 1/30s, ISO 3200'
        },
        {
            id: 10,
            src: 'assets/architecture.jpg',
            title: 'Архитектура',
            exif: 'Canon R6, f/8, 1/125s, ISO 100'
        },
        {
            id: 11,
            src: 'assets/street.jpg',
            title: 'Уличная фотография',
            exif: 'Leica M10, f/2, 1/250s, ISO 400'
        },
        {
            id: 12,
            src: 'assets/grafity.jpg',
            title: 'Граффити',
            exif: 'Nikon Z7, f/4, 1/200s, ISO 200'
        }
    ]
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация галереи
    initGallery();
    
    // Инициализация табов
    initTabs();
    
    // Инициализация аккордеона
    initAccordion();
    
    // Инициализация бургер-меню
    initBurgerMenu();
    
    // Инициализация формы
    initForm();
    
    // Инициализация модального окна
    initModal();
});

// Функция инициализации галереи
function initGallery() {
    for (const category in galleryData) {
        const galleryElement = document.getElementById(`${category}-gallery`);
        
        galleryData[category].forEach(item => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.setAttribute('data-id', item.id);
            galleryItem.setAttribute('data-category', category);
            galleryItem.setAttribute('tabindex', '0');
            galleryItem.setAttribute('role', 'button');
            galleryItem.setAttribute('aria-label', `Открыть изображение: ${item.title}`);
            
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.title;
            
            galleryItem.appendChild(img);
            galleryElement.appendChild(galleryItem);
        });
    }
    
    // Делегирование событий для галереи
    document.querySelectorAll('.gallery').forEach(gallery => {
        gallery.addEventListener('click', function(e) {
            const galleryItem = e.target.closest('.gallery-item');
            if (galleryItem) {
                const id = parseInt(galleryItem.getAttribute('data-id'));
                const category = galleryItem.getAttribute('data-category');
                openModal(id, category);
            }
        });
        
        // Обработка клавиатуры для галереи
        gallery.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const galleryItem = e.target.closest('.gallery-item');
                if (galleryItem) {
                    const id = parseInt(galleryItem.getAttribute('data-id'));
                    const category = galleryItem.getAttribute('data-category');
                    openModal(id, category);
                }
            }
        });
    });
}

// Функция инициализации табов
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Скрыть все табы
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.setAttribute('hidden', '');
            });
            
            // Убрать выделение со всех кнопок
            tabButtons.forEach(btn => {
                btn.setAttribute('aria-selected', 'false');
            });
            
            // Показать выбранный таб
            const panelId = this.getAttribute('aria-controls');
            const panel = document.getElementById(panelId);
            panel.classList.add('active');
            panel.removeAttribute('hidden');
            
            // Выделить активную кнопку
            this.setAttribute('aria-selected', 'true');
        });
        
        // Обработка клавиатуры для табов
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// Функция инициализации аккордеона
function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const item = this.parentElement;
            const isActive = item.classList.contains('active');
            
            // Закрыть все элементы аккордеона
            document.querySelectorAll('.accordion-item').forEach(accordionItem => {
                accordionItem.classList.remove('active');
                const content = accordionItem.querySelector('.accordion-content');
                content.style.maxHeight = null;
                accordionItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
            });
            
            // Открыть текущий, если он был закрыт
            if (!isActive) {
                item.classList.add('active');
                const content = item.querySelector('.accordion-content');
                content.style.maxHeight = content.scrollHeight + 'px';
                this.setAttribute('aria-expanded', 'true');
            }
        });
        
        // Обработка клавиатуры для аккордеона
        header.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// Функция инициализации бургер-меню
function initBurgerMenu() {
    const burgerMenu = document.querySelector('.burger-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    burgerMenu.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
    });
    
    // Закрытие меню при клике вне его области
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.burger-menu') && !e.target.closest('.nav-menu')) {
            burgerMenu.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
        }
    });
}

// Функция инициализации формы
function initForm() {
    const form = document.getElementById('contact-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const submitBtn = document.getElementById('submit-btn');
    const formResult = document.getElementById('form-result');
    
    // Валидация при вводе
    [nameInput, emailInput, messageInput].forEach(input => {
        input.addEventListener('input', validateForm);
        input.addEventListener('blur', validateForm);
    });
    
    // Отправка формы
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            // Имитация отправки формы
            formResult.textContent = 'Сообщение успешно отправлено!';
            formResult.className = 'form-result success';
            formResult.style.display = 'block';
            
            // Сброс формы
            form.reset();
            submitBtn.disabled = true;
            
            // Скрыть результат через 5 секунд
            setTimeout(() => {
                formResult.style.display = 'none';
            }, 5000);
        } else {
            formResult.textContent = 'Пожалуйста, исправьте ошибки в форме.';
            formResult.className = 'form-result error';
            formResult.style.display = 'block';
        }
    });
    
    // Функция валидации формы
    function validateForm() {
        let isValid = true;
        
        // Валидация имени
        const nameError = document.getElementById('name-error');
        if (!nameInput.value.trim()) {
            nameError.textContent = 'Поле "Имя" обязательно для заполнения.';
            nameError.style.display = 'block';
            isValid = false;
        } else {
            nameError.style.display = 'none';
        }
        
        // Валидация email
        const emailError = document.getElementById('email-error');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim()) {
            emailError.textContent = 'Поле "E-mail" обязательно для заполнения.';
            emailError.style.display = 'block';
            isValid = false;
        } else if (!emailRegex.test(emailInput.value)) {
            emailError.textContent = 'Введите корректный e-mail адрес.';
            emailError.style.display = 'block';
            isValid = false;
        } else {
            emailError.style.display = 'none';
        }
        
        // Валидация сообщения
        const messageError = document.getElementById('message-error');
        if (!messageInput.value.trim()) {
            messageError.textContent = 'Поле "Сообщение" обязательно для заполнения.';
            messageError.style.display = 'block';
            isValid = false;
        } else if (messageInput.value.trim().length < 20) {
            messageError.textContent = 'Сообщение должно содержать не менее 20 символов.';
            messageError.style.display = 'block';
            isValid = false;
        } else {
            messageError.style.display = 'none';
        }
        
        // Активация/деактивация кнопки отправки
        submitBtn.disabled = !isValid;
        
        return isValid;
    }
}

// Функция инициализации модального окна
function initModal() {
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modal-close');
    const modalPrev = document.getElementById('modal-prev');
    const modalNext = document.getElementById('modal-next');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const exifTooltip = document.getElementById('exif-tooltip');
    
    let currentImageIndex = 0;
    let currentCategory = '';
    let currentImages = [];
    
    // Функция открытия модального окна
    window.openModal = function(id, category) {
        currentCategory = category;
        currentImages = galleryData[category];
        currentImageIndex = currentImages.findIndex(item => item.id === id);
        
        updateModal();
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Блокировка прокрутки страницы
        
        // Фокус на кнопке закрытия для доступности
        modalClose.focus();
    };
    
    // Функция закрытия модального окна
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Разблокировка прокрутки страницы
    }
    
    // Функция обновления содержимого модального окна
    function updateModal() {
        const currentImage = currentImages[currentImageIndex];
        modalImage.src = currentImage.src;
        modalImage.alt = currentImage.title;
        modalTitle.textContent = currentImage.title;
        exifTooltip.textContent = currentImage.exif;
    }
    
    // Функция перехода к следующему изображению
    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % currentImages.length;
        updateModal();
    }
    
    // Функция перехода к предыдущему изображению
    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
        updateModal();
    }
    
    // Обработчики событий для модального окна
    modalClose.addEventListener('click', closeModal);
    modalPrev.addEventListener('click', prevImage);
    modalNext.addEventListener('click', nextImage);
    
    // Закрытие модального окна при клике вне изображения
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Обработка клавиатуры для модального окна
    document.addEventListener('keydown', function(e) {
        if (modal.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeModal();
            } else if (e.key === 'ArrowLeft') {
                prevImage();
            } else if (e.key === 'ArrowRight') {
                nextImage();
            }
        }
    });
}