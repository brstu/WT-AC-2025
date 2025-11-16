/**
 * Главный файл приложения IT-инструменты
 * Инициализация роутера, API и views
 */

import { Router } from './router.js';
import { ToolsAPI } from './api.js';
import { Toast } from './components/Toast.js';
import { ListView } from './views/ListView.js';
import { DetailView } from './views/DetailView.js';
import { CreateView } from './views/CreateView.js';
import { EditView } from './views/EditView.js';

/**
 * Класс приложения
 */
class App {
    constructor() {
        this.router = new Router();
        this.api = new ToolsAPI();
        this.initViews();
        this.initRoutes();
        this.initToast();
    }

    /**
     * Инициализация views
     */
    initViews() {
        this.views = {
            list: new ListView(this.api),
            detail: new DetailView(this.api, this.router),
            create: new CreateView(this.api, this.router),
            edit: new EditView(this.api, this.router)
        };
    }

    /**
     * Инициализация маршрутов
     */
    initRoutes() {
        // Главная страница - список инструментов
        this.router.addRoute('/', () => {
            this.views.list.render();
        });

        // Детальная страница инструмента
        this.router.addRoute('/items/:id', (params) => {
            this.views.detail.render(params);
        });

        // Создание нового инструмента
        this.router.addRoute('/new', () => {
            this.views.create.render();
        });

        // Редактирование инструмента
        this.router.addRoute('/items/:id/edit', (params) => {
            this.views.edit.render(params);
        });
    }

    /**
     * Инициализация toast уведомлений
     */
    initToast() {
        Toast.init();
    }
}

// Запуск приложения при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
