// Client-side JavaScript for tasks tracker
class TasksTracker {
    constructor() {
        this.baseUrl = '/api';
        this.tasksContainer = document.getElementById('tasks-container');
        this.loadingElement = document.getElementById('loading');
        this.errorElement = document.getElementById('error');
        this.taskForm = document.getElementById('add-task-form');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        // Элементы статистики
        this.totalTasksElement = document.getElementById('total-tasks');
        this.completedTasksElement = document.getElementById('completed-tasks');
        this.pendingTasksElement = document.getElementById('pending-tasks');
        
        this.currentFilter = 'all';
        this.tasks = [];
        
        this.initialize();
    }

    initialize() {
        this.loadTasks();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Форма добавления задачи
        this.taskForm.addEventListener('submit', (e) => this.handleAddTask(e));
        
        // Фильтры
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilter(e));
        });
    }

    async loadTasks() {
        this.showLoading();
        this.hideError();

        try {
            const response = await fetch(`${this.baseUrl}/tasks`);
            this.tasks = await response.json();
            
            this.updateStats();
            this.displayTasks();
        } catch (error) {
            this.showError('Не удалось загрузить задачи. Попробуйте позже.');
            console.error('Ошибка загрузки задач:', error);
        } finally {
            this.hideLoading();
        }
    }

    displayTasks() {
        this.tasksContainer.innerHTML = '';

        if (this.tasks.length === 0) {
            this.tasksContainer.innerHTML = `
                <div class="no-tasks">
                    <h3>Задачи не найдены</h3>
                    <p>Добавьте первую задачу!</p>
                </div>
            `;
            return;
        }

        const filteredTasks = this.tasks.filter(task => {
            if (this.currentFilter === 'all') return true;
            if (this.currentFilter === 'completed') return task.completed;
            if (this.currentFilter === 'pending') return !task.completed;
            return true;
        });

        if (filteredTasks.length === 0) {
            this.tasksContainer.innerHTML = `
                <div class="no-tasks">
                    <h3>Нет задач по выбранному фильтру</h3>
                    <p>Попробуйте другой фильтр</p>
                </div>
            `;
            return;
        }

        filteredTasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.className = `task-card ${task.completed ? 'completed' : ''}`;
            taskCard.dataset.id = task.id;
            
            const formattedDate = task.dueDate ? 
                new Date(task.dueDate).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }) : 'Без срока';
            
            taskCard.innerHTML = `
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <span class="task-status ${task.completed ? 'status-completed' : 'status-pending'}">
                        ${task.completed ? '✅ Выполнена' : '🔄 Ожидает'}
                    </span>
                </div>
                <p class="task-description">${task.description || 'Нет описания'}</p>
                <div class="task-footer">
                    <div class="task-meta">
                        <div class="task-due-date">📅 ${formattedDate}</div>
                        <div class="task-priority">Приоритет: <strong>${this.getPriorityText(task.priority)}</strong></div>
                    </div>
                    <div class="task-actions">
                        <button class="action-btn complete-btn" data-action="toggle">
                            ${task.completed ? '↩️ Возобновить' : '✓ Выполнить'}
                        </button>
                        <button class="action-btn delete-btn" data-action="delete">
                            🗑️ Удалить
                        </button>
                    </div>
                </div>
            `;
            
            this.tasksContainer.appendChild(taskCard);
        });

        this.setupTaskActions();
    }

    setupTaskActions() {
        document.querySelectorAll('.task-card .action-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const action = e.currentTarget.dataset.action;
                const taskCard = e.currentTarget.closest('.task-card');
                const taskId = taskCard.dataset.id;
                
                if (action === 'toggle') {
                    await this.toggleTask(taskId);
                } else if (action === 'delete') {
                    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
                        await this.deleteTask(taskId);
                    }
                }
            });
        });
    }

    getPriorityText(priority) {
        const priorities = {
            'low': 'Низкий',
            'medium': 'Средний',
            'high': 'Высокий'
        };
        return priorities[priority] || priority;
    }

    async handleAddTask(e) {
        e.preventDefault();
        
        const titleInput = document.getElementById('title');
        const descriptionInput = document.getElementById('description');
        const dueDateInput = document.getElementById('due-date');
        const priorityInput = document.getElementById('priority');
        
        const taskData = {
            title: titleInput.value.trim(),
            description: descriptionInput.value.trim(),
            dueDate: dueDateInput.value || null,
            priority: priorityInput.value
        };
        
        if (!taskData.title) {
            alert('Пожалуйста, введите название задачи');
            return;
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData)
            });
            
            if (response.ok) {
                const newTask = await response.json();
                this.tasks.push(newTask);
                this.updateStats();
                this.displayTasks();
                
                // Очищаем форму
                titleInput.value = '';
                descriptionInput.value = '';
                dueDateInput.value = '';
                priorityInput.value = 'medium';
                
                // Фокусируемся на поле названия
                titleInput.focus();
            } else {
                throw new Error('Ошибка создания задачи');
            }
        } catch (error) {
            this.showError('Не удалось добавить задачу. Попробуйте снова.');
            console.error('Ошибка добавления задачи:', error);
        }
    }

    async toggleTask(taskId) {
        try {
            const response = await fetch(`${this.baseUrl}/tasks/${taskId}/toggle`, {
                method: 'PATCH'
            });
            
            if (response.ok) {
                const updatedTask = await response.json();
                
                // Обновляем задачу в массиве
                const index = this.tasks.findIndex(t => t.id === taskId);
                if (index !== -1) {
                    this.tasks[index] = updatedTask;
                }
                
                this.updateStats();
                this.displayTasks();
            }
        } catch (error) {
            this.showError('Не удалось обновить задачу');
            console.error('Ошибка переключения задачи:', error);
        }
    }

    async deleteTask(taskId) {
        try {
            const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Удаляем задачу из массива
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.updateStats();
                this.displayTasks();
            }
        } catch (error) {
            this.showError('Не удалось удалить задачу');
            console.error('Ошибка удаления задачи:', error);
        }
    }

    handleFilter(e) {
        const filter = e.currentTarget.dataset.filter;
        this.currentFilter = filter;
        
        // Обновляем активную кнопку
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
        
        this.displayTasks();
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        this.totalTasksElement.textContent = total;
        this.completedTasksElement.textContent = completed;
        this.pendingTasksElement.textContent = pending;
    }

    showLoading() {
        this.loadingElement.style.display = 'block';
    }

    hideLoading() {
        this.loadingElement.style.display = 'none';
    }

    showError(message) {
        this.errorElement.textContent = message;
        this.errorElement.style.display = 'block';
    }

    hideError() {
        this.errorElement.style.display = 'none';
    }
}

// Инициализация приложения при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    new TasksTracker();
});