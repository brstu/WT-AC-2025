class LayoutManager {
    constructor() {
        this.currentLayout = '';
        this.init();
    }

    init() {
        this.updateLayout();
        window.addEventListener('resize', () => this.updateLayout());
    }

    updateLayout() {
        const width = window.innerWidth;
        document.body.className = document.body.className.replace(/\b(wide-layout|medium-layout|narrow-layout|very-narrow-layout)\b/g, '');

        if (width > 800) {
            document.body.className += ' wide-layout';
        } else if (width > 600) {
            document.body.className += ' medium-layout';
        } else if (width > 400) {
            document.body.className += ' narrow-layout';
        } else {
            document.body.className += ' very-narrow-layout';
        }
    }
}

class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.currentTheme = this.loadTheme();
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    loadTheme() {
        const saved = localStorage.getItem('theme');
        return saved || 'light';
    }

    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.className += ' dark-theme';
            this.themeToggle.textContent = 'Светлая';
        } else {
            document.body.className = document.body.className.replace(' dark-theme', '');
            this.themeToggle.textContent = 'Темная';
        }
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }
}

class CategoriesManager {
    constructor() {
        this.tablist = document.querySelector('.category-tablist');
        this.panelsContainer = document.querySelector('.tab-panels');
        this.favoritesGrid = document.querySelector('.favorites-grid');
        this.noFavorites = document.querySelector('.no-favorites');
        this.categories = ['Все', 'Комедии', 'Драмы', 'Фантастика', 'Боевики'];
        this.currentCategory = 'Все';
        this.movies = this.loadMovies();
        this.favorites = this.loadFavorites();
        this.init();
    }

    init() {
        this.generateCategories();
        this.setupEventListeners();
        this.loadState();
        this.updateFavorites();
    }

    loadMovies() {
        const saved = localStorage.getItem('movies');
        if (saved) {
            return JSON.parse(saved);
        }
        return [
            { id: 1, title: 'Крестный отец', genre: 'Драма', rating: 9.2, email: 'studio@paramount.com', description: 'Эпическая сага о сицилийской мафиозной семье Корлеоне.', isFavorite: false },
            { id: 2, title: 'Темный рыцарь', genre: 'Боевик', rating: 9.0, email: 'contact@warnerbros.com', description: 'Бэтмен сталкивается с Джокером, хаотичным преступником, который сеет анархию в Готэме.', isFavorite: false },
            { id: 3, title: 'Побег из Шоушенка', genre: 'Драма', rating: 9.3, email: 'info@columbia.com', description: 'Двое заключенных заводят дружбу, находя утешение и искупление через acts of common decency.', isFavorite: false },
            { id: 4, title: 'Назад в будущее', genre: 'Фантастика', rating: 8.5, email: 'hello@universal.com', description: 'Подросток путешествует во времени на 30 лет назад и случайно меняет будущее.', isFavorite: false },
            { id: 5, title: 'Один дома', genre: 'Комедия', rating: 7.7, email: 'support@fox.com', description: 'Мальчик случайно остается один дома и защищает дом от грабителей.', isFavorite: false },
            { id: 6, title: 'Интерстеллар', genre: 'Фантастика', rating: 8.6, email: 'contact@warnerbros.com', description: 'Группа исследователей путешествует через червоточину в космосе.', isFavorite: false },
            { id: 7, title: 'Криминальное чтиво', genre: 'Драма', rating: 8.9, email: 'info@miramax.com', description: 'Истории жизни двух киллеров, боксера и гангстера.', isFavorite: false },
            { id: 8, title: 'Мальчишник в Вегасе', genre: 'Комедия', rating: 7.7, email: 'studio@warnerbros.com', description: 'Четверо друзей отправляются в Лас-Вегас на мальчишник.', isFavorite: false }
        ];
    }

    loadFavorites() {
        const saved = localStorage.getItem('favorites');
        return saved ? JSON.parse(saved) : [];
    }

    loadState() {
        const savedCategory = localStorage.getItem('currentCategory');
        if (savedCategory && this.categories.includes(savedCategory)) {
            this.activateTab(savedCategory);
        } else {
            this.activateTab('Все');
        }
    }

    saveState() {
        localStorage.setItem('currentCategory', this.currentCategory);
        localStorage.setItem('movies', JSON.stringify(this.movies));
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }

    generateCategories() {
        this.tablist.innerHTML = '';
        this.panelsContainer.innerHTML = '';

        this.categories.forEach(category => {
            const tab = document.createElement('button');
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', 'false');
            tab.setAttribute('aria-controls', category + '-panel');
            tab.textContent = category;
            tab.dataset.category = category;
            this.tablist.appendChild(tab);

            const panel = document.createElement('div');
            panel.setAttribute('role', 'tabpanel');
            panel.id = category + '-panel';
            panel.className = 'category-panel';
            panel.innerHTML = '<h3>' + category + '</h3><div class="movies-grid" data-category="' + category + '">' + this.generateMoviesGrid(category) + '</div>';
            this.panelsContainer.appendChild(panel);
        });
    }

    generateMoviesGrid(category) {
        let filteredMovies;
        
        if (category === 'Все') {
            filteredMovies = this.movies;
        } else {
            filteredMovies = this.movies.filter(movie => {
                if (category === 'Комедии') return movie.genre === 'Комедия';
                if (category === 'Драмы') return movie.genre === 'Драма';
                if (category === 'Фантастика') return movie.genre === 'Фантастика';
                if (category === 'Боевики') return movie.genre === 'Боевик';
                return false;
            });
        }
        
        if (filteredMovies.length === 0) {
            return '<p class="no-movies">Фильмов в этой категории пока нет.</p>';
        }

        let html = '';
        filteredMovies.forEach(movie => {
            html += '<div class="movie-card" data-movie-id="' + movie.id + '">' +
                '<div class="movie-rating" data-tooltip="' + this.getRatingDescription(movie.rating) + '">' + movie.rating + '</div>' +
                '<button class="favorite-btn ' + (movie.isFavorite ? 'favorited' : '') + '" data-movie-id="' + movie.id + '">★</button>' +
                '<h4 class="movie-title">' + movie.title + '</h4>' +
                '<p class="movie-genre">' + movie.genre + '</p>' +
                '<button class="movie-details-btn" data-movie=\'' + JSON.stringify(movie).replace(/'/g, "&apos;") + '\'>Подробнее</button>' +
                '</div>';
        });
        return html;
    }

    getRatingDescription(rating) {
        if (rating >= 9) return 'Великолепно';
        if (rating >= 8) return 'Отлично';
        if (rating >= 7) return 'Хорошо';
        if (rating >= 6) return 'Неплохо';
        return 'Плохо';
    }

    setupEventListeners() {
        this.tablist.addEventListener('click', (e) => {
            const tab = e.target.closest('[role="tab"]');
            if (tab) {
                this.activateTab(tab.dataset.category);
            }
        });

        this.tablist.addEventListener('keydown', (e) => {
            const tabs = Array.from(this.tablist.querySelectorAll('[role="tab"]'));
            const currentTab = e.target;
            
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                let index = tabs.indexOf(currentTab);
                
                if (e.key === 'ArrowRight') {
                    index = (index + 1) % tabs.length;
                } else {
                    index = (index - 1 + tabs.length) % tabs.length;
                }
                
                tabs[index].focus();
                this.activateTab(tabs[index].dataset.category);
            }
        });

        this.panelsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('movie-details-btn')) {
                const movieData = JSON.parse(e.target.dataset.movie.replace(/&apos;/g, "'"));
                this.showMovieDetails(movieData);
            }
            
            if (e.target.classList.contains('favorite-btn')) {
                const movieId = parseInt(e.target.dataset.movieId);
                this.toggleFavorite(movieId, e.target);
            }
        });
    }

    activateTab(categoryName) {
        this.tablist.querySelectorAll('[role="tab"]').forEach(tab => {
            tab.setAttribute('aria-selected', 'false');
            tab.tabIndex = -1;
        });
        
        this.panelsContainer.querySelectorAll('[role="tabpanel"]').forEach(panel => {
            panel.hidden = true;
        });
        
        const activeTab = this.tablist.querySelector('[data-category="' + categoryName + '"]');
        const activePanel = document.getElementById(categoryName + '-panel');
        
        if (activeTab && activePanel) {
            activeTab.setAttribute('aria-selected', 'true');
            activeTab.tabIndex = 0;
            activePanel.hidden = false;
            
            this.currentCategory = categoryName;
            this.saveState();
        }
    }

    toggleFavorite(movieId, button) {
        const movie = this.movies.find(m => m.id === movieId);
        if (movie) {
            movie.isFavorite = !movie.isFavorite;
            
            if (movie.isFavorite) {
                this.favorites.push(movieId);
                button.classList.add('favorited');
            } else {
                this.favorites = this.favorites.filter(id => id !== movieId);
                button.classList.remove('favorited');
            }
            
            this.saveState();
            this.updateFavorites();
        }
    }

    updateFavorites() {
        const favoriteMovies = this.movies.filter(movie => this.favorites.includes(movie.id));
        
        if (favoriteMovies.length === 0) {
            this.favoritesGrid.innerHTML = '';
            this.noFavorites.style.display = 'block';
        } else {
            this.noFavorites.style.display = 'none';
            let html = '';
            favoriteMovies.forEach(movie => {
                html += '<div class="movie-card" data-movie-id="' + movie.id + '">' +
                    '<div class="movie-rating">' + movie.rating + '</div>' +
                    '<button class="favorite-btn favorited" data-movie-id="' + movie.id + '">★</button>' +
                    '<h4 class="movie-title">' + movie.title + '</h4>' +
                    '<p class="movie-genre">' + movie.genre + '</p>' +
                    '<button class="movie-details-btn" data-movie=\'' + JSON.stringify(movie).replace(/'/g, "&apos;") + '\'>Подробнее</button>' +
                    '</div>';
            });
            this.favoritesGrid.innerHTML = html;
        }
    }

    showMovieDetails(movie) {
        const modal = new MovieModal();
        modal.open(movie);
    }

    addMovie(movieData) {
        const newMovie = {
            title: movieData.title,
            email: movieData.email,
            genre: movieData.genre,
            rating: movieData.rating,
            description: movieData.description,
            id: Date.now(),
            isFavorite: false
        };
        this.movies.push(newMovie);
        this.saveState();
        this.generateCategories();
        this.activateTab(this.currentCategory);
    }

    clearData() {
        localStorage.clear();
        this.movies = this.loadMovies();
        this.favorites = [];
        this.saveState();
        this.generateCategories();
        this.updateFavorites();
        this.activateTab('Все');
    }
}

class MovieModal {
    constructor() {
        this.modal = document.getElementById('movie-modal');
        this.modalBody = this.modal.querySelector('.modal-body');
        this.closeBtn = this.modal.querySelector('.modal-close');
        this.init();
    }

    init() {
        this.closeBtn.addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.getAttribute('aria-hidden') === 'false') {
                this.close();
            }
        });
    }

    open(movie) {
        const email = movie.email || 'не указан';
        const emailHtml = movie.email ? 
            '<a href="mailto:' + movie.email + '">' + movie.email + '</a>' : 
            'не указан';
        
        this.modalBody.innerHTML = '<div class="movie-details">' +
            '<h3>' + movie.title + '</h3>' +
            '<div class="movie-meta">' +
            '<span class="movie-genre">' + movie.genre + '</span>' +
            '<span class="movie-rating">' + movie.rating + '/10</span>' +
            '</div>' +
            '<div class="movie-contact">' +
            '<strong>Email для связи:</strong> ' + emailHtml +
            '</div>' +
            '<p class="movie-description">' + movie.description + '</p>' +
            '</div>';
        
        this.modal.setAttribute('aria-hidden', 'false');
        this.closeBtn.focus();
        
        this.trapFocus();
    }

    close() {
        this.modal.setAttribute('aria-hidden', 'true');
    }

    trapFocus() {
        const focusableElements = this.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeydown = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        this.modal.addEventListener('keydown', handleKeydown);
    }
}

class Accordion {
    constructor() {
        this.accordion = document.querySelector('.accordion');
        this.init();
    }

    init() {
        this.accordion.addEventListener('click', (e) => {
            const button = e.target.closest('.accordion-button');
            if (button) {
                this.togglePanel(button);
            }
        });

        this.accordion.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const button = e.target.closest('.accordion-button');
                if (button) {
                    e.preventDefault();
                    this.togglePanel(button);
                }
            }
        });
    }

    togglePanel(button) {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        const panel = document.getElementById(button.getAttribute('aria-controls'));
        
        if (!isExpanded) {
            button.setAttribute('aria-expanded', 'true');
            panel.setAttribute('aria-hidden', 'false');
            panel.style.maxHeight = '200px';
            panel.style.padding = '12px';
        } else {
            button.setAttribute('aria-expanded', 'false');
            panel.setAttribute('aria-hidden', 'true');
            panel.style.maxHeight = '0';
            panel.style.padding = '0';
        }
    }
}

class TooltipManager {
    constructor() {
        this.tooltip = document.querySelector('.tooltip');
        this.init();
    }

    init() {
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.showTooltip(target, target.dataset.tooltip);
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('[data-tooltip]')) {
                this.hideTooltip();
            }
        });

        document.addEventListener('focusin', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.showTooltip(target, target.dataset.tooltip);
            }
        });

        document.addEventListener('focusout', (e) => {
            if (e.target.closest('[data-tooltip]')) {
                this.hideTooltip();
            }
        });
    }

    showTooltip(element, text) {
        this.tooltip.textContent = text;
        this.tooltip.setAttribute('aria-hidden', 'false');
        
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        this.tooltip.style.top = (rect.top + scrollTop - this.tooltip.offsetHeight - 5) + 'px';
        this.tooltip.style.left = (rect.left + rect.width / 2 - this.tooltip.offsetWidth / 2) + 'px';
    }

    hideTooltip() {
        this.tooltip.setAttribute('aria-hidden', 'true');
    }
}

class FormValidator {
    constructor() {
        this.form = document.querySelector('.movie-form');
        this.submitBtn = this.form.querySelector('.submit-btn');
        this.categoriesManager = new CategoriesManager();
        this.init();
    }

    init() {
        this.form.addEventListener('input', (e) => {
            this.validateField(e.target);
            this.updateSubmitButton();
        });

        this.form.addEventListener('blur', (e) => {
            this.validateField(e.target, true);
        }, true);

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateForm()) {
                this.handleSubmit();
            }
        });
    }

    validateField(field, showError = false) {
        const errorElement = field.parentElement.querySelector('.error-message');
        let isValid = true;
        let message = '';

        if (field.validity.valueMissing) {
            isValid = false;
            message = 'Это поле обязательно для заполнения';
        } else if (field.type === 'email' && field.validity.typeMismatch) {
            isValid = false;
            message = 'Введите корректный email адрес';
        } else if (field.type === 'number' && (field.validity.rangeUnderflow || field.validity.rangeOverflow)) {
            isValid = false;
            message = 'Рейтинг должен быть от 0 до 10';
        } else if (field.id === 'description' && field.validity.tooShort) {
            isValid = false;
            message = 'Минимальная длина описания: ' + field.minLength + ' символов. Сейчас: ' + field.value.length;
        }

        if (showError || !isValid) {
            errorElement.textContent = message;
            field.setAttribute('aria-invalid', !isValid);
        } else {
            errorElement.textContent = '';
            field.setAttribute('aria-invalid', 'false');
        }

        return isValid;
    }

    validateForm() {
        const fields = this.form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field, true)) {
                isValid = false;
            }
        });

        return isValid;
    }

    updateSubmitButton() {
        const fields = this.form.querySelectorAll('input[required], textarea[required], select[required]');
        const isValid = Array.from(fields).every(field => field.validity.valid);
        
        this.submitBtn.disabled = !isValid;
    }

    handleSubmit() {
        const formData = new FormData(this.form);
        const movieData = {
            title: formData.get('title'),
            email: formData.get('email'),
            genre: formData.get('genre'),
            rating: parseFloat(formData.get('rating')),
            description: formData.get('description')
        };

        this.categoriesManager.addMovie(movieData);

        const result = document.querySelector('.form-result');
        
        setTimeout(() => {
            result.className = 'form-result success';
            result.textContent = 'Фильм успешно добавлен в каталог!';
            this.form.reset();
            this.updateSubmitButton();
        }, 500);
    }
}

class TestRunner {
    constructor() {
        this.testResults = document.getElementById('test-results');
        this.init();
    }

    init() {
        document.getElementById('run-tests').addEventListener('click', () => this.runTests());
        document.getElementById('clear-data').addEventListener('click', () => this.clearData());
    }

    runTests() {
        const results = [];
        
        results.push(this.testRatingValidation());
        results.push(this.testEmailValidation());
        results.push(this.testDescriptionValidation());
        results.push(this.testRequiredFieldValidation());
        
        const allPassed = results.every(result => result.passed);
        
        this.displayResults(results, allPassed);
    }

    testRatingValidation() {
        const tests = [
            { value: 8.5, expected: true },
            { value: 0, expected: true },
            { value: 10, expected: true },
            { value: -1, expected: false },
            { value: 11, expected: false },
            { value: 'text', expected: false }
        ];

        const passed = tests.every(test => 
            this.validateRating(test.value) === test.expected
        );

        return {
            name: 'Валидация рейтинга',
            passed: passed,
            tests: tests.length
        };
    }

    testEmailValidation() {
        const tests = [
            { value: 'test@example.com', expected: true },
            { value: 'user.name@domain.co.uk', expected: true },
            { value: 'invalid', expected: false },
            { value: 'test@', expected: false },
            { value: '@domain.com', expected: false }
        ];

        const passed = tests.every(test => 
            this.validateEmail(test.value) === test.expected
        );

        return {
            name: 'Валидация email',
            passed: passed,
            tests: tests.length
        };
    }

    testDescriptionValidation() {
        const tests = [
            { value: 'Это описание содержит более 20 символов', expected: true },
            { value: 'Короткий текст', expected: false },
            { value: 'Ровно 20 символов!!!', expected: true },
            { value: '19 символов!!!', expected: false }
        ];

        const passed = tests.every(test => 
            this.validateDescription(test.value) === test.expected
        );

        return {
            name: 'Валидация описания',
            passed: passed,
            tests: tests.length
        };
    }

    testRequiredFieldValidation() {
        const tests = [
            { value: 'Название фильма', expected: true },
            { value: '   ', expected: false },
            { value: '', expected: false },
            { value: null, expected: false }
        ];

        const passed = tests.every(test => 
            this.validateRequired(test.value) === test.expected
        );

        return {
            name: 'Обязательные поля',
            passed: passed,
            tests: tests.length
        };
    }

    validateRating(value) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0 && num <= 10;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateDescription(description) {
        if (typeof description !== 'string') return false;
        const trimmed = description.trim();
        return trimmed.length >= 20;
    }

    validateRequired(value) {
        return value !== null && value !== undefined && value.toString().trim().length > 0;
    }

    displayResults(results, allPassed) {
        let output = 'Результаты тестирования\n';
        output += '========================\n\n';
        
        results.forEach(result => {
            const status = result.passed ? 'PASS' : 'FAIL';
            output += status + ' ' + result.name + ' (' + result.tests + ' тестов)\n';
        });
        
        output += '\nИтог: ' + (allPassed ? 'Все тесты пройдены успешно!' : 'Некоторые тесты не пройдены');
        
        this.testResults.textContent = output;
        this.testResults.style.display = 'block';
    }

    clearData() {
        if (confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
            const categoriesManager = new CategoriesManager();
            categoriesManager.clearData();
            this.testResults.textContent = 'Все данные успешно очищены';
            this.testResults.style.display = 'block';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LayoutManager();
    new ThemeManager();
    new CategoriesManager();
    new Accordion();
    new TooltipManager();
    new FormValidator();
    new TestRunner();
});