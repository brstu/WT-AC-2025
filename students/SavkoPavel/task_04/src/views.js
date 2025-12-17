// Модуль представлений (экраны)
export class Views {
    constructor(api, router) {
        this.api = api;
        this.router = router;
        
        // Элементы DOM
        this.viewContent = document.getElementById('view-content');
        this.loadingElement = document.getElementById('loading');
        this.notificationElement = document.getElementById('notification');
        
        // Инициализация
        this.initDeleteModal();
    }
    
    // Показать состояние загрузки
    showLoading() {
        this.loadingElement.classList.remove('hidden');
        this.viewContent.innerHTML = '';
    }
    
    // Скрыть состояние загрузки
    hideLoading() {
        this.loadingElement.classList.add('hidden');
    }
    
    // Показать уведомление
    showNotification(message, type = 'info', duration = 5000) {
        const notification = this.notificationElement;
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.remove('hidden');
        
        // Автоматически скрыть через указанное время
        setTimeout(() => {
            notification.classList.add('hidden');
        }, duration);
    }
    
    // Инициализация модального окна подтверждения удаления
    initDeleteModal() {
        this.deleteModal = document.getElementById('delete-modal');
        this.confirmDeleteBtn = document.getElementById('confirm-delete');
        this.cancelDeleteBtn = document.getElementById('cancel-delete');
        
        this.pendingDeleteId = null;
        
        // Обработчики для модального окна
        this.cancelDeleteBtn.addEventListener('click', () => {
            this.hideDeleteModal();
        });
        
        this.confirmDeleteBtn.addEventListener('click', async () => {
            if (this.pendingDeleteId) {
                await this.performDelete(this.pendingDeleteId);
                this.hideDeleteModal();
            }
        });
        
        // Закрытие модального окна при клике вне его
        this.deleteModal.addEventListener('click', (e) => {
            if (e.target === this.deleteModal) {
                this.hideDeleteModal();
            }
        });
    }
    
    // Показать модальное окно удаления
    showDeleteModal(bookId, bookTitle) {
        this.pendingDeleteId = bookId;
        this.deleteModal.querySelector('p').textContent = 
            `Вы уверены, что хотите удалить книгу "${bookTitle}"? Это действие нельзя отменить.`;
        this.deleteModal.classList.remove('hidden');
    }
    
    // Скрыть модальное окно удаления
    hideDeleteModal() {
        this.deleteModal.classList.add('hidden');
        this.pendingDeleteId = null;
    }
    
    // Выполнить удаление книги
    async performDelete(bookId) {
        try {
            await this.api.deleteBook(bookId);
            this.showNotification('Книга успешно удалена', 'success');
            
            // Если мы на странице деталей удаленной книги - перенаправляем на список
            const currentPath = this.router.getCurrentPath();
            if (currentPath.includes(`/books/${bookId}`)) {
                this.router.navigateTo('/books');
            } else {
                // Иначе просто обновляем текущий вид
                this.router.handleRoute();
            }
        } catch (error) {
            console.error('Ошибка при удалении книги:', error);
            this.showNotification(`Ошибка при удалении книги: ${error.message}`, 'error');
        }
    }
    
    // Экран: Список книг
async showBooksList(searchQuery = '') {
    this.showLoading();
    
    try {
        const books = await this.api.getAllBooks();
        this.hideLoading();
        
        // Фильтрация по поисковому запросу
        const filteredBooks = searchQuery 
            ? books.filter(book => 
                book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (book.genre && book.genre.toLowerCase().includes(searchQuery.toLowerCase())))
            : books;
        
        if (filteredBooks.length === 0) {
            this.viewContent.innerHTML = this.renderEmptyState(
                books.length === 0 
                    ? 'В каталоге пока нет книг' 
                    : `По запросу "${searchQuery}" ничего не найдено`,
                books.length === 0 ? 'Добавьте первую книгу!' : 'Попробуйте другой запрос'
            );
            return;
        }
        
        this.viewContent.innerHTML = this.renderBooksList(filteredBooks, searchQuery);
        
        // Навешиваем обработчики событий
        this.attachBooksListEvents(searchQuery);
    } catch (error) {
        console.error('Ошибка при загрузке списка книг:', error);
        this.hideLoading();
        this.viewContent.innerHTML = this.renderErrorState(
            'Не удалось загрузить список книг',
            error.message
        );
    }
}
    
    // Рендер списка книг
    renderBooksList(books, searchQuery) {
        const searchValue = searchQuery ? ` value="${this.escapeHtml(searchQuery)}"` : '';
        
        return `
            <div class="books-list-view">
                <div class="books-header">
                    <h1 class="books-title">Каталог книг (${books.length})</h1>
                    <div class="search-box">
                        <input type="text" id="search-input" class="search-input" placeholder="Поиск по названию, автору, описанию..."${searchValue}>
                        <button id="search-btn" class="btn btn-primary">
                            <i class="fas fa-search"></i> Поиск
                        </button>
                    </div>
                </div>
                
                <div class="books-grid">
                    ${books.map(book => `
                        <div class="book-card" data-book-id="${book.id}">
                            <div class="book-cover">
                                <i class="fas fa-book"></i>
                            </div>
                            <div class="book-info">
                                <h3 class="book-title">${this.escapeHtml(book.title)}</h3>
                                <p class="book-author">${this.escapeHtml(book.author)}</p>
                                <p class="book-description">${this.truncateText(this.escapeHtml(book.description), 100)}</p>
                                <p class="book-year">Год издания: ${book.year}</p>
                                <div class="book-actions">
                                    <a href="#/books/${book.id}" class="btn btn-primary">
                                        <i class="fas fa-eye"></i> Подробнее
                                    </a>
                                    <button class="btn btn-secondary edit-book-btn" data-book-id="${book.id}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Навешиваем обработчики событий для списка книг
    attachBooksListEvents(searchQuery) {
        // Поиск
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        const performSearch = () => {
            const query = searchInput.value.trim();
            // Сохраняем поисковый запрос в hash
            if (query) {
                this.router.navigateTo(`/books?search=${encodeURIComponent(query)}`);
            } else {
                this.router.navigateTo('/books');
            }
        };
        
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Редактирование книг
        document.querySelectorAll('.edit-book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const bookId = btn.getAttribute('data-book-id');
                this.router.navigateTo(`/books/${bookId}/edit`);
            });
        });
    }
    
    // Экран: Детали книги
    async showBookDetail(bookId) {
        this.showLoading();
        
        try {
            const book = await this.api.getBookById(bookId);
            this.hideLoading();
            
            this.viewContent.innerHTML = this.renderBookDetail(book);
            
            // Навешиваем обработчики событий
            this.attachBookDetailEvents(bookId);
        } catch (error) {
            console.error('Ошибка при загрузке деталей книги:', error);
            this.hideLoading();
            this.viewContent.innerHTML = this.renderErrorState(
                'Не удалось загрузить информацию о книге',
                error.message
            );
        }
    }
    
    // Рендер деталей книги
    renderBookDetail(book) {
        return `
            <div class="book-detail">
                <div class="book-detail-header">
                    <div>
                        <h1 class="book-detail-title">${this.escapeHtml(book.title)}</h1>
                        <h2 class="book-detail-author">${this.escapeHtml(book.author)}</h2>
                    </div>
                    <div class="book-detail-actions">
                        <a href="#/books" class="btn btn-secondary">
                            <i class="fas fa-arrow-left"></i> Назад
                        </a>
                        <a href="#/books/${book.id}/edit" class="btn btn-primary">
                            <i class="fas fa-edit"></i> Редактировать
                        </a>
                        <button class="btn btn-danger delete-book-btn" data-book-id="${book.id}" data-book-title="${this.escapeHtml(book.title)}">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    </div>
                </div>
                
                <div class="book-detail-content">
                    <div class="book-detail-meta">
                        <div class="meta-item">
                            <span class="meta-label">Год издания</span>
                            <span class="meta-value">${book.year}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">ISBN</span>
                            <span class="meta-value">${book.isbn}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Количество страниц</span>
                            <span class="meta-value">${book.pages}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Жанр</span>
                            <span class="meta-value">${book.genre}</span>
                        </div>
                    </div>
                    
                    <div class="book-detail-description">
                        <h3>Описание</h3>
                        <p>${this.escapeHtml(book.description).replace(/\n/g, '<br>')}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Навешиваем обработчики событий для деталей книги
    attachBookDetailEvents(bookId) {
        // Удаление книги
        const deleteBtn = document.querySelector('.delete-book-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                const bookTitle = deleteBtn.getAttribute('data-book-title');
                this.showDeleteModal(bookId, bookTitle);
            });
        }
    }
    
    // Экран: Создание новой книги
    showCreateBookForm() {
        this.hideLoading();
        this.viewContent.innerHTML = this.renderBookForm(null, 'Создание новой книги');
        this.attachBookFormEvents(null);
    }
    
    // Экран: Редактирование книги
    async showEditBookForm(bookId) {
        this.showLoading();
        
        try {
            const book = await this.api.getBookById(bookId);
            this.hideLoading();
            
            this.viewContent.innerHTML = this.renderBookForm(book, 'Редактирование книги');
            this.attachBookFormEvents(bookId);
        } catch (error) {
            console.error('Ошибка при загрузке книги для редактирования:', error);
            this.hideLoading();
            this.viewContent.innerHTML = this.renderErrorState(
                'Не удалось загрузить данные книги для редактирования',
                error.message
            );
        }
    }
    
    // Рендер формы книги
    renderBookForm(book, title) {
        const isEditMode = !!book;
        const actionText = isEditMode ? 'Сохранить изменения' : 'Добавить книгу';
        
        return `
            <div class="form-container">
                <h1 class="form-title">${title}</h1>
                
                <form id="book-form">
                    <div class="form-group">
                        <label for="title" class="form-label">Название книги *</label>
                        <input 
                            type="text" 
                            id="title" 
                            class="form-control" 
                            value="${book ? this.escapeHtml(book.title) : ''}"
                            required
                        >
                        <div class="error-message" id="title-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="author" class="form-label">Автор *</label>
                        <input 
                            type="text" 
                            id="author" 
                            class="form-control" 
                            value="${book ? this.escapeHtml(book.author) : ''}"
                            required
                        >
                        <div class="error-message" id="author-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="year" class="form-label">Год издания</label>
                        <input 
                            type="number" 
                            id="year" 
                            class="form-control" 
                            value="${book ? book.year : new Date().getFullYear()}"
                            min="1000"
                            max="${new Date().getFullYear() + 5}"
                        >
                        <div class="error-message" id="year-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="description" class="form-label">Описание *</label>
                        <textarea 
                            id="description" 
                            class="form-control" 
                            rows="5"
                            required
                        >${book ? this.escapeHtml(book.description) : ''}</textarea>
                        <div class="error-message" id="description-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="isbn" class="form-label">ISBN</label>
                        <input 
                            type="text" 
                            id="isbn" 
                            class="form-control" 
                            value="${book ? book.isbn : ''}"
                        >
                        <div class="error-message" id="isbn-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="pages" class="form-label">Количество страниц</label>
                        <input 
                            type="number" 
                            id="pages" 
                            class="form-control" 
                            value="${book ? book.pages : ''}"
                            min="1"
                        >
                        <div class="error-message" id="pages-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="genre" class="form-label">Жанр</label>
                        <input 
                            type="text" 
                            id="genre" 
                            class="form-control" 
                            value="${book ? book.genre : ''}"
                        >
                        <div class="error-message" id="genre-error"></div>
                    </div>
                    
                    <div class="form-actions">
                        <a href="${isEditMode ? `#/books/${book.id}` : '#/books'}" class="btn btn-secondary">
                            Отмена
                        </a>
                        <button type="submit" class="btn btn-success" id="submit-btn">
                            <i class="fas fa-save"></i> ${actionText}
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    // Навешиваем обработчики событий для формы книги
attachBookFormEvents(bookId) {
    const form = document.getElementById('book-form');
    const submitBtn = document.getElementById('submit-btn');
    
    // Валидация формы
    const validateForm = () => {
        let isValid = true;
        
        // Сбрасываем ошибки
        document.querySelectorAll('.error-message').forEach(el => {
            el.classList.remove('show');
            el.textContent = '';
        });
        
        document.querySelectorAll('.form-control').forEach(el => {
            el.classList.remove('error');
        });
        
        // Проверка обязательных полей
        const title = document.getElementById('title').value.trim();
        const author = document.getElementById('author').value.trim();
        const description = document.getElementById('description').value.trim();
        const year = document.getElementById('year').value;
        
        if (!title) {
            this.showFieldError('title', 'Название книги обязательно');
            isValid = false;
        }
        
        if (!author) {
            this.showFieldError('author', 'Автор обязателен');
            isValid = false;
        }
        
        if (!description) {
            this.showFieldError('description', 'Описание обязательно');
            isValid = false;
        }
        
        if (year) {
            const yearNum = parseInt(year);
            const currentYear = new Date().getFullYear();
            if (yearNum < 1000 || yearNum > currentYear + 5) {
                this.showFieldError('year', `Год должен быть между 1000 и ${currentYear + 5}`);
                isValid = false;
            }
        }
        
        return isValid;
    };
    
    // Обработчик отправки формы
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Блокируем кнопку отправки
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
        
        try {
            // Собираем данные формы
            const bookData = {
                title: document.getElementById('title').value.trim(),
                author: document.getElementById('author').value.trim(),
                year: document.getElementById('year').value ? parseInt(document.getElementById('year').value) : new Date().getFullYear(),
                description: document.getElementById('description').value.trim(),
                isbn: document.getElementById('isbn').value.trim() || undefined,
                pages: document.getElementById('pages').value ? parseInt(document.getElementById('pages').value) : undefined,
                genre: document.getElementById('genre').value.trim() || undefined
            };
            
            let newBookId;
            
            if (bookId) {
                // Редактирование существующей книги
                await this.api.updateBook(bookId, bookData);
                this.showNotification('Книга успешно обновлена', 'success');
                newBookId = bookId;
            } else {
                // Создание новой книги
                const newBook = await this.api.createBook(bookData);
                this.showNotification('Книга успешно создана', 'success');
                newBookId = newBook.id;
            }
            
            // Перенаправляем на страницу деталей
            setTimeout(() => {
                this.router.navigateTo(`/books/${newBookId}`);
                // Разблокируем кнопку отправки
                submitBtn.disabled = false;
                submitBtn.innerHTML = bookId 
                    ? '<i class="fas fa-save"></i> Сохранить изменения' 
                    : '<i class="fas fa-plus"></i> Добавить книгу';
            }, 1000);
            
        } catch (error) {
            console.error('Ошибка при сохранении книги:', error);
            this.showNotification(`Ошибка при сохранении: ${error.message}`, 'error');
            
            // Разблокируем кнопку отправки
            submitBtn.disabled = false;
            submitBtn.innerHTML = bookId 
                ? '<i class="fas fa-save"></i> Сохранить изменения' 
                : '<i class="fas fa-plus"></i> Добавить книгу';
        }
    });
}
    
    // Показать ошибку поля формы
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        
        field.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    // Рендер состояния "пусто"
    renderEmptyState(title, message) {
        return `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <h2>${title}</h2>
                <p>${message}</p>
            </div>
        `;
    }
    
    // Рендер состояния "ошибка"
    renderErrorState(title, message) {
        return `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>${title}</h2>
                <p>${message}</p>
                <button id="retry-btn" class="btn btn-primary" style="margin-top: 20px;">
                    <i class="fas fa-redo"></i> Попробовать снова
                </button>
            </div>
        `;
    }
    
    // Утилиты
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}