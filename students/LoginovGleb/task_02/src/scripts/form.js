/**
 * Компонент валидации формы
 * Обрабатывает клиентскую валидацию формы с пользовательскими сообщениями об ошибках
 */

const MIN_MESSAGE_LENGTH = 20;

/**
 * Правила валидации и сообщения об ошибках
 */
const validationRules = {
    name: {
        required: true,
        minLength: 2,
        pattern: /^[а-яА-ЯёЁa-zA-Z\s-]+$/,
        messages: {
            required: 'Пожалуйста, введите ваше имя',
            minLength: 'Имя должно содержать минимум 2 символа',
            pattern: 'Имя может содержать только буквы, пробелы и дефисы'
        }
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        messages: {
            required: 'Пожалуйста, введите ваш email',
            pattern: 'Пожалуйста, введите корректный email адрес'
        }
    },
    message: {
        required: true,
        minLength: MIN_MESSAGE_LENGTH,
        messages: {
            required: 'Пожалуйста, введите сообщение',
            minLength: `Сообщение должно содержать минимум ${MIN_MESSAGE_LENGTH} символов`
        }
    }
};

/**
 * Инициализация валидации формы
 */
export function initForm() {
    const form = document.getElementById('subscription-form');
    if (!form) return;
    
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const messageInput = form.querySelector('#message');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Добавить обработчики input для валидации в реальном времени
    if (nameInput) {
        nameInput.addEventListener('input', () => validateField(nameInput, 'name'));
        nameInput.addEventListener('blur', () => validateField(nameInput, 'name'));
    }
    
    if (emailInput) {
        emailInput.addEventListener('input', () => validateField(emailInput, 'email'));
        emailInput.addEventListener('blur', () => validateField(emailInput, 'email'));
    }
    
    if (messageInput) {
        messageInput.addEventListener('input', () => validateField(messageInput, 'message'));
        messageInput.addEventListener('blur', () => validateField(messageInput, 'message'));
    }
    
    // Валидировать при любом вводе, чтобы включать/отключать кнопку отправки
    form.addEventListener('input', () => {
        updateSubmitButton(form, submitButton);
    });
    
    // Обработать отправку формы
    form.addEventListener('submit', (e) => handleSubmit(e, form));
}

/**
 * Проверить одно поле формы
 * @param {HTMLElement} field - Элемент поля
 * @param {string} fieldName - Имя поля
 * @returns {boolean} true если валидно, иначе false
 */
export function validateField(field, fieldName) {
    const rules = validationRules[fieldName];
    if (!rules) return true;
    
    const value = field.value.trim();
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    // Проверка обязательности
    if (rules.required && !value) {
        showError(field, errorElement, rules.messages.required);
        return false;
    }
    
    // Проверка минимальной длины
    if (rules.minLength && value.length > 0 && value.length < rules.minLength) {
        showError(field, errorElement, rules.messages.minLength);
        return false;
    }
    
    // Проверка шаблона (pattern)
    if (rules.pattern && value.length > 0 && !rules.pattern.test(value)) {
        showError(field, errorElement, rules.messages.pattern);
        return false;
    }
    
    // Все проверки пройдены
    clearError(field, errorElement);
    return true;
}

/**
 * Показать сообщение об ошибке валидации
 * @param {HTMLElement} field - Элемент поля
 * @param {HTMLElement} errorElement - Элемент для сообщения об ошибке
 * @param {string} message - Текст сообщения
 */
function showError(field, errorElement, message) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    
    if (errorElement) {
        errorElement.textContent = message;
    }
}

/**
 * Очистить сообщение об ошибке
 * @param {HTMLElement} field - Элемент поля
 * @param {HTMLElement} errorElement - Элемент для сообщения об ошибке
 */
function clearError(field, errorElement) {
    field.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');
    
    if (errorElement) {
        errorElement.textContent = '';
    }
}

/**
 * Обновить состояние кнопки отправки в зависимости от валидности формы
 * @param {HTMLFormElement} form - Элемент формы
 * @param {HTMLElement} submitButton - Кнопка отправки
 */
function updateSubmitButton(form, submitButton) {
    if (!submitButton) return;
    
    const isValid = isFormValid(form);
    
    submitButton.disabled = !isValid;
    submitButton.setAttribute('aria-disabled', !isValid);
}

/**
 * Проверить валидность всей формы
 * @param {HTMLFormElement} form - Элемент формы
 * @returns {boolean} true если форма валидна, иначе false
 */
function isFormValid(form) {
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const messageInput = form.querySelector('#message');
    
    const nameValid = nameInput ? isFieldValid(nameInput, 'name') : false;
    const emailValid = emailInput ? isFieldValid(emailInput, 'email') : false;
    const messageValid = messageInput ? isFieldValid(messageInput, 'message') : false;
    
    return nameValid && emailValid && messageValid;
}

/**
 * Проверить валидность поля (без показа ошибок)
 * @param {HTMLElement} field - Элемент поля
 * @param {string} fieldName - Имя поля
 * @returns {boolean} true если валидно, иначе false
 */
function isFieldValid(field, fieldName) {
    const rules = validationRules[fieldName];
    if (!rules) return true;
    
    const value = field.value.trim();
    
    if (rules.required && !value) return false;
    if (rules.minLength && value.length < rules.minLength) return false;
    if (rules.pattern && !rules.pattern.test(value)) return false;
    
    return true;
}

/**
 * Обработать отправку формы
 * @param {Event} e - Событие submit
 * @param {HTMLFormElement} form - Элемент формы
 */
function handleSubmit(e, form) {
    e.preventDefault();
    
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const messageInput = form.querySelector('#message');
    
    // Проверить все поля
    const nameValid = nameInput ? validateField(nameInput, 'name') : false;
    const emailValid = emailInput ? validateField(emailInput, 'email') : false;
    const messageValid = messageInput ? validateField(messageInput, 'message') : false;
    
    if (nameValid && emailValid && messageValid) {
        // Форма валидна — показать сообщение об успехе
        showSuccessMessage(form, {
            name: nameInput.value,
            email: emailInput.value,
            message: messageInput.value
        });
        
        // Reset form
        form.reset();
        
        // Clear all errors
        clearError(nameInput, document.getElementById('name-error'));
        clearError(emailInput, document.getElementById('email-error'));
        clearError(messageInput, document.getElementById('message-error'));
        
        // Disable submit button again
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.setAttribute('aria-disabled', 'true');
        }
    } else {
        // Установить фокус на первое невалидное поле
        const firstInvalid = form.querySelector('.error');
        if (firstInvalid) {
            firstInvalid.focus();
        }
    }
}

/**
 * Показать сообщение об успешной отправке
 * @param {HTMLFormElement} form - Элемент формы
 * @param {Object} data - Данные формы
 */
function showSuccessMessage(form, data) {
    const successElement = document.getElementById('form-success');
    if (!successElement) return;
    
    successElement.hidden = false;
    
    // Логировать данные формы в консоль (в реальном приложении — отправить на сервер)
    console.log('Form submitted successfully:', data);
    
    // Скрыть сообщение об успехе через 5 секунд
    setTimeout(() => {
        successElement.hidden = true;
    }, 5000);
    
    // Прокрутить к сообщению об успехе
    successElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
