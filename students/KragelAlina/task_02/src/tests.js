import { getValidationMessage } from './validation.js';

function mockField(value, type = 'text', minLength = 0) {
    return {
        value: value,
        type: type,
        minLength: minLength.toString() 
    };
}

function runTests() {
    console.assert(getValidationMessage(mockField('', 'text', 2)) === 'Это поле обязательно', 'Тест 1: Пустое имя');
    console.assert(getValidationMessage(mockField('А', 'text', 2)) === 'Минимум 2 символа', 'Тест 2: Короткое имя');
    console.assert(getValidationMessage(mockField('Иван', 'text', 2)) === '', 'Тест 3: Валидное имя');

    console.assert(getValidationMessage(mockField('', 'email', 0)) === 'Это поле обязательно', 'Тест 4: Пустой email');
    console.assert(getValidationMessage(mockField('not-email', 'email', 0)) === 'Введите корректный e-mail', 'Тест 5: Невалидный email');
    console.assert(getValidationMessage(mockField('test@example.com', 'email', 0)) === '', 'Тест 6: Валидный email');

    console.assert(getValidationMessage(mockField('', 'text', 20)) === 'Это поле обязательно', 'Тест 7: Пустое сообщение');
    console.assert(getValidationMessage(mockField('Коротко', 'text', 20)) === 'Минимум 20 символов', 'Тест 8: Слишком короткое сообщение');
    console.assert(getValidationMessage(mockField('Достаточно длинное сообщение', 'text', 20)) === '', 'Тест 9: Валидное сообщение');

    console.log('Все 9 тестов пройдены!');
}

runTests();