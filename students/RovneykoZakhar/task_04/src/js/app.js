import Router from './router.js';
import API from './api.js';
import ComicsListView from './views/recipe-list.js';
import ComicDetailView from './views/recipe-detail.js';
import ComicFormView from './views/recipe-form.js';

// Инициализация приложения
class App {
    constructor() {
        this.api = new API('http://localhost:3000');
        this.router = new Router();
        this.currentView = null;
        
        this.init();
    }
    
    init() {
        // Регистрация маршрутов
        this.router.addRoute('#/comics', () => this.showComicsList());
        this.router.addRoute('#/comics/:id', (params) => this.showComicDetail(params.id));
        this.router.addRoute('#/new', () => this.showComicForm());
        this.router.addRoute('#/comics/:id/edit', (params) => this.showComicForm(params.id));
        
        // Запуск маршрутизатора
        this.router.init();
    }
    
    async showComicsList() {
        const searchParams = this.router.getSearchParams();
        this.currentView = new ComicsListView(this.api, this.router, searchParams);
        await this.currentView.render();
    }
    
    async showComicDetail(id) {
        this.currentView = new ComicDetailView(this.api, this.router, id);
        await this.currentView.render();
    }
    
    async showComicForm(id = null) {
        this.currentView = new ComicFormView(this.api, this.router, id);
        await this.currentView.render();
    }
    
    showNotification(message, type = 'success') {
        const notifications = document.getElementById('notifications');
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                ${type === 'success' ? '✓' : '✗'}
            </div>
            <div class="notification-content">${message}</div>
        `;
        
        notifications.appendChild(notification);
        
        // Автоматическое удаление уведомления через 5 секунд
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notifications.contains(notification)) {
                    notifications.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});