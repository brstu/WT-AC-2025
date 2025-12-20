export default class ComicDetailView {
    constructor(api, router, id) {
        this.api = api;
        this.router = router;
        this.id = id;
        this.comic = null;
        this.reviews = [];
        this.isLoading = false;
        this.error = null;
    }
    
    async render() {
        const main = document.getElementById('main-content');
        
        // Показываем состояние загрузки
        main.innerHTML = this._renderLoading();
        this.isLoading = true;
        
        try {
            // Загружаем данные комикса
            this.comic = await this.api.getRecipe(this.id);
            // Загружаем отзывы (в реальном API будет отдельный эндпоинт)
            this.reviews = this.comic.reviews || [];
            
            this.isLoading = false;
            this.error = null;
            
            // Рендерим основной контент
            main.innerHTML = this._render();
            
            // Навешиваем обработчики событий
            this._attachEventHandlers();
        } catch (error) {
            this.isLoading = false;
            this.error = error.message;
            main.innerHTML = this._renderError();
        }
    }
    
    _render() {
        return `
            <div class="comic-detail">
                <div class="comic-detail-header">
                    <h2 class="comic-detail-title">${this.comic.title}</h2>
                    <div class="comic-detail-meta">
                        <span class="comic-author">${this.comic.author}</span>
                        <span class="comic-year">${this.comic.year || 'Год неизвестен'}</span>
                        <span class="comic-rating">${this._renderRating(this.comic.rating)}</span>
                    </div>
                    <div class="comic-detail-actions">
                        <a href="#/comics" class="btn btn-outline">
                            <i class="fas fa-arrow-left"></i> Назад к списку
                        </a>
                        <a href="#/comics/${this.id}/edit" class="btn btn-warning">
                            <i class="fas fa-edit"></i> Редактировать
                        </a>
                        <button class="btn btn-danger" id="delete-button">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    </div>
                </div>
                
                <div class="comic-detail-content">
                    <img 
                        src="${this.comic.image || 'https://via.placeholder.com/800x400?text=No+Image'}" 
                        alt="${this.comic.title}" 
                        class="comic-detail-image"
                    >
                    
                    <div class="comic-detail-description">
                        <h3>Описание</h3>
                        <p>${this.comic.description || 'Описание отсутствует.'}</p>
                    </div>
                    
                    <div class="comic-detail-info">
                        <h3>Дополнительная информация</h3>
                        <p><strong>Издательство:</strong> ${this.comic.publisher || 'Не указано'}</p>
                        <p><strong>Количество страниц:</strong> ${this.comic.pages || 'Не указано'}</p>
                        <p><strong>Жанр:</strong> ${this.comic.genre || 'Не указан'}</p>
                    </div>
                </div>
                
                ${this._renderReviewsSection()}
            </div>
        `;
    }
    
    _renderReviewsSection() {
        return `
            <div class="reviews-section">
                <h3 class="reviews-title">Отзывы (${this.reviews.length})</h3>
                
                ${this.reviews.length > 0 
                    ? `<div class="reviews-list">
                        ${this.reviews.map(review => this._renderReview(review)).join('')}
                       </div>`
                    : '<p class="empty-reviews">Пока нет отзывов. Будьте первым!</p>'
                }
                
                <div class="review-form">
                    <h4>Добавить отзыв</h4>
                    <form id="review-form">
                        <div class="form-group">
                            <label for="review-author" class="form-label">Ваше имя</label>
                            <input type="text" id="review-author" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="review-rating" class="form-label">Оценка</label>
                            <select id="review-rating" class="form-control" required>
                                <option value="">Выберите оценку</option>
                                <option value="1">1 - Ужасно</option>
                                <option value="2">2 - Плохо</option>
                                <option value="3">3 - Нормально</option>
                                <option value="4">4 - Хорошо</option>
                                <option value="5">5 - Отлично</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="review-text" class="form-label">Текст отзыва</label>
                            <textarea id="review-text" class="form-control" rows="4" required></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-success" id="submit-review">
                                <i class="fas fa-paper-plane"></i> Отправить отзыв
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
    
    _renderReview(review) {
        const date = new Date(review.date || Date.now()).toLocaleDateString('ru-RU');
        
        return `
            <div class="review-card">
                <div class="review-header">
                    <span class="review-author">${review.author}</span>
                    <span class="review-date">${date}</span>
                </div>
                <div class="review-rating">
                    ${this._renderRating(review.rating)}
                </div>
                <div class="review-text">
                    ${review.text}
                </div>
            </div>
        `;
    }
    
    _renderRating(rating) {
        if (!rating) return 'Без оценки';
        
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? '★' : '☆';
        }
        return stars;
    }
    
    _renderLoading() {
        return `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p class="loading-message">Загрузка комикса...</p>
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
        // Обработчик удаления комикса
        const deleteButton = document.getElementById('delete-button');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                this._confirmDelete();
            });
        }
        
        // Обработчик формы отзыва
        const reviewForm = document.getElementById('review-form');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this._submitReview();
            });
        }
    }
    
    async _confirmDelete() {
        // Создаем модальное окно подтверждения
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <h3 class="modal-title">Подтверждение удаления</h3>
                <p class="modal-message">
                    Вы уверены, что хотите удалить комикс "${this.comic.title}"?
                    Это действие нельзя отменить.
                </p>
                <div class="modal-actions">
                    <button class="btn btn-outline" id="cancel-delete">Отмена</button>
                    <button class="btn btn-danger" id="confirm-delete">Удалить</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Обработчики для кнопок модального окна
        document.getElementById('cancel-delete').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('confirm-delete').addEventListener('click', async () => {
            try {
                await this.api.deleteRecipe(this.id);
                document.body.removeChild(modal);
                
                // Показываем уведомление об успехе
                if (window.app && window.app.showNotification) {
                    window.app.showNotification('Комикс успешно удален', 'success');
                }
                
                // Перенаправляем на список комиксов
                this.router.navigateTo('#/comics');
            } catch (error) {
                document.body.removeChild(modal);
                
                // Показываем уведомление об ошибке
                if (window.app && window.app.showNotification) {
                    window.app.showNotification('Ошибка при удалении комикса', 'error');
                }
            }
        });
        
        // Закрытие модального окна при клике вне его
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    async _submitReview() {
        const authorInput = document.getElementById('review-author');
        const ratingInput = document.getElementById('review-rating');
        const textInput = document.getElementById('review-text');
        const submitButton = document.getElementById('submit-review');
        
        // Валидация
        if (!authorInput.value.trim() || !ratingInput.value || !textInput.value.trim()) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        // Блокируем кнопку отправки
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        
        try {
            // В реальном приложении здесь будет вызов API
            const newReview = {
                author: authorInput.value.trim(),
                rating: parseInt(ratingInput.value),
                text: textInput.value.trim(),
                date: new Date().toISOString(),
                comicId: this.id
            };
            
            // Добавляем отзыв локально (в реальном приложении - через API)
            this.reviews.push(newReview);
            
            // Очищаем форму
            authorInput.value = '';
            ratingInput.value = '';
            textInput.value = '';
            
            // Перерисовываем секцию отзывов
            const reviewsSection = document.querySelector('.reviews-section');
            if (reviewsSection) {
                reviewsSection.innerHTML = this._renderReviewsSection();
                this._attachEventHandlers(); // Повторно навешиваем обработчики
            }
            
            // Показываем уведомление об успехе
            if (window.app && window.app.showNotification) {
                window.app.showNotification('Отзыв успешно добавлен', 'success');
            }
        } catch (error) {
            // Показываем уведомление об ошибке
            if (window.app && window.app.showNotification) {
                window.app.showNotification('Ошибка при добавлении отзыва', 'error');
            }
        } finally {
            // Разблокируем кнопку
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить отзыв';
        }
    }
}