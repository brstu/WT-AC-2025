import { Loading } from '../components/Loading.js';
import { ErrorComponent } from '../components/Error.js';
import { Empty } from '../components/Empty.js';

/**
 * View для отображения списка инструментов
 */
export class ListView {
    constructor(api) {
        this.api = api;
        this.tools = [];
        this.categories = [];
        this.filters = {
            search: '',
            category: 'all',
            sort: 'name'
        };
    }

    /**
     * Рендер страницы списка
     */
    async render() {
        const app = document.getElementById('app');
        app.innerHTML = Loading.render('Загрузка инструментов...');

        try {
            await this.loadData();
            app.innerHTML = this.getHTML();
            this.attachEventListeners();
        } catch (error) {
            console.error('Ошибка при загрузке:', error);
            app.innerHTML = ErrorComponent.render(error.message, () => this.render());
        }
    }

    /**
     * Загрузка данных
     */
    async loadData() {
        this.categories = await this.api.getCategories();
        this.tools = await this.api.getAll(this.filters);
    }

    /**
     * Генерация HTML
     */
    getHTML() {
        return `
            <div class="main-content">
                <div class="container">
                    <div class="page-header">
                        <h1 class="page-title">🛠️ IT-инструменты</h1>
                        <p class="page-subtitle">Справочник полезных инструментов для разработки</p>
                    </div>

                    ${this.getSearchSection()}
                    ${this.tools.length > 0 ? this.getToolsGrid() : Empty.render()}
                </div>
            </div>
        `;
    }

    /**
     * Секция поиска и фильтров
     */
    getSearchSection() {
        return `
            <div class="search-section">
                <div class="search-bar">
                    <input 
                        type="text" 
                        class="search-input" 
                        placeholder="🔍 Поиск инструментов..."
                        value="${this.filters.search}"
                        id="searchInput"
                    >
                    <select class="form-select" id="sortSelect" style="max-width: 200px;">
                        <option value="name" ${this.filters.sort === 'name' ? 'selected' : ''}>По названию</option>
                        <option value="rating" ${this.filters.sort === 'rating' ? 'selected' : ''}>По рейтингу</option>
                        <option value="date" ${this.filters.sort === 'date' ? 'selected' : ''}>По дате</option>
                    </select>
                    <a href="#/new" class="btn btn-primary">➕ Добавить</a>
                </div>
                
                <div class="filter-tags">
                    <div class="filter-tag ${this.filters.category === 'all' ? 'active' : ''}" data-category="all">
                        Все
                    </div>
                    ${this.categories.map(cat => `
                        <div class="filter-tag ${this.filters.category === cat ? 'active' : ''}" data-category="${cat}">
                            ${cat}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Сетка инструментов
     */
    getToolsGrid() {
        return `
            <div class="cards-grid">
                ${this.tools.map(tool => this.getToolCard(tool)).join('')}
            </div>
        `;
    }

    /**
     * Карточка инструмента
     */
    getToolCard(tool) {
        const stars = '⭐'.repeat(tool.rating);
        return `
            <div class="card" data-tool-id="${tool.id}">
                <div class="card-header">
                    <div class="card-icon">${tool.icon}</div>
                    <div class="card-category">${tool.category}</div>
                </div>
                <h3 class="card-title">${tool.name}</h3>
                <p class="card-description">${tool.description}</p>
                <div class="card-meta">
                    <span>${stars}</span>
                    <span>${tool.platforms.length} платформ</span>
                </div>
            </div>
        `;
    }

    /**
     * Привязка обработчиков событий
     */
    attachEventListeners() {
        // Поиск
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filters.search = e.target.value;
                this.render();
            }, 300);
        });

        // Сортировка
        const sortSelect = document.getElementById('sortSelect');
        sortSelect?.addEventListener('change', (e) => {
            this.filters.sort = e.target.value;
            this.render();
        });

        // Фильтр по категориям
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                this.filters.category = tag.dataset.category;
                this.render();
            });
        });

        // Клик по карточке
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
                const toolId = card.dataset.toolId;
                window.location.hash = `/items/${toolId}`;
            });
        });
    }
}
