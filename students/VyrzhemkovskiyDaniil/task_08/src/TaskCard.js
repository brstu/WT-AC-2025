/**
 * TaskCard component for displaying individual tasks
 */
class TaskCard {
    constructor(task) {
        this.task = task;
    }

    render() {
        const formattedDate = this.task.dueDate ? 
            new Date(this.task.dueDate).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }) : 'Без срока';
        
        const priorityText = this.getPriorityText(this.task.priority);
        
        return `
            <div class="task-card ${this.task.completed ? 'completed' : ''}" data-id="${this.task.id}">
                <div class="task-header">
                    <h3 class="task-title">${this.task.title}</h3>
                    <span class="task-status ${this.task.completed ? 'status-completed' : 'status-pending'}">
                        ${this.task.completed ? '✅ Выполнена' : '🔄 Ожидает'}
                    </span>
                </div>
                <p class="task-description">${this.task.description || 'Нет описания'}</p>
                <div class="task-footer">
                    <div class="task-meta">
                        <div class="task-due-date">📅 ${formattedDate}</div>
                        <div class="task-priority">Приоритет: <strong>${priorityText}</strong></div>
                    </div>
                    <div class="task-actions">
                        <button class="action-btn complete-btn" data-action="toggle">
                            ${this.task.completed ? '↩️ Возобновить' : '✓ Выполнить'}
                        </button>
                        <button class="action-btn delete-btn" data-action="delete">
                            🗑️ Удалить
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create task card element
     * @returns {HTMLElement}
     */
    createElement() {
        const div = document.createElement('div');
        div.className = `task-card ${this.task.completed ? 'completed' : ''}`;
        div.setAttribute('data-id', this.task.id);
        
        const formattedDate = this.task.dueDate ? 
            new Date(this.task.dueDate).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }) : 'Без срока';
        
        const priorityText = this.getPriorityText(this.task.priority);
        
        div.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${this.task.title}</h3>
                <span class="task-status ${this.task.completed ? 'status-completed' : 'status-pending'}">
                    ${this.task.completed ? '✅ Выполнена' : '🔄 Ожидает'}
                </span>
            </div>
            <p class="task-description">${this.task.description || 'Нет описания'}</p>
            <div class="task-footer">
                <div class="task-meta">
                    <div class="task-due-date">📅 ${formattedDate}</div>
                    <div class="task-priority">Приоритет: <strong>${priorityText}</strong></div>
                </div>
                <div class="task-actions">
                    <button class="action-btn complete-btn" data-action="toggle">
                        ${this.task.completed ? '↩️ Возобновить' : '✓ Выполнить'}
                    </button>
                    <button class="action-btn delete-btn" data-action="delete">
                        🗑️ Удалить
                    </button>
                </div>
            </div>
        `;
        
        return div;
    }

    getPriorityText(priority) {
        const priorities = {
            'low': 'Низкий',
            'medium': 'Средний',
            'high': 'Высокий'
        };
        return priorities[priority] || priority;
    }
}

module.exports = TaskCard;