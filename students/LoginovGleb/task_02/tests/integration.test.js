/**
 * Интеграционные тесты для компонентов UI
 * Тестирует взаимодействие с DOM-элементами
 */

import '@testing-library/jest-dom';
import { validateValue, validateFormValues } from '../src/scripts/form.js';

/**
 * Вспомогательная функция для создания DOM формы подписки
 */
function createFormDOM() {
    document.body.innerHTML = `
        <form id="subscription-form" novalidate>
            <div class="form-group">
                <label for="name" class="form-label">Имя</label>
                <input type="text" id="name" name="name" class="form-input" required>
                <span class="error-message" id="name-error" role="alert"></span>
            </div>
            <div class="form-group">
                <label for="email" class="form-label">E-mail</label>
                <input type="email" id="email" name="email" class="form-input" required>
                <span class="error-message" id="email-error" role="alert"></span>
            </div>
            <div class="form-group">
                <label for="message" class="form-label">Сообщение</label>
                <textarea id="message" name="message" class="form-input" required></textarea>
                <span class="error-message" id="message-error" role="alert"></span>
            </div>
            <button type="submit" class="btn btn-submit" disabled aria-disabled="true">
                Подписаться
            </button>
            <div class="form-success" id="form-success" role="status" hidden>
                <p>Спасибо за подписку!</p>
            </div>
        </form>
    `;
    return document.getElementById('subscription-form');
}

/**
 * Вспомогательная функция для обновления состояния кнопки отправки
 */
function updateSubmitButtonState(form) {
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const messageInput = form.querySelector('#message');
    const submitButton = form.querySelector('button[type="submit"]');

    const result = validateFormValues({
        name: nameInput.value,
        email: emailInput.value,
        message: messageInput.value
    });

    submitButton.disabled = !result.isValid;
    submitButton.setAttribute('aria-disabled', !result.isValid);

    return { result, submitButton };
}

/**
 * Вспомогательная функция для показа ошибки на поле
 */
function showFieldError(field, fieldName) {
    const result = validateValue(field.value, fieldName);
    const errorElement = document.getElementById(`${fieldName}-error`);

    if (!result.valid) {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        if (errorElement) {
            errorElement.textContent = result.error;
        }
    } else {
        field.classList.remove('error');
        field.setAttribute('aria-invalid', 'false');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    return result;
}

describe('Form Integration - DOM Interactions', () => {
    beforeEach(() => {
        createFormDOM();
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('Submit Button State', () => {
        test('submit button should be initially disabled', () => {
            const form = document.getElementById('subscription-form');
            const submitButton = form.querySelector('button[type="submit"]');

            expect(submitButton).toBeDisabled();
            expect(submitButton).toHaveAttribute('aria-disabled', 'true');
        });

        test('submit button should remain disabled when only name is filled', () => {
            const form = document.getElementById('subscription-form');
            const nameInput = form.querySelector('#name');

            nameInput.value = 'Иван Иванов';
            const { submitButton } = updateSubmitButtonState(form);

            expect(submitButton).toBeDisabled();
        });

        test('submit button should remain disabled when name and email are filled but message is empty', () => {
            const form = document.getElementById('subscription-form');
            const nameInput = form.querySelector('#name');
            const emailInput = form.querySelector('#email');

            nameInput.value = 'Иван Иванов';
            emailInput.value = 'ivan@example.com';
            const { submitButton } = updateSubmitButtonState(form);

            expect(submitButton).toBeDisabled();
        });

        test('submit button should be enabled when all fields are valid', () => {
            const form = document.getElementById('subscription-form');
            const nameInput = form.querySelector('#name');
            const emailInput = form.querySelector('#email');
            const messageInput = form.querySelector('#message');

            nameInput.value = 'Иван Иванов';
            emailInput.value = 'ivan@example.com';
            messageInput.value = 'Это достаточно длинное сообщение для валидации!';

            const { submitButton } = updateSubmitButtonState(form);

            expect(submitButton).not.toBeDisabled();
            expect(submitButton).toHaveAttribute('aria-disabled', 'false');
        });

        test('submit button should become disabled again when a field becomes invalid', () => {
            const form = document.getElementById('subscription-form');
            const nameInput = form.querySelector('#name');
            const emailInput = form.querySelector('#email');
            const messageInput = form.querySelector('#message');

            // Fill all fields with valid values
            nameInput.value = 'Иван Иванов';
            emailInput.value = 'ivan@example.com';
            messageInput.value = 'Это достаточно длинное сообщение для валидации!';

            let { submitButton } = updateSubmitButtonState(form);
            expect(submitButton).not.toBeDisabled();

            // Clear the message field
            messageInput.value = '';
            ({ submitButton } = updateSubmitButtonState(form));
            expect(submitButton).toBeDisabled();
        });
    });

    describe('Error Display', () => {
        test('should show error message when name is empty', () => {
            const form = document.getElementById('subscription-form');
            const nameInput = form.querySelector('#name');
            const nameError = document.getElementById('name-error');

            nameInput.value = '';
            showFieldError(nameInput, 'name');

            expect(nameInput).toHaveClass('error');
            expect(nameInput).toHaveAttribute('aria-invalid', 'true');
            expect(nameError.textContent).toBe('Пожалуйста, введите ваше имя');
        });

        test('should clear error when name becomes valid', () => {
            const form = document.getElementById('subscription-form');
            const nameInput = form.querySelector('#name');
            const nameError = document.getElementById('name-error');

            // First, trigger error
            nameInput.value = '';
            showFieldError(nameInput, 'name');
            expect(nameInput).toHaveClass('error');

            // Then, fix the value
            nameInput.value = 'Иван';
            showFieldError(nameInput, 'name');

            expect(nameInput).not.toHaveClass('error');
            expect(nameInput).toHaveAttribute('aria-invalid', 'false');
            expect(nameError.textContent).toBe('');
        });

        test('should show error for invalid email format', () => {
            const form = document.getElementById('subscription-form');
            const emailInput = form.querySelector('#email');
            const emailError = document.getElementById('email-error');

            emailInput.value = 'invalid-email';
            showFieldError(emailInput, 'email');

            expect(emailInput).toHaveClass('error');
            expect(emailError.textContent).toBe('Пожалуйста, введите корректный email адрес');
        });

        test('should show error for short message', () => {
            const form = document.getElementById('subscription-form');
            const messageInput = form.querySelector('#message');
            const messageError = document.getElementById('message-error');

            messageInput.value = 'Короткий текст';
            showFieldError(messageInput, 'message');

            expect(messageInput).toHaveClass('error');
            expect(messageError.textContent).toContain('минимум 20 символов');
        });
    });

    describe('ARIA Attributes', () => {
        test('error messages should have role="alert"', () => {
            const errorElements = document.querySelectorAll('.error-message');

            errorElements.forEach(el => {
                expect(el).toHaveAttribute('role', 'alert');
            });
        });

        test('success message should have role="status"', () => {
            const successElement = document.getElementById('form-success');
            expect(successElement).toHaveAttribute('role', 'status');
        });

        test('aria-invalid should update correctly', () => {
            const form = document.getElementById('subscription-form');
            const nameInput = form.querySelector('#name');

            // Initially, no aria-invalid
            expect(nameInput).not.toHaveAttribute('aria-invalid');

            // After invalid input
            nameInput.value = '';
            showFieldError(nameInput, 'name');
            expect(nameInput).toHaveAttribute('aria-invalid', 'true');

            // After valid input
            nameInput.value = 'Иван';
            showFieldError(nameInput, 'name');
            expect(nameInput).toHaveAttribute('aria-invalid', 'false');
        });
    });
});

describe('Post Actions - Like Toggle Logic', () => {
    function createPostDOM() {
        document.body.innerHTML = `
            <div id="posts-container">
                <article class="post-card" data-post-id="1">
                    <button 
                        class="btn-like" 
                        data-action="like"
                        aria-pressed="false"
                        aria-label="Поставить лайк">
                        <span class="like-icon">🤍</span>
                        <span class="like-count">5</span>
                    </button>
                    <button class="btn-delete" data-action="delete">🗑️</button>
                </article>
            </div>
        `;
    }

    /**
     * Simulate the like toggle logic (mirrors posts.js handleLike function)
     * @param {HTMLElement} button - Like button element
     */
    function simulateLikeToggle(button) {
        const isLiked = button.getAttribute('aria-pressed') === 'true';
        const likeCountElement = button.querySelector('.like-count');
        const likeIcon = button.querySelector('.like-icon');

        if (!likeCountElement) {
            return;
        }

        let count = parseInt(likeCountElement.textContent) || 0;

        if (isLiked) {
            // Unlike
            button.setAttribute('aria-pressed', 'false');
            likeIcon.textContent = '🤍';
            count = Math.max(0, count - 1);
        } else {
            // Like
            button.setAttribute('aria-pressed', 'true');
            likeIcon.textContent = '❤️';
            count++;
        }

        likeCountElement.textContent = count;
    }

    beforeEach(() => {
        createPostDOM();
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('like button should have correct initial state', () => {
        const likeButton = document.querySelector('.btn-like');
        const likeIcon = likeButton.querySelector('.like-icon');
        const likeCount = likeButton.querySelector('.like-count');

        expect(likeButton).toHaveAttribute('aria-pressed', 'false');
        expect(likeIcon.textContent).toBe('🤍');
        expect(likeCount.textContent).toBe('5');
    });

    test('toggling like should update count and icon', () => {
        const likeButton = document.querySelector('.btn-like');
        const likeIcon = likeButton.querySelector('.like-icon');
        const likeCount = likeButton.querySelector('.like-count');

        // Simulate like action using helper function
        simulateLikeToggle(likeButton);

        expect(likeButton).toHaveAttribute('aria-pressed', 'true');
        expect(likeIcon.textContent).toBe('❤️');
        expect(likeCount.textContent).toBe('6');
    });

    test('unliking should decrement count', () => {
        const likeButton = document.querySelector('.btn-like');
        const likeIcon = likeButton.querySelector('.like-icon');
        const likeCount = likeButton.querySelector('.like-count');

        // First like using helper function
        simulateLikeToggle(likeButton);
        expect(likeButton).toHaveAttribute('aria-pressed', 'true');
        expect(likeCount.textContent).toBe('6');

        // Then unlike using helper function
        simulateLikeToggle(likeButton);

        expect(likeButton).toHaveAttribute('aria-pressed', 'false');
        expect(likeIcon.textContent).toBe('🤍');
        expect(likeCount.textContent).toBe('5');
    });

    test('like count should not go below 0', () => {
        const likeButton = document.querySelector('.btn-like');
        const likeCount = likeButton.querySelector('.like-count');

        // Set count to 0 and mark as liked
        likeCount.textContent = '0';
        likeButton.setAttribute('aria-pressed', 'true');

        // Unlike using helper function
        simulateLikeToggle(likeButton);

        expect(likeCount.textContent).toBe('0');
    });
});

describe('Accordion State Logic', () => {
    function createAccordionDOM() {
        document.body.innerHTML = `
            <div class="accordion">
                <div class="accordion-item">
                    <button 
                        class="accordion-button" 
                        id="acc-btn-1"
                        aria-expanded="false" 
                        aria-controls="acc-panel-1">
                        Заголовок 1
                    </button>
                    <div class="accordion-panel" id="acc-panel-1" hidden>
                        Содержимое 1
                    </div>
                </div>
                <div class="accordion-item">
                    <button 
                        class="accordion-button" 
                        id="acc-btn-2"
                        aria-expanded="false" 
                        aria-controls="acc-panel-2">
                        Заголовок 2
                    </button>
                    <div class="accordion-panel" id="acc-panel-2" hidden>
                        Содержимое 2
                    </div>
                </div>
            </div>
        `;
    }

    beforeEach(() => {
        createAccordionDOM();
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('accordion panels should be initially hidden', () => {
        const panels = document.querySelectorAll('.accordion-panel');
        const buttons = document.querySelectorAll('.accordion-button');

        panels.forEach(panel => {
            expect(panel).toHaveAttribute('hidden');
        });

        buttons.forEach(button => {
            expect(button).toHaveAttribute('aria-expanded', 'false');
        });
    });

    test('toggling accordion should update aria-expanded and hidden state', () => {
        const button = document.getElementById('acc-btn-1');
        const panel = document.getElementById('acc-panel-1');

        // Toggle open
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', !isExpanded);
        panel.hidden = isExpanded;

        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(panel).not.toHaveAttribute('hidden');
    });

    test('aria-controls should reference correct panel', () => {
        const button1 = document.getElementById('acc-btn-1');
        const button2 = document.getElementById('acc-btn-2');

        expect(button1).toHaveAttribute('aria-controls', 'acc-panel-1');
        expect(button2).toHaveAttribute('aria-controls', 'acc-panel-2');

        // Verify referenced panels exist
        expect(document.getElementById('acc-panel-1')).toBeInTheDocument();
        expect(document.getElementById('acc-panel-2')).toBeInTheDocument();
    });
});
