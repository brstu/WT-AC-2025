export default class ComicFormView {
    constructor(api, router, id = null) {
        this.api = api;
        this.router = router;
        this.id = id;
        this.comic = null;
        this.isLoading = false;
        this.error = null;
        this.isSubmitting = false;
    }
    
    async render() {
        const main = document.getElementById('main-content');
        
        // Если это редактирование, загружаем данные комикса
        if (this.id) {
            main.innerHTML = this._renderLoading();
            this.isLoading = true;
            
            try {
                this.comic = await this.api.getRecipe(this.id);
                this.isLoading = false;
                this.error = null;
            } catch (error) {
                this.isLoading = false;
                this.error = error.message;
                main.innerHTML = this._renderError();
                return;
            }
        }
        
        // Рендерим форму
        main.innerHTML = this._render();
        
        // Навешиваем обработчики событий
        this._attachEventHandlers();
    }
    
    _render() {
        const isEdit = !!this.id;
        const title = isEdit ? 'Редактировать комикс' : 'Добавить новый комикс';
        
        return `
            <div class="form-container">
                <h2 class="form-title">${title}</h2>
                
                <form id="comic-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="title" class="form-label">Название *</label>
                            <input 
                                type="text" 
                                id="title" 
                                class="form-control" 
                                required
                                value="${this.comic ? this.comic.title : ''}"
                            >
                            <div class="form-error" id="title-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="author" class="form-label">Автор *</label>
                            <input 
                                type="text" 
                                id="author" 
                                class="form-control" 
                                required
                                value="${this.comic ? this.comic.author : ''}"
                            >
                            <div class="form-error" id="author-error"></div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="year" class="form-label">Год выпуска</label>
                            <input 
                                type="number" 
                                id="year" 
                                class="form-control" 
                                min="1900" 
                                max="${new Date().getFullYear()}"
                                value="${this.comic ? this.comic.year : ''}"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="rating" class="form-label">Рейтинг (1-5)</label>
                            <select id="rating" class="form-control">
                                <option value="">Без оценки</option>
                                <option value="1" ${this.comic && this.comic.rating === 1 ? 'selected' : ''}>1 - Ужасно</option>
                                <option value="2" ${this.comic && this.comic.rating === 2 ? 'selected' : ''}>2 - Плохо</option>
                                <option value="3" ${this.comic && this.comic.rating === 3 ? 'selected' : ''}>3 - Нормально</option>
                                <option value="4" ${this.comic && this.comic.rating === 4 ? 'selected' : ''}>4 - Хорошо</option>
                                <option value="5" ${this.comic && this.comic.rating === 5 ? 'selected' : ''}>5 - Отлично</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="description" class="form-label">Описание</label>
                        <textarea 
                            id="description" 
                            class="form-control" 
                            rows="5"
                        >${this.comic ? this.comic.description || '' : ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="publisher" class="form-label">Издательство</label>
                            <input 
                                type="text" 
                                id="publisher" 
                                class="form-control"
                                value="${this.comic ? this.comic.publisher || '' : ''}"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="pages" class="form-label">Количество страниц</label>
                            <input 
                                type="number" 
                                id="pages" 
                                class="form-control" 
                                min="1"
                                value="${this.comic ? this.comic.pages || '' : ''}"
                            >
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="genre" class="form-label">Жанр</label>
                            <input 
                                type="text" 
                                id="genre" 
                                class="form-control"
                                value="${this.comic ? this.comic.genre || '' : ''}"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="image" class="form-label">Ссылка на изображение</label>
                            <input 
                                type="url" 
                                id="image" 
                                class="form-control"
                                value="${this.comic ? this.comic.image || '' : ''}"
                            >
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <a href="${this.id ? `#/comics/${this.id}` : '#/comics'}" class="btn btn-outline">
                            <i class="fas fa-times"></i> Отмена
                        </a>
                        <button type="submit" class="btn btn-primary" id="submit-button" ${this.isSubmitting ? 'disabled' : ''}>
                            ${this.isSubmitting 
                                ? '<i class="fas fa-spinner fa-spin"></i> Сохранение...' 
                                : `<i class="fas fa-save"></i> ${isEdit ? 'Обновить' : 'Создать'}`
                            }
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    _renderLoading() {
        return `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p class="loading-message">Загрузка данных комикса...</p>
            </div>
        `;
    }
    
    _renderError() {
        return `
            <div class="error">
                <div class="error-icon">✗</div>
                <p class="error-message">Ошибка при загрузке комикса: ${this.error}</p>
                <a href="#/comics" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i> Вернуться к списку
                </a>
            </div>
        `;
    }
    
    _attachEventHandlers() {
        const form = document.getElementById('comic-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this._submitForm();
            });
        }
        
        // Валидация в реальном времени
        const titleInput = document.getElementById('title');
        const authorInput = document.getElementById('author');
        
        if (titleInput) {
            titleInput.addEventListener('blur', () => this._validateField('title', 'Название обязательно для заполнения'));
        }
        
        if (authorInput) {
            authorInput.addEventListener('blur', () => this._validateField('author', 'Автор обязателен для заполнения'));
        }
    }
    
    _validateField(fieldId, errorMessage) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        
        if (!field.value.trim()) {
            if (errorElement) {
                errorElement.textContent = errorMessage;
                errorElement.style.color = 'var(--primary-color)';
                errorElement.style.fontSize = '0.9rem';
                errorElement.style.marginTop = '0.25rem';
            }
            field.style.borderColor = 'var(--primary-color)';
            return false;
        } else {
            if (errorElement) {
                errorElement.textContent = '';
            }
            field.style.borderColor = '#ced4da';
            return true;
        }
    }
    
    async _submitForm() {
        // Валидация обязательных полей
        const isTitleValid = this._validateField('title', 'Название обязательно для заполнения');
        const isAuthorValid = this._validateField('author', 'Автор обязателен для заполнения');
        
        if (!isTitleValid || !isAuthorValid) {
            return;
        }
        
        // Собираем данные формы
        const formData = {
            title: document.getElementById('title').value.trim(),
            author: document.getElementById('author').value.trim(),
            description: document.getElementById('description').value.trim(),
            year: document.getElementById('year').value ? parseInt(document.getElementById('year').value) : null,
            rating: document.getElementById('rating').value ? parseInt(document.getElementById('rating').value) : null,
            publisher: document.getElementById('publisher').value.trim() || null,
            pages: document.getElementById('pages').value ? parseInt(document.getElementById('pages').value) : null,
            genre: document.getElementById('genre').value.trim() || null,
            image: document.getElementById('image').value.trim() || null,
            reviews: this.comic ? this.comic.reviews || [] : []
        };
        
        // Блокируем кнопку отправки
        const submitButton = document.getElementById('submit-button');
        this.isSubmitting = true;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
        
        try {
            let result;
            
            if (this.id) {
                // Обновление существующего комикса
                result = await this.api.updateRecipe(this.id, formData);
            } else {
                // Создание нового комикса
                result = await this.api.createRecipe(formData);
            }
            
            // Показываем уведомление об успехе
            if (window.app && window.app.showNotification) {
                const message = this.id ? 'Комикс успешно обновлен' : 'Комикс успешно создан';
                window.app.showNotification(message, 'success');
            }
            
            // Перенаправляем на страницу комикса
            const comicId = this.id || result.id;
            this.router.navigateTo(`#/comics/${comicId}`);
            
        } catch (error) {
            // Показываем уведомление об ошибке
            if (window.app && window.app.showNotification) {
                const message = this.id ? 'Ошибка при обновлении комикса' : 'Ошибка при создании комикса';
                window.app.showNotification(message, 'error');
            }
            
            // Разблокируем кнопку отправки
            this.isSubmitting = false;
            submitButton.disabled = false;
            submitButton.innerHTML = this.id 
                ? '<i class="fas fa-save"></i> Обновить' 
                : '<i class="fas fa-save"></i> Создать';
        }
    }
}