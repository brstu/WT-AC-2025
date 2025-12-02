/**
 * Unit-тесты для валидации формы
 * Тестирует чистые функции валидации из form.js
 */

import {
    validateValue,
    validateFormValues,
    validationRules,
    MIN_MESSAGE_LENGTH
} from '../src/scripts/form.js';

describe('Form Validation - validateValue()', () => {
    describe('Name field validation', () => {
        test('should fail when name is empty', () => {
            const result = validateValue('', 'name');
            expect(result.valid).toBe(false);
            expect(result.error).toBe(validationRules.name.messages.required);
        });

        test('should fail when name is only whitespace', () => {
            const result = validateValue('   ', 'name');
            expect(result.valid).toBe(false);
            expect(result.error).toBe(validationRules.name.messages.required);
        });

        test('should fail when name is too short (1 character)', () => {
            const result = validateValue('A', 'name');
            expect(result.valid).toBe(false);
            expect(result.error).toBe(validationRules.name.messages.minLength);
        });

        test('should pass when name has 2 characters', () => {
            const result = validateValue('Ян', 'name');
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });

        test('should pass for valid names in Russian', () => {
            const result = validateValue('Иван Иванов', 'name');
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });

        test('should pass for valid names in English', () => {
            const result = validateValue('John Doe', 'name');
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });

        test('should pass for names with hyphens', () => {
            const result = validateValue('Анна-Мария', 'name');
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });

        test('should fail for names with numbers', () => {
            const result = validateValue('John123', 'name');
            expect(result.valid).toBe(false);
            expect(result.error).toBe(validationRules.name.messages.pattern);
        });

        test('should fail for names with special characters', () => {
            const result = validateValue('John@Doe', 'name');
            expect(result.valid).toBe(false);
            expect(result.error).toBe(validationRules.name.messages.pattern);
        });
    });

    describe('Email field validation', () => {
        test('should fail when email is empty', () => {
            const result = validateValue('', 'email');
            expect(result.valid).toBe(false);
            expect(result.error).toBe(validationRules.email.messages.required);
        });

        test('should fail for invalid email without @', () => {
            const result = validateValue('invalidemail.com', 'email');
            expect(result.valid).toBe(false);
            expect(result.error).toBe(validationRules.email.messages.pattern);
        });

        test('should fail for invalid email without domain', () => {
            const result = validateValue('user@', 'email');
            expect(result.valid).toBe(false);
            expect(result.error).toBe(validationRules.email.messages.pattern);
        });

        test('should fail for invalid email without TLD', () => {
            const result = validateValue('user@domain', 'email');
            expect(result.valid).toBe(false);
            expect(result.error).toBe(validationRules.email.messages.pattern);
        });

        test('should fail for email with spaces', () => {
            const result = validateValue('user @example.com', 'email');
            expect(result.valid).toBe(false);
            expect(result.error).toBe(validationRules.email.messages.pattern);
        });

        test('should pass for valid email', () => {
            const result = validateValue('user@example.com', 'email');
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });

        test('should pass for email with subdomain', () => {
            const result = validateValue('user@mail.example.com', 'email');
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });

        test('should pass for email with plus sign', () => {
            const result = validateValue('user+tag@example.com', 'email');
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });
    });

    describe('Message field validation', () => {
        test('should fail when message is empty', () => {
            const result = validateValue('', 'message');
            expect(result.valid).toBe(false);
            expect(result.error).toBe(validationRules.message.messages.required);
        });

        test(`should fail when message is shorter than ${MIN_MESSAGE_LENGTH} characters`, () => {
            const shortMessage = 'Short text';
            expect(shortMessage.length).toBeLessThan(MIN_MESSAGE_LENGTH);

            const result = validateValue(shortMessage, 'message');
            expect(result.valid).toBe(false);
            expect(result.error).toBe(validationRules.message.messages.minLength);
        });

        test(`should pass when message has exactly ${MIN_MESSAGE_LENGTH} characters`, () => {
            const exactMessage = 'A'.repeat(MIN_MESSAGE_LENGTH);
            expect(exactMessage.length).toBe(MIN_MESSAGE_LENGTH);

            const result = validateValue(exactMessage, 'message');
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });

        test(`should pass when message is longer than ${MIN_MESSAGE_LENGTH} characters`, () => {
            const longMessage = 'This is a long enough message for validation to pass successfully.';
            expect(longMessage.length).toBeGreaterThan(MIN_MESSAGE_LENGTH);

            const result = validateValue(longMessage, 'message');
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });
    });

    describe('Unknown field validation', () => {
        test('should return valid for unknown field names', () => {
            const result = validateValue('any value', 'unknownField');
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });
    });
});

describe('Form Validation - validateFormValues()', () => {
    test('should return isValid: false when all fields are empty', () => {
        const result = validateFormValues({
            name: '',
            email: '',
            message: ''
        });

        expect(result.isValid).toBe(false);
        expect(result.errors.name).toBe(validationRules.name.messages.required);
        expect(result.errors.email).toBe(validationRules.email.messages.required);
        expect(result.errors.message).toBe(validationRules.message.messages.required);
    });

    test('should return isValid: true when all fields are valid', () => {
        const result = validateFormValues({
            name: 'Иван Иванов',
            email: 'ivan@example.com',
            message: 'Это достаточно длинное сообщение для прохождения валидации!'
        });

        expect(result.isValid).toBe(true);
        expect(result.errors.name).toBeNull();
        expect(result.errors.email).toBeNull();
        expect(result.errors.message).toBeNull();
    });

    test('should return isValid: false when only name is invalid', () => {
        const result = validateFormValues({
            name: '',
            email: 'valid@example.com',
            message: 'This is a valid message with more than 20 characters.'
        });

        expect(result.isValid).toBe(false);
        expect(result.errors.name).toBe(validationRules.name.messages.required);
        expect(result.errors.email).toBeNull();
        expect(result.errors.message).toBeNull();
    });

    test('should return isValid: false when only email is invalid', () => {
        const result = validateFormValues({
            name: 'Valid Name',
            email: 'invalid-email',
            message: 'This is a valid message with more than 20 characters.'
        });

        expect(result.isValid).toBe(false);
        expect(result.errors.name).toBeNull();
        expect(result.errors.email).toBe(validationRules.email.messages.pattern);
        expect(result.errors.message).toBeNull();
    });

    test('should return isValid: false when only message is too short', () => {
        const result = validateFormValues({
            name: 'Valid Name',
            email: 'valid@example.com',
            message: 'Too short'
        });

        expect(result.isValid).toBe(false);
        expect(result.errors.name).toBeNull();
        expect(result.errors.email).toBeNull();
        expect(result.errors.message).toBe(validationRules.message.messages.minLength);
    });

    test('should handle undefined values', () => {
        const result = validateFormValues({});

        expect(result.isValid).toBe(false);
        expect(result.errors.name).toBe(validationRules.name.messages.required);
        expect(result.errors.email).toBe(validationRules.email.messages.required);
        expect(result.errors.message).toBe(validationRules.message.messages.required);
    });
});

describe('Form Validation - Submit Button State Logic', () => {
    test('submit button should be disabled when form is invalid', () => {
        const formValues = { name: '', email: '', message: '' };
        const result = validateFormValues(formValues);

        // Logic: button.disabled = !result.isValid
        const buttonShouldBeDisabled = !result.isValid;

        expect(buttonShouldBeDisabled).toBe(true);
    });

    test('submit button should be enabled when form is valid', () => {
        const formValues = {
            name: 'Иван Иванов',
            email: 'ivan@example.com',
            message: 'Достаточно длинное сообщение для валидации'
        };
        const result = validateFormValues(formValues);

        // Logic: button.disabled = !result.isValid
        const buttonShouldBeDisabled = !result.isValid;

        expect(buttonShouldBeDisabled).toBe(false);
    });

    test('submit button state should update correctly when validation changes', () => {
        // Initially invalid
        let formValues = { name: '', email: '', message: '' };
        let result = validateFormValues(formValues);
        expect(!result.isValid).toBe(true); // Button disabled

        // After adding valid name
        formValues = { name: 'Иван', email: '', message: '' };
        result = validateFormValues(formValues);
        expect(!result.isValid).toBe(true); // Still disabled

        // After adding valid email
        formValues = { name: 'Иван', email: 'ivan@mail.ru', message: '' };
        result = validateFormValues(formValues);
        expect(!result.isValid).toBe(true); // Still disabled

        // After adding valid message
        formValues = { name: 'Иван', email: 'ivan@mail.ru', message: 'Достаточно длинное сообщение!' };
        result = validateFormValues(formValues);
        expect(!result.isValid).toBe(false); // Button enabled
    });
});
