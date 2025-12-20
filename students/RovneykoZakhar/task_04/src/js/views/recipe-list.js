export default class ComicsListView {
    constructor(api, router, searchParams = {}) {
        this.api = api;
        this.router = router;
        this.searchParams = searchParams;
        this.comics = [];
        this.isLoading = false;
        this.error = null;
    }
    
    async render() {
        const main = document.getElementById('main-content');
        
        // Показываем состояние загрузки
        main.innerHTML = this._renderLoading();
        this.isLoading = true;
        
        try {
            // Загружаем комиксы с параметрами поиска
            this.comics = await this.api.getRecipes(this.searchParams);
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
        if (this.comics.length === 0) {
            return this._renderEmpty();
        }
        
        return `
            <div class="comics-view">
                <div class="search-container">
                    <form class="search-form" id="search-form">
                        <input 
                            type="text" 
                            class="form-control search-input" 
                            id="search-input"
                            placeholder="Поиск комиксов по названию или автору..."
                            value="${this.searchParams.q || ''}"
                        >
                        <div class="search-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-search"></i> Поиск
                            </button>
                            <button type="button" class="btn btn-outline" id="reset-search">
                                <i class="fas fa-times"></i> Сбросить
                            </button>
                        </div>
                    </form>
                </div>
                
                <h2 class="view-title">Все комиксы (${this.comics.length})</h2>
                
                <div class="comics-list">
                    ${this.comics.map(comic => this._renderComicCard(comic)).join('')}
                </div>
            </div>
        `;
    }
    
    _renderComicCard(comic) {
        return `
            <div class="comic-card" data-id="${comic.id}">
                <div class="comic-image">
                    <img src="${comic.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${comic.title}">
                </div>
                <div class="comic-content">
                    <h3 class="comic-title">${comic.title}</h3>
                    <p class="comic-author">${comic.author}</p>
                    <p class="comic-description">${comic.description || 'Нет описания'}</p>
                    <div class="comic-meta">
                        <span class="comic-year">${comic.year || 'Год неизвестен'}</span>
                        <span class="comic-rating">${this._renderRating(comic.rating)}</span>
                    </div>
                    <div class="comic-actions">
                        <a href="#/comics/${comic.id}" class="btn btn-sm btn-primary">
                            <i class="fas fa-eye"></i> Подробнее
                        </a>
                        <a href="#/comics/${comic.id}/edit" class="btn btn-sm btn-warning">
                            <i class="fas fa-edit"></i> Редактировать
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
    
    _renderRating(rating) {
        if (!rating) return 'Без оценки';
        
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '★';
            } else if (i === fullStars && hasHalfStar) {
                stars += '½';
            } else {
                stars += '☆';
            }
        }
        
        return stars;
    }
    
    _renderLoading() {
        return `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p class="loading-message">Загрузка комиксов...</p>
            </div>
        `;
    }
    
    _renderError() {
        return `
            <div class="error">
                <div class="error-icon">✗</div>
                <p class="error-message">Ошибка при загрузке комиксов: ${this.error}</p>
                <button class="btn btn-primary" id="retry-button">Повторить попытку</button>
            </div>
        `;
    }
    
    _renderEmpty() {
        return `
            <div class="empty">
                <div class="empty-icon">📚</div>
                <p class="empty-message">Комиксы не найдены</p>
                <a href="/new" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Добавить первый комикс
                </a>
            </div>
        `;
    }
    
    _attachEventHandlers() {
        // Обработчик формы поиска
        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const searchInput = document.getElementById('search-input');
                const searchValue = searchInput.value.trim();
                
                const newParams = { ...this.searchParams };
                
                if (searchValue) {
                    newParams.q = searchValue;
                } else {
                    delete newParams.q;
                }
                
                this.router.updateSearchParams(newParams);
                this.searchParams = newParams;
                this.render();
            });
        }
        
        // Обработчик сброса поиска
        const resetButton = document.getElementById('reset-search');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.router.updateSearchParams({});
                this.searchParams = {};
                this.render();
            });
        }
        
        // Обработчик повторной попытки при ошибке
        const retryButton = document.getElementById('retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                this.render();
            });
        }
        
        // Предзагрузка при наведении на карточку (бонусная функция)
        const comicCards = document.querySelectorAll('.comic-card');
        comicCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const id = card.getAttribute('data-id');
                this._prefetchComicData(id);
            });
        });
    }
    
    async _prefetchComicData(id) {
        // Предзагрузка данных комикса для быстрого перехода
        try {
            await this.api.getRecipe(id);
        } catch (error) {
            // Игнорируем ошибки предзагрузки
        }
    }
}