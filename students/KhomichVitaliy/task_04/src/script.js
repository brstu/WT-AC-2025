 import router from './router.js';
import views from './views.js';
import api from './api.js';

class HackathonApp {
    constructor() {
        this.initRouter();
        this.initDebug();
        console.log('Приложение базы хакатонов запущено!');
    }
    
    initRouter() {
        router.addRoute('/', () => {
            views.renderHome();
        }, 'Главная');

        router.addRoute('/hackathons', (params, query) => {
            views.renderHackathons(params, query);
        }, 'Все хакатоны');

        router.addRoute('/hackathons/:id', (params) => {
            views.renderHackathonDetail(params);
        }, 'Детали хакатона');

        router.addRoute('/new', () => {
            views.renderHackathonForm();
        }, 'Создание хакатона');

        router.addRoute('/hackathons/:id/edit', (params) => {
            views.renderHackathonForm(params);
        }, 'Редактирование хакатона');
 
        router.addRoute('/stats', () => {
            views.renderStats();
        }, 'Статистика');
    
        router.addRoute('*', () => {
            views.renderNotFound();
        });
    }
    
    initDebug() {

        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.createDebugPanel();
        }
        

        window.app = this;
        window.api = api;
        window.views = views;
        window.router = router;
        
        console.log('Для отладки доступны глобальные объекты:');
        console.log('- app: экземпляр приложения');
        console.log('- api: методы работы с API');
        console.log('- views: методы рендеринга');
        console.log('- router: методы маршрутизации');
    }
    
    createDebugPanel() {
        const debugPanel = document.createElement('div');
        debugPanel.className = 'debug-panel';
        debugPanel.innerHTML = `
            <div class="debug-info">Маршрут: <span id="debug-route">/</span></div>
            <div class="debug-info">Параметры: <span id="debug-params">{}</span></div>
            <div class="debug-info">Query: <span id="debug-query">{}</span></div>
        `;
        document.body.appendChild(debugPanel);
        

        const updateDebugInfo = () => {
            document.getElementById('debug-route').textContent = router.getCurrentPath();
            document.getElementById('debug-params').textContent = JSON.stringify(router.params);
            document.getElementById('debug-query').textContent = JSON.stringify(router.query);
        };

        window.addEventListener('hashchange', updateDebugInfo);
        window.addEventListener('load', updateDebugInfo);
        updateDebugInfo();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new HackathonApp();
});