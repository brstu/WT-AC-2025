// Основной файл приложения
import { Router } from './router.js';
import { BookApi } from './api.js';
import { Views } from './views.js';

// Инициализация приложения
class BookCatalogApp {
    constructor() {
        // Инициализация API (используем localStorage версию)
        this.api = new BookApi();
        
        // Определение маршрутов
        this.routes = [
            {
                path: '/books',
                callback: (params, queryParams) => {
                    // Получаем поисковый запрос из параметров
                    const searchQuery = queryParams.search || '';
                    this.views.showBooksList(searchQuery);
                }
            },
            {
                path: '/books/:id',
                callback: (params) => {
                    this.views.showBookDetail(params.id);
                }
            },
            {
                path: '/new',
                callback: () => {
                    this.views.showCreateBookForm();
                }
            },
            {
                path: '/books/:id/edit',
                callback: (params) => {
                    this.views.showEditBookForm(params.id);
                }
            }
        ];
        
        // Инициализация маршрутизатора
        this.router = Router.create(this.routes);
        
        // Инициализация представлений
        this.views = new Views(this.api, this.router);
        
        // Инициализация приложения
        this.init();
    }
    
    init() {
        console.log('Приложение "Каталог книг" инициализировано');
        
        // Добавляем глобальный обработчик для кнопки "Попробовать снова" на экранах ошибок
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'retry-btn') {
                this.router.handleRoute();
            }
        });
    }
}

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new BookCatalogApp();
});