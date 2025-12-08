// Основной класс трекера привычек
class HabitTracker {
    constructor() {
        this.habitsContainer = document.getElementById('habits-container');
        this.noHabitsMessage = document.getElementById('no-habits-message');
        this.totalHabitsElement = document.getElementById('total-habits');
        this.totalLikesElement = document.getElementById('total-likes');
        this.habits = this.loadHabits();
        this.currentDeleteId = null;
        
        this.initEventDelegation();
        this.initAccordion();
        this.initModal();
        this.initThemeToggle();
        this.renderHabits();
        this.updateStats();
    }
    
    // Загрузка привычек из localStorage
    loadHabits() {
        const savedHabits = localStorage.getItem('habits');
        return savedHabits ? JSON.parse(savedHabits) : [];
    }
    
    // Сохранение привычек в localStorage
    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }
    
    // Инициализация делегирования событий
    initEventDelegation() {
        this.habitsContainer.addEventListener('click', (e) => {
            const habitCard = e.target.closest('.habit-card');
            if (!habitCard) return;
            
            const habitId = habitCard.dataset.id;
            
            // Обработка лайков
            if (e.target.closest('.like-btn')) {
                this.toggleLike(habitId);
            }
            
            // Обработка удаления
            if (e.target.closest('.delete-btn')) {
                this.showDeleteModal(habitId);
            }
            
            // Обработка редактирования
            if (e.target.closest('.edit-btn')) {
                this.editHabit(habitId);
            }
        });
        
        // Обработка клавиатурных событий для делегирования
        this.habitsContainer.addEventListener('keydown', (e) => {
            const habitCard = e.target.closest('.habit-card');
            if (!habitCard) return;
            
            const habitId = habitCard.dataset.id;
            
            if (e.key === 'Enter' || e.key === ' ') {
                if (e.target.closest('.like-btn')) {
                    e.preventDefault();
                    this.toggleLike(habitId);
                } else if (e.target.closest('.delete-btn')) {
                    e.preventDefault();
                    this.showDeleteModal(habitId);
                } else if (e.target.closest('.edit-btn')) {
                    e.preventDefault();
                    this.editHabit(habitId);
                }
            }
        });
    }
    
    // Инициализация аккордеона
    initAccordion() {
        const accordionButtons = document.querySelectorAll('.accordion-button');
        
        accordionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const expanded = button.getAttribute('aria-expanded') === 'true';
                this.toggleAccordion(button, !expanded);
            });
            
            // Обработка клавиатурных событий для аккордеона
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const expanded = button.getAttribute('aria-expanded') === 'true';
                    this.toggleAccordion(button, !expanded);
                }
            });
        });
    }
    
    // Переключение состояния аккордеона
    toggleAccordion(button, expanded) {
        button.setAttribute('aria-expanded', expanded);
        const panel = document.getElementById(button.getAttribute('aria-controls'));
        panel.setAttribute('aria-hidden', !expanded);
        
        if (expanded) {
            panel.style.maxHeight = panel.scrollHeight + 'px';
        } else {
            panel.style.maxHeight = '0';
        }
    }
    
    // Инициализация модального окна
    initModal() {
        this.modal = document.getElementById('delete-modal');
        this.closeModalBtn = document.getElementById('close-modal');
        this.cancelDeleteBtn = document.getElementById('cancel-delete');
        this.confirmDeleteBtn = document.getElementById('confirm-delete');
        this.habitToDeleteName = document.getElementById('habit-to-delete-name');
        
        // Закрытие модального окна
        const closeModal = () => {
            this.modal.classList.remove('active');
            this.modal.setAttribute('aria-modal', 'false');
            document.body.style.overflow = 'auto';
        };
        
        // Обработчики событий для модального окна
        this.closeModalBtn.addEventListener('click', closeModal);
        this.cancelDeleteBtn.addEventListener('click', closeModal);
        
        // Закрытие по клику на фон
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                closeModal();
            }
        });
        
        // Закрытие по Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                closeModal();
            }
        });
        
        // Подтверждение удаления
        this.confirmDeleteBtn.addEventListener('click', () => {
            if (this.currentDeleteId) {
                this.deleteHabit(this.currentDeleteId);
                closeModal();
            }
        });
        
        // Управление фокусом в модальном окне
        this.modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusableElements = this.modal.querySelectorAll('button');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }
    
    // Инициализация переключателя темы
    initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = themeToggle.querySelector('i');
        
        // Проверка сохранённой темы
        const savedTheme = localStorage.getItem('theme') || 
                          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        // Обработчик переключения темы
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            localStorage.setItem('theme', newTheme);
        });
    }
    
    // Отображение модального окна удаления
    showDeleteModal(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        this.currentDeleteId = habitId;
        this.habitToDeleteName.textContent = habit.name;
        
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-modal', 'true');
        document.body.style.overflow = 'hidden';
        
        // Установка фокуса на кнопку закрытия
        this.closeModalBtn.focus();
    }
    
    // Переключение лайка
    toggleLike(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        habit.liked = !habit.liked;
        habit.likes += habit.liked ? 1 : -1;
        
        this.saveHabits();
        this.renderHabits();
        this.updateStats();
    }
    
    // Удаление привычки
    deleteHabit(habitId) {
        this.habits = this.habits.filter(h => h.id !== habitId);
        this.saveHabits();
        this.renderHabits();
        this.updateStats();
    }
    
    // Редактирование привычки
    editHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        // Заполнение формы данными привычки
        document.getElementById('habit-name').value = habit.name;
        document.getElementById('habit-category').value = habit.category;
        document.getElementById('habit-goal').value = habit.goal;
        
        // Установка правильной сложности
        const difficultyRadio = document.querySelector(`input[name="difficulty"][value="${habit.difficulty}"]`);
        if (difficultyRadio) difficultyRadio.checked = true;
        
        // Удаление старой привычки
        this.deleteHabit(habitId);
        
        // Прокрутка к форме
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        
        // Фокус на поле названия
        document.getElementById('habit-name').focus();
    }
    
    // Добавление новой привычки
    addHabit(habitData) {
        const newHabit = {
            id: Date.now().toString(),
            name: habitData.name,
            category: habitData.category,
            goal: habitData.goal,
            difficulty: habitData.difficulty,
            likes: 0,
            liked: false,
            createdAt: new Date().toLocaleDateString('ru-RU')
        };
        
        this.habits.unshift(newHabit);
        this.saveHabits();
        this.renderHabits();
        this.updateStats();
    }
    
    // Отрисовка всех привычек
    renderHabits() {
        if (this.habits.length === 0) {
            this.noHabitsMessage.style.display = 'block';
            this.habitsContainer.innerHTML = '<p id="no-habits-message" class="no-habits">У вас пока нет привычек. Добавьте первую!</p>';
            this.noHabitsMessage = document.getElementById('no-habits-message');
            return;
        }
        
        this.noHabitsMessage.style.display = 'none';
        
        const habitsHTML = this.habits.map(habit => `
            <div class="habit-card" data-id="${habit.id}" tabindex="0">
                <div class="habit-header">
                    <div>
                        <h3 class="habit-title">${habit.name}</h3>
                        <span class="habit-category">${this.getCategoryName(habit.category)}</span>
                    </div>
                    <div class="habit-difficulty ${this.getDifficultyClass(habit.difficulty)}">
                        ${this.getDifficultyName(habit.difficulty)}
                    </div>
                </div>
                
                <div class="habit-body">
                    <p class="habit-goal">${habit.goal}</p>
                </div>
                
                <div class="habit-footer">
                    <div class="habit-actions">
                        <button class="action-btn like-btn ${habit.liked ? 'active' : ''}" 
                                aria-label="${habit.liked ? 'Убрать лайк' : 'Поставить лайк'}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="action-btn edit-btn" aria-label="Редактировать привычку">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" aria-label="Удалить привычку">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    
                    <div>
                        <span class="like-count">${habit.likes} <i class="fas fa-heart"></i></span>
                        <div class="habit-date">Добавлено: ${habit.createdAt}</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        this.habitsContainer.innerHTML = habitsHTML;
    }
    
    // Обновление статистики
    updateStats() {
        this.totalHabitsElement.textContent = this.habits.length;
        
        const totalLikes = this.habits.reduce((sum, habit) => sum + habit.likes, 0);
        this.totalLikesElement.textContent = totalLikes;
    }
    
    // Вспомогательные методы
    getCategoryName(category) {
        const categories = {
            health: 'Здоровье',
            development: 'Развитие',
            work: 'Работа',
            other: 'Другое'
        };
        return categories[category] || 'Другое';
    }
    
    getDifficultyName(difficulty) {
        const difficulties = {
            easy: 'Легкая',
            medium: 'Средняя',
            hard: 'Сложная'
        };
        return difficulties[difficulty] || 'Легкая';
    }
    
    getDifficultyClass(difficulty) {
        return `difficulty-${difficulty}`;
    }
}

// Валидация формы
class FormValidator {
    constructor(tracker) {
        this.form = document.getElementById('habit-form');
        this.submitBtn = document.getElementById('submit-btn');
        this.successMessage = document.getElementById('form-success');
        this.tracker = tracker;
        
        this.initValidation();
    }
    
    initValidation() {
        // Поля для валидации
        this.fields = {
            name: {
                element: document.getElementById('habit-name'),
                error: document.getElementById('name-error'),
                validate: (value) => this.validateName(value)
            },
            goal: {
                element: document.getElementById('habit-goal'),
                error: document.getElementById('goal-error'),
                validate: (value) => this.validateGoal(value)
            }
        };
        
        // Обработчики событий для полей
        Object.values(this.fields).forEach(field => {
            field.element.addEventListener('input', () => {
                this.validateField(field);
                this.updateSubmitButton();
            });
            
            field.element.addEventListener('blur', () => {
                this.validateField(field);
            });
        });
        
        // Обработчик отправки формы
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateForm()) {
                this.submitForm();
            }
        });
        
        // Изначальная проверка кнопки
        this.updateSubmitButton();
    }
    
    // Валидация имени
    validateName(value) {
        if (!value.trim()) {
            return 'Название привычки обязательно';
        }
        
        if (value.length < 2) {
            return 'Название должно быть не менее 2 символов';
        }
        
        if (value.length > 50) {
            return 'Название должно быть не более 50 символов';
        }
        
        return '';
    }
    
    // Валидация цели
    validateGoal(value) {
        if (!value.trim()) {
            return 'Цель привычки обязательна';
        }
        
        if (value.length < 20) {
            return `Минимум 20 символов. Сейчас: ${value.length}`;
        }
        
        return '';
    }
    
    // Валидация отдельного поля
    validateField(field) {
        const value = field.element.value;
        const error = field.validate(value);
        
        field.error.textContent = error;
        
        if (error) {
            field.element.style.borderColor = 'var(--danger-color)';
            return false;
        } else {
            field.element.style.borderColor = 'var(--light-gray)';
            return true;
        }
    }
    
    // Валидация всей формы
    validateForm() {
        let isValid = true;
        
        Object.values(this.fields).forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    // Обновление состояния кнопки отправки
    updateSubmitButton() {
        const isValid = Object.values(this.fields).every(field => {
            return field.validate(field.element.value) === '';
        });
        
        this.submitBtn.disabled = !isValid;
    }
    
    // Отправка формы
    submitForm() {
        const formData = {
            name: this.fields.name.element.value.trim(),
            category: document.getElementById('habit-category').value,
            goal: this.fields.goal.element.value.trim(),
            difficulty: document.querySelector('input[name="difficulty"]:checked').value
        };
        
        // Добавление привычки через трекер
        this.tracker.addHabit(formData);
        
        // Показ сообщения об успехе
        this.showSuccessMessage('Привычка успешно добавлена!');
        
        // Сброс формы
        this.form.reset();
        
        // Сброс ошибок
        Object.values(this.fields).forEach(field => {
            field.error.textContent = '';
            field.element.style.borderColor = 'var(--light-gray)';
        });
        
        // Обновление кнопки
        this.updateSubmitButton();
    }
    
    // Показ сообщения об успехе
    showSuccessMessage(message) {
        this.successMessage.textContent = message;
        this.successMessage.style.display = 'block';
        
        // Автоматическое скрытие сообщения
        setTimeout(() => {
            this.successMessage.style.display = 'none';
        }, 3000);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Создание экземпляра трекера
    const tracker = new HabitTracker();
    
    // Инициализация валидации формы
    const formValidator = new FormValidator(tracker);
    
    // Предзагрузка тестовых данных (для демонстрации)
    if (tracker.habits.length === 0) {
        const demoHabits = [
            {
                id: '1',
                name: 'Утренняя зарядка',
                category: 'health',
                goal: 'Делать 15-минутную разминку каждое утро для поддержания физической формы',
                difficulty: 'easy',
                likes: 3,
                liked: false,
                createdAt: '01.11.2023'
            },
            {
                id: '2',
                name: 'Чтение книг',
                category: 'development',
                goal: 'Читать минимум 20 страниц в день для расширения кругозора и улучшения концентрации',
                difficulty: 'medium',
                likes: 5,
                liked: true,
                createdAt: '25.10.2023'
            },
            {
                id: '3',
                name: 'Изучение английского',
                category: 'development',
                goal: 'Заниматься английским языком 30 минут в день для улучшения навыков общения',
                difficulty: 'hard',
                likes: 7,
                liked: true,
                createdAt: '15.10.2023'
            }
        ];
        
        tracker.habits = demoHabits;
        tracker.saveHabits();
        tracker.renderHabits();
        tracker.updateStats();
    }
});