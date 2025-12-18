export function initializeForm() {
    const form = document.getElementById('add-book-form');
    const submitButton = form.querySelector('button[type="submit"]');

    // Валидация полей формы
    const validators = {
        title: (value) => {
            if (!value) return 'Название книги обязательно';
            return '';
        },
        author: (value) => {
            if (!value) return 'Имя автора обязательно';
            return '';
        },
        email: (value) => {
            if (!value) return '';
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) return 'Неверный формат email';
            return '';
        },
        notes: (value) => {
            if (!value) return '';
            if (value.length < 20) return 'Минимальная длина заметки - 20 символов';
            return '';
        },
        link: (value) => {
            if (!value) return ''; // Ссылка необязательна
            try {
                new URL(value);
                return '';
            } catch {
                return 'Неверный формат URL';
            }
            return '';
        }
    };

    // Валидация при вводе
    form.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('input', () => {
            validateField(field);
            updateSubmitButton();
        });
    });

    // Валидация поля
    function validateField(field) {
        const errorElement = field.nextElementSibling;
        const error = validators[field.name](field.value);
        errorElement.textContent = error;
        return !error;
    }

    // Обновление состояния кнопки отправки
    function updateSubmitButton() {
        const requiredFields = ['title', 'author']; // Только эти поля обязательны
        const isValid = requiredFields.every(name => {
            const field = form.elements[name];
            return field && validateField(field);
        });
        
        // Проверяем остальные поля только если они не пустые
        const optionalFields = ['email', 'notes', 'link'];
        const areOptionalValid = optionalFields.every(name => {
            const field = form.elements[name];
            return !field.value || validateField(field);
        });

        submitButton.disabled = !isValid || !areOptionalValid;
    }

    // Обработка отправки формы
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const bookData = Object.fromEntries(formData.entries());

        // Сохранение книги
        const books = JSON.parse(localStorage.getItem('books') || '[]');
        books.push({
            ...bookData,
            id: Date.now(),
            liked: false,
            status: 'toRead'
        });
        localStorage.setItem('books', JSON.stringify(books));

        // Обновление списка книг
        document.dispatchEvent(new CustomEvent('booksUpdated'));

        // Сброс формы
        form.reset();
        updateSubmitButton();
    });
}