// scripts/modules/form.js
export class FormValidator {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        this.submitBtn = this.form.querySelector('button[type="submit"]');
        this.nameInput = this.form.querySelector('#name');
        this.emailInput = this.form.querySelector('#email');
        this.messageInput = this.form.querySelector('#message');
        this.charCount = document.querySelector('#char-count');
        this.formResult = document.querySelector('#form-result');
        
        this.init();
        this.restoreFormState();
    }

    init() {
        // Валидация при вводе
        this.nameInput.addEventListener('input', () => this.validateName());
        this.emailInput.addEventListener('input', () => this.validateEmail());
        this.messageInput.addEventListener('input', () => {
            this.validateMessage();
            this.updateCharCount();
        });

        // Валидация при потере фокуса
        this.nameInput.addEventListener('blur', () => this.validateName());
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.messageInput.addEventListener('blur', () => this.validateMessage());

        // Отправка формы
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Изначальная проверка
        this.validateForm();
    }

    validateName() {
        const value = this.nameInput.value.trim();
        const errorElement = document.querySelector('#name-error');
        
        if (!value) {
            this.showError(this.nameInput, errorElement, 'Имя обязательно для заполнения');
            return false;
        }
        
        if (value.length < 2) {
            this.showError(this.nameInput, errorElement, 'Имя должно содержать минимум 2 символа');
            return false;
        }
        
        if (value.length > 50) {
            this.showError(this.nameInput, errorElement, 'Имя не должно превышать 50 символов');
            return false;
        }
        
        this.clearError(this.nameInput, errorElement);
        return true;
    }

    validateEmail() {
        const value = this.emailInput.value.trim();
        const errorElement = document.querySelector('#email-error');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!value) {
            this.showError(this.emailInput, errorElement, 'Email обязателен для заполнения');
            return false;
        }
        
        if (!emailRegex.test(value)) {
            this.showError(this.emailInput, errorElement, 'Введите корректный email адрес');
            return false;
        }
        
        this.clearError(this.emailInput, errorElement);
        return true;
    }

    validateMessage() {
        const value = this.messageInput.value.trim();
        const errorElement = document.querySelector('#message-error');
        
        if (!value) {
            this.showError(this.messageInput, errorElement, 'Сообщение обязательно для заполнения');
            return false;
        }
        
        if (value.length < 20) {
            this.showError(this.messageInput, errorElement, 'Сообщение должно содержать минимум 20 символов');
            return false;
        }
        
        if (value.length > 500) {
            this.showError(this.messageInput, errorElement, 'Сообщение не должно превышать 500 символов');
            return false;
        }
        
        this.clearError(this.messageInput, errorElement);
        return true;
    }

    validateForm() {
        const isNameValid = this.validateName();
        const isEmailValid = this.validateEmail();
        const isMessageValid = this.validateMessage();
        
        const isValid = isNameValid && isEmailValid && isMessageValid;
        
        // Активируем/деактивируем кнопку отправки
        this.submitBtn.disabled = !isValid;
        this.submitBtn.setAttribute('aria-disabled', !isValid);
        
        return isValid;
    }

    updateCharCount() {
        const count = this.messageInput.value.length;
        this.charCount.textContent = count;
        
        if (count > 500) {
            this.charCount.style.color = 'var(--danger-color)';
        } else if (count > 450) {
            this.charCount.style.color = 'var(--accent-color)';
        } else {
            this.charCount.style.color = 'var(--text-light)';
        }
    }

    showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
    }

    clearError(input, errorElement) {
        input.classList.remove('error');
        errorElement.textContent = '';
        errorElement.removeAttribute('role');
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        // Собираем данные формы
        const formData = {
            name: this.nameInput.value.trim(),
            email: this.emailInput.value.trim(),
            message: this.messageInput.value.trim(),
            timestamp: new Date().toISOString()
        };

        // Симулируем отправку
        this.showLoading(true);
        
        setTimeout(() => {
            this.showLoading(false);
            this.showSuccess(formData);
            this.saveFormData(formData);
            this.form.reset();
            this.updateCharCount();
            this.validateForm();
        }, 1500);
    }

    showLoading(isLoading) {
        const originalText = this.submitBtn.innerHTML;
        
        if (isLoading) {
            this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
            this.submitBtn.disabled = true;
        } else {
            this.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить сообщение';
            this.submitBtn.disabled = false;
        }
    }

    showSuccess(formData) {
        this.formResult.textContent = `Спасибо, ${formData.name}! Ваше сообщение отправлено. Мы свяжемся с вами на ${formData.email}.`;
        this.formResult.className = 'form-result success';
        
        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            this.formResult.textContent = '';
            this.formResult.className = 'form-result';
        }, 5000);
    }

    saveFormData(formData) {
        try {
            const savedForms = JSON.parse(localStorage.getItem('gadgetCollectionForms') || '[]');
            savedForms.push(formData);
            localStorage.setItem('gadgetCollectionForms', JSON.stringify(savedForms.slice(-10))); // Храним последние 10
        } catch (error) {
            console.error('Ошибка при сохранении формы:', error);
        }
    }

    restoreFormState() {
        try {
            const state = JSON.parse(localStorage.getItem('gadgetCollectionState') || '{}');
            if (state.formData) {
                this.nameInput.value = state.formData.name || '';
                this.emailInput.value = state.formData.email || '';
                this.messageInput.value = state.formData.message || '';
                this.updateCharCount();
                this.validateForm();
            }
        } catch (error) {
            console.error('Ошибка при восстановлении формы:', error);
        }
    }
}

// Экспортируем функции для тестов
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validateMessage(message) {
    return message && message.trim().length >= 20 && message.trim().length <= 500;
}