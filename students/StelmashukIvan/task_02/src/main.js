// Управление днями поездки
class DaysManager {
    constructor() {
        this.tablist = document.querySelector('.days-tablist');
        this.panelsContainer = document.querySelector('.tab-panels');
        this.addDayBtn = document.querySelector('.add-day-btn');
        this.removeDayBtn = document.querySelector('.remove-day-btn');
        this.daysCount = 3;
        this.currentDay = 1;
        this.init();
    }

    init() {
        this.generateDays();
        this.setupEventListeners();
        this.activateTab(1);
    }

    generateDays() {
        this.tablist.innerHTML = '';
        this.panelsContainer.innerHTML = '';

        for (let i = 1; i <= this.daysCount; i++) {
            // Создаем таб
            const tab = document.createElement('button');
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', 'false');
            tab.setAttribute('aria-controls', `day-${i}-panel`);
            tab.textContent = `День ${i}`;
            tab.dataset.day = i;
            this.tablist.appendChild(tab);

            // Создаем панель
            const panel = document.createElement('div');
            panel.setAttribute('role', 'tabpanel');
            panel.id = `day-${i}-panel`;
            panel.className = 'day-panel';
            panel.innerHTML = `
                <h3>День ${i}</h3>
                <div class="day-events" data-day="${i}">
                    <p class="no-events">Мероприятий пока нет.</p>
                </div>
                <div class="event-actions">
                    <button class="add-event-btn" data-day="${i}">Добавить мероприятие</button>
                </div>
            `;
            this.panelsContainer.appendChild(panel);
        }

        this.updateRemoveButton();
    }

    setupEventListeners() {
        // Делегирование для табов
        this.tablist.addEventListener('click', (e) => {
            const tab = e.target.closest('[role="tab"]');
            if (tab) {
                this.activateTab(parseInt(tab.dataset.day));
            }
        });

        // Клавиатурная навигация по табам
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
                this.activateTab(parseInt(tabs[index].dataset.day));
            }
        });

        this.addDayBtn.addEventListener('click', () => this.addDay());
        this.removeDayBtn.addEventListener('click', () => this.removeDay());

        // Делегирование для кнопок добавления мероприятий
        this.panelsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-event-btn')) {
                const day = parseInt(e.target.dataset.day);
                this.addEvent(day);
            }
        });

        // Делегирование для удаления мероприятий
        this.panelsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-event')) {
                e.target.closest('.event-item').remove();
                this.checkEmptyEvents();
            }
        });
    }

    activateTab(dayNumber) {
        // Деактивируем все табы
        this.tablist.querySelectorAll('[role="tab"]').forEach(tab => {
            tab.setAttribute('aria-selected', 'false');
            tab.tabIndex = -1;
        });
        
        // Скрываем все панели
        this.panelsContainer.querySelectorAll('[role="tabpanel"]').forEach(panel => {
            panel.hidden = true;
        });
        
        // Активируем выбранный таб
        const activeTab = this.tablist.querySelector(`[data-day="${dayNumber}"]`);
        const activePanel = document.getElementById(`day-${dayNumber}-panel`);
        
        activeTab.setAttribute('aria-selected', 'true');
        activeTab.tabIndex = 0;
        activePanel.hidden = false;
        
        this.currentDay = dayNumber;
    }

    addDay() {
        this.daysCount++;
        this.generateDays();
        this.activateTab(this.daysCount);
    }

    removeDay() {
        if (this.daysCount > 1) {
            this.daysCount--;
            this.generateDays();
            this.activateTab(Math.min(this.currentDay, this.daysCount));
        }
    }

    updateRemoveButton() {
        this.removeDayBtn.disabled = this.daysCount <= 1;
    }

    addEvent(day) {
        const title = prompt('Введите название мероприятия:');
        const time = prompt('Введите время (например, 10:00):');
        
        if (title && time) {
            const eventsContainer = document.querySelector(`[data-day="${day}"]`);
            const noEventsMsg = eventsContainer.querySelector('.no-events');
            
            if (noEventsMsg) {
                noEventsMsg.remove();
            }

            const eventElement = document.createElement('div');
            eventElement.className = 'event-item';
            eventElement.innerHTML = `
                <div class="event-time">${time}</div>
                <div class="event-title">${title}</div>
                <button class="delete-event" aria-label="Удалить мероприятие">×</button>
            `;

            eventsContainer.appendChild(eventElement);
        }
    }

    checkEmptyEvents() {
        document.querySelectorAll('.day-events').forEach(container => {
            if (!container.querySelector('.event-item')) {
                container.innerHTML = '<p class="no-events">Мероприятий пока нет.</p>';
            }
        });
    }
}

// Аккордеон
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
        } else {
            button.setAttribute('aria-expanded', 'false');
            panel.setAttribute('aria-hidden', 'true');
        }
    }
}

// Управление задачами
class TasksManager {
    constructor() {
        this.container = document.querySelector('.tasks-container');
        this.init();
    }

    init() {
        // Делегирование событий
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-task-btn')) {
                this.addTask();
                return;
            }
            
            if (e.target.classList.contains('delete-task')) {
                this.deleteTask(e.target);
                return;
            }
            
            if (e.target.classList.contains('task-example-btn')) {
                this.addExampleTask(e.target.textContent);
            }
        });

        // Обработка Enter в поле ввода
        const taskInput = document.querySelector('.new-task-input');
        taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTask();
            }
        });

        // Делегирование для чекбоксов
        this.container.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                this.toggleTask(e.target);
            }
        });
    }

    addTask() {
        const input = document.querySelector('.new-task-input');
        const taskText = input.value.trim();
        
        if (taskText) {
            const taskList = document.querySelector('.task-list');
            const taskItem = document.createElement('label');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox">
                <span class="task-text">${taskText}</span>
                <button class="delete-task" aria-label="Удалить задачу">×</button>
            `;
            taskList.appendChild(taskItem);
            input.value = '';
            input.focus();
        }
    }

    addExampleTask(taskText) {
        const taskList = document.querySelector('.task-list');
        const taskItem = document.createElement('label');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox">
            <span class="task-text">${taskText}</span>
            <button class="delete-task" aria-label="Удалить задачу">×</button>
        `;
        taskList.appendChild(taskItem);
    }

    deleteTask(button) {
        const taskItem = button.closest('.task-item');
        if (taskItem) {
            taskItem.remove();
        }
    }

    toggleTask(checkbox) {
        const taskText = checkbox.nextElementSibling;
        if (checkbox.checked) {
            taskText.style.textDecoration = 'line-through';
            taskText.style.color = '#7f8c8d';
        } else {
            taskText.style.textDecoration = 'none';
            taskText.style.color = '#333';
        }
    }
}

// Тултипы
class TooltipManager {
    constructor() {
        this.tooltip = document.querySelector('.tooltip');
        this.init();
    }

    init() {
        // Делегирование для всех элементов с data-tooltip
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

// Валидация формы
class FormValidator {
    constructor() {
        this.form = document.querySelector('.contact-form');
        this.submitBtn = this.form.querySelector('.submit-btn');
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
        } else if (field.id === 'message' && field.validity.tooShort) {
            isValid = false;
            message = `Минимальная длина сообщения: ${field.minLength} символов. Сейчас: ${field.value.length}`;
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
        const fields = this.form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field, true)) {
                isValid = false;
            }
        });

        return isValid;
    }

    updateSubmitButton() {
        const fields = this.form.querySelectorAll('input[required], textarea[required]');
        const isValid = Array.from(fields).every(field => field.validity.valid);
        
        this.submitBtn.disabled = !isValid;
        this.submitBtn.setAttribute('aria-disabled', !isValid);
    }

    handleSubmit() {
        const result = document.querySelector('.form-result');
        
        setTimeout(() => {
            result.className = 'form-result success';
            result.textContent = 'Сообщение успешно отправлено!';
            this.form.reset();
            this.updateSubmitButton();
        }, 500);
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    new DaysManager();
    new Accordion();
    new TasksManager();
    new TooltipManager();
    new FormValidator();
});