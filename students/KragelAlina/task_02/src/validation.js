/**
 * Возвращает сообщение об ошибке для поля, или пустую строку, если валидно.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @returns {string}
 */
export const getValidationMessage = (field) => {
    const value = field.value.trim();
    const minLength = parseInt(field.minLength || 0, 10);
    
    if (!value) {
        return 'Это поле обязательно';
    }

    if (value.length < minLength) {
        return `Минимум ${minLength} символов`;
    }

    if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return 'Введите корректный e-mail';
        }
    }
    return '';
};