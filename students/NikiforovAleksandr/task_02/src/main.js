document.addEventListener('DOMContentLoaded', () => {
     const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    }
 //1. Инициализация DOM-элементов
    const galleryContainer = document.getElementById('art-gallery-container');
    const form = document.getElementById('main-contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const resultDisplay = document.getElementById('submission-result');
    const menuToggle = document.getElementById('menu-toggle');
    const navList = document.getElementById('nav-list');

    const modal = document.getElementById('art-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    let focusedElementBeforeModal = null; 

    //2. БУРГЕР-МЕНЮ (Компонент + a11y) 
    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        
        navList.hidden = isExpanded;
        navList.classList.toggle('open');
    });

    //3. МОДАЛЬНОЕ ОКНО (Компонент + a11y) 

const openModal = (imgSrc, title, openingElement) => {
    focusedElementBeforeModal = openingElement;
    
    document.getElementById('modal-image').src = imgSrc;
    document.getElementById('modal-title').textContent = title;
    
    document.body.style.overflow = 'hidden';
    
    modal.hidden = false;
    modalCloseBtn.focus();
    
    document.addEventListener('keydown', handleEscape);
};

const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = ''; 
    
    document.removeEventListener('keydown', handleEscape);
    
    if (focusedElementBeforeModal) {
        focusedElementBeforeModal.focus();
    }
};
    modalCloseBtn.addEventListener('click', closeModal);

    const handleEscape = (event) => {
    if (event.key === 'Escape') {
        closeModal();
    }
    
    if (event.key === 'Tab' && !modal.hidden) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        }
    }
};


    //4. ДЕЛЕГИРОВАНИЕ СОБЫТИЙ (Лайки, Открытие Модалки) 
galleryContainer.addEventListener('click', (event) => {
    handleGalleryInteraction(event);
});

galleryContainer.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        handleGalleryInteraction(event);
        event.preventDefault();
    }
});

function handleGalleryInteraction(event) {
    const target = event.target;
    const card = target.closest('.art-card');

    if (!card) return;


    if (target.dataset.action === 'like') {
        event.preventDefault();
        event.stopPropagation(); 
        
        target.classList.toggle('liked');
        const isLiked = target.classList.contains('liked');
        target.setAttribute('aria-label', isLiked ? 'Убрать лайк' : 'Нравится');
        target.textContent = isLiked ? '❤️' : '🤍';
        
        const artId = card.dataset.id;
        localStorage.setItem(`like-${artId}`, isLiked);
    }

    if (target.dataset.action === 'open-modal' || target.classList.contains('art-image')) {
        event.preventDefault();
        const imgSrc = target.src;
        const title = card.querySelector('h3').textContent;
        const description = target.dataset.description || 'Описание арта отсутствует.';
        openModal(imgSrc, title, description, card); 
    }
}

//6. КЛИЕНТСКАЯ ВАЛИДАЦИЯ ФОРМЫ (Friendly Validation) 

const checkCustomValidity = (input) => {
    const minLength = input.dataset.minLength;
    
    if (minLength && input.value.length < parseInt(minLength) && input.value.length > 0) { 
        if (input.id === 'message') {
            return `Сообщение должно содержать минимум ${minLength} символов. (Сейчас: ${input.value.length})`;
        }
        return 'Поле слишком короткое.';
    }
    return ''; 
};

const displayError = (input, message) => {
    const errorSpan = input.nextElementSibling; 
    if (errorSpan && errorSpan.classList.contains('error-message')) {
        errorSpan.textContent = message;
        input.setAttribute('aria-invalid', message !== ''); 
    }
};

const checkFormValidity = () => {
    const inputs = form.querySelectorAll('input, textarea');
    let isFormValid = true;
    
    inputs.forEach(input => {
        if (!input.checkValidity() || checkCustomValidity(input) !== '') {
            isFormValid = false;
        }
    });
    return isFormValid;
};

form.addEventListener('input', (event) => {
    const input = event.target;
    let errorMessage = '';

    if (!input.checkValidity()) {
        errorMessage = input.validationMessage;
        if (input.id === 'email' && input.validity.typeMismatch) {
            errorMessage = 'Пожалуйста, введите корректный адрес электронной почты (например, user@example.com).';
        } else if (input.id === 'name' && input.validity.valueMissing) {
            errorMessage = 'Поле "Имя" обязательно для заполнения.';
        }
    } 
    else {
        errorMessage = checkCustomValidity(input);
    }
    
    displayError(input, errorMessage);
    
    submitBtn.disabled = !checkFormValidity();
});

form.addEventListener('submit', (event) => {
    event.preventDefault(); 
    
    form.querySelectorAll('input, textarea').forEach(input => {
         input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    if (checkFormValidity()) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        resultDisplay.textContent = '✅ Успешно отправлено! Данные (отправка предотвращена): ' + JSON.stringify(data);
        
        form.reset(); 
        submitBtn.disabled = true; 
    } else {
        resultDisplay.textContent = '❌ Пожалуйста, исправьте ошибки в форме.';
        
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) {
            firstInvalid.focus();
        }
    }
});
});