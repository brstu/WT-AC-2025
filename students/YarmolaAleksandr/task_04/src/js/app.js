/**
 * Главный файл приложения IT-инструменты
 * Инициализация роутера, API и views
 */

import { Router } from './router.js';
import { ToolsAPI } from './api.js';
import { Auth } from './auth.js';
import { Toast } from './components/Toast.js';
import { ListView } from './views/ListView.js';
import { DetailView } from './views/DetailView.js';
import { CreateView } from './views/CreateView.js';
import { EditView } from './views/EditView.js';
import { LoginView } from './views/LoginView.js';

/**
 * Класс приложения
 */
class App {
    constructor() {
        this.auth = new Auth();
        this.router = new Router();
        this.api = new ToolsAPI(this.auth);
        this.initViews();
        this.initRoutes();
        this.initToast();
        this.initNavbar();
    }

    /**
     * Инициализация views
     */
    initViews() {
        this.views = {
            list: new ListView(this.api),
            detail: new DetailView(this.api, this.router),
            create: new CreateView(this.api, this.router),
            edit: new EditView(this.api, this.router),
            login: new LoginView(this.auth, this.router)
        };
    }

    /**
     * Инициализация маршрутов
     */
    initRoutes() {
        // Страница входа
        this.router.addRoute('/login', () => {
            this.views.login.render();
        });

        // Главная страница - список инструментов
        this.router.addRoute('/', () => {
            this.views.list.render();
        });

        // Детальная страница инструмента
        this.router.addRoute('/items/:id', (params) => {
            this.views.detail.render(params);
        });

        // Создание нового инструмента (требует авторизации)
        this.router.addRoute('/new', () => {
            if (!this.auth.isAuthenticated()) {
                Toast.warning('Войдите для создания инструментов');
                this.router.navigate('/login');
                return;
            }
            this.views.create.render();
        });

        // Редактирование инструмента (требует авторизации)
        this.router.addRoute('/items/:id/edit', (params) => {
            if (!this.auth.isAuthenticated()) {
                Toast.warning('Войдите для редактирования инструментов');
                this.router.navigate('/login');
                return;
            }
            this.views.edit.render(params);
        });
    }

    /**
     * Инициализация toast уведомлений
     */
    initToast() {
        Toast.init();
    }

    /**
     * Инициализация навигационной панели с кнопкой входа/выхода
     */
    initNavbar() {
        const navbar = document.querySelector('.nav-links');
        if (!navbar) return;

        // Создаем контейнер для кнопки авторизации
        const authContainer = document.createElement('div');
        authContainer.id = 'auth-container';
        navbar.appendChild(authContainer);

        // Обновляем при изменении маршрута
        window.addEventListener('hashchange', () => this.updateAuthButton());
        this.updateAuthButton();
    }

    /**
     * Обновление кнопки авторизации
     */
    updateAuthButton() {
        const container = document.getElementById('auth-container');
        if (!container) return;

        if (this.auth.isAuthenticated()) {
            const user = this.auth.getCurrentUser();
            container.innerHTML = `
                <span style="color: var(--text); margin-right: 1rem;">
                    👤 ${user.username}
                    ${user.role === 'admin' ? ' 👨‍💼' : ''}
                </span>
                <button class="btn btn-secondary" id="logoutBtn">Выйти</button>
            `;

            document.getElementById('logoutBtn')?.addEventListener('click', () => {
                this.auth.logout();
                Toast.success('Вы вышли из системы');
                this.router.navigate('/');
                this.updateAuthButton();
            });
        } else {
            container.innerHTML = `
                <a href="#/login" class="btn btn-primary">🔐 Войти</a>
            `;
        }
    }
}

// Запуск приложения при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
