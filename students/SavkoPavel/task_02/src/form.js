export function initForm() {
    const form = document.getElementById('adoption-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const submitBtn = document.getElementById('submit-btn');
    const formResult = document.getElementById('form-result');
    
    // Валидация при вводе
    [nameInput, emailInput, messageInput].forEach(input => {
        input.addEventListener('input', validateForm);
        input.addEventListener('blur', validateField);
    });
    
    // Отправка формы
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            setTimeout(() => {
                formResult.textContent = 'Ваша заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.';
                formResult.className = 'form-result success';
                form.reset();
                submitBtn.disabled = true;
            }, 1000);
        } else {
            formResult.textContent = 'Пожалуйста, исправьте ошибки в форме.';
            formResult.className = 'form-result error';
        }
    });
    
    function validateField(e) {
        const field = e.target;
        let isValid = true;
        
        if (field.id === 'name') {
            isValid = field.value.trim() !== '';
        } else if (field.id === 'email') {
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        } else if (field.id === 'message') {
            isValid = field.value.length >= 20;
        }
        
        field.parentElement.classList.toggle('field-error', !isValid);
        return isValid;
    }
    
    function validateForm() {
        const isNameValid = nameInput.value.trim() !== '';
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
        const isMessageValid = messageInput.value.length >= 20;
        
        nameInput.parentElement.classList.toggle('field-error', !isNameValid);
        emailInput.parentElement.classList.toggle('field-error', !isEmailValid);
        messageInput.parentElement.classList.toggle('field-error', !isMessageValid);
        
        submitBtn.disabled = !(isNameValid && isEmailValid && isMessageValid);
        
        return isNameValid && isEmailValid && isMessageValid;
    }
}