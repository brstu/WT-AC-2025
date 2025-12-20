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
        this.prefetchCache = new Map(); // Кэш для предзагрузки
    }

    /**
     * Рендер страницы списка
     */
    async render() {
        const app = document.getElementById('app');
        
        // Восстановление фильтров из URL
        this.parseFiltersFromURL();
        
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
     * Парсинг фильтров из URL
     */
    parseFiltersFromURL() {
        const hash = window.location.hash.slice(1);
        const [path, query] = hash.split('?');
        
        if (query) {
            const params = new URLSearchParams(query);
            this.filters.search = params.get('search') || '';
            this.filters.category = params.get('category') || 'all';
            this.filters.sort = params.get('sort') || 'name';
        }
    }

    /**
     * Обновление URL с текущими фильтрами
     */
    updateURL() {
        const params = new URLSearchParams();
        
        if (this.filters.search) {
            params.set('search', this.filters.search);
        }
        if (this.filters.category !== 'all') {
            params.set('category', this.filters.category);
        }
        if (this.filters.sort !== 'name') {
            params.set('sort', this.filters.sort);
        }
        
        const query = params.toString();
        const newHash = query ? `/?${query}` : '/';
        
        // Обновляем URL без перезагрузки страницы
        if (window.location.hash.slice(1) !== newHash) {
            window.history.replaceState(null, '', `#${newHash}`);
        }
    }

    /**
     * Загрузка данных
     */
    async loadData() {
        this.categories = await this.api.getCategories();
        this.tools = await this.api.getAll(this.filters);
        
        // Обновляем URL после загрузки
        this.updateURL();
    }

    /**
     * Генерация HTML
     */
    getHTML() {
        return `
            <div class="main-content">
                <div class="container">
                    <div class="page-header">
                        <h1 class="page-title">Справочник полезных инструментов для разработки</h1>
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
            <div class="search-section" role="search" aria-label="Поиск и фильтрация инструментов">
                <div class="search-bar">
                    <input 
                        type="text" 
                        class="search-input" 
                        placeholder="🔍 Поиск инструментов..."
                        value="${this.filters.search}"
                        id="searchInput"
                        aria-label="Поиск по названию или описанию инструмента"
                        role="searchbox"
                    >
                    <select 
                        class="form-select" 
                        id="sortSelect" 
                        style="max-width: 200px;"
                        aria-label="Сортировка инструментов"
                    >
                        <option value="name" ${this.filters.sort === 'name' ? 'selected' : ''}>По названию</option>
                        <option value="rating" ${this.filters.sort === 'rating' ? 'selected' : ''}>По рейтингу</option>
                        <option value="date" ${this.filters.sort === 'date' ? 'selected' : ''}>По дате</option>
                    </select>
                    <a href="#/new" class="btn btn-primary" aria-label="Добавить новый инструмент">➕ Добавить</a>
                </div>
                
                <div class="filter-tags" role="group" aria-label="Фильтр по категориям">
                    <button 
                        class="filter-tag ${this.filters.category === 'all' ? 'active' : ''}" 
                        data-category="all"
                        role="button"
                        aria-pressed="${this.filters.category === 'all'}"
                        aria-label="Показать все категории"
                    >
                        Все
                    </button>
                    ${this.categories.map(cat => `
                        <button 
                            class="filter-tag ${this.filters.category === cat ? 'active' : ''}" 
                            data-category="${cat}"
                            role="button"
                            aria-pressed="${this.filters.category === cat}"
                            aria-label="Фильтр по категории ${cat}"
                        >
                            ${cat}
                        </button>
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
            <div class="cards-grid" role="list" aria-label="Список инструментов">
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
            <article 
                class="card" 
                data-tool-id="${tool.id}"
                role="listitem"
                aria-label="${tool.name} - ${tool.category}"
                tabindex="0"
            >
                <div class="card-header">
                    <div class="card-icon" aria-hidden="true">${tool.icon}</div>
                    <div class="card-category" aria-label="Категория: ${tool.category}">${tool.category}</div>
                </div>
                <h3 class="card-title">${tool.name}</h3>
                <p class="card-description">${tool.description}</p>
                <div class="card-meta" aria-label="Рейтинг и платформы">
                    <span aria-label="Рейтинг ${tool.rating} из 5">${stars}</span>
                    <span>${tool.platforms.length} платформ</span>
                </div>
            </article>
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
            const toolId = card.dataset.toolId;
            
            // Предзагрузка данных при наведении
            card.addEventListener('mouseenter', () => {
                this.prefetchTool(toolId);
            });
            
            // Фокус на карточке (для клавиатурной навигации)
            card.addEventListener('focus', () => {
                this.prefetchTool(toolId);
            });
            
            // Клик для перехода
            card.addEventListener('click', () => {
                window.location.hash = `/items/${toolId}`;
            });
            
            // Добавляем tabindex для клавиатурной доступности
            card.setAttribute('tabindex', '0');
            card.style.cursor = 'pointer';
        });
    }

    /**
     * Предзагрузка данных инструмента
     * @param {string} toolId - ID инструмента для предзагрузки
     */
    async prefetchTool(toolId) {
        // Проверяем, не загружали ли мы уже эти данные
        if (this.prefetchCache.has(toolId)) {
            return;
        }
        
        try {
            // Помечаем как загружаемый
            this.prefetchCache.set(toolId, 'loading');
            
            // Загружаем данные в фоне
            const data = await this.api.getById(toolId);
            
            // Сохраняем в кэш
            this.prefetchCache.set(toolId, data);
            
            console.log(`✅ Предзагружены данные для инструмента #${toolId}`);
        } catch (error) {
            console.warn(`⚠️ Ошибка предзагрузки для #${toolId}:`, error);
            this.prefetchCache.delete(toolId);
        }
    }
}
