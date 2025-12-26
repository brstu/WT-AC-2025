/**
 * Layout компонент для общих элементов
 */
export class LayoutManager {
  constructor(store, api) {
    this.store = store;
    this.api = api;
    this.unsubscribe = null;
  }

  /**
   * Инициализация layout
   */
  init() {
    // Подписка на обновления для статистики
    this.unsubscribe = this.store.subscribe((state) => {
      this.updateStats();
    });

    // Загрузка начальной статистики
    this.loadStats();
  }

  /**
   * Загрузка статистики
   */
  async loadStats() {
    try {
      const stats = await this.api.getStats();
      this.store.setState(state => ({
        ...state,
        stats
      }));
    } catch (error) {
      console.warn('Не удалось загрузить статистику:', error);
    }
  }

  /**
   * Обновление статистики в футере
   */
  updateStats() {
    const { stats } = this.store.state;

    const totalRecipesElement = document.getElementById('total-recipes');
    const totalTimeElement = document.getElementById('total-time');

    if (totalRecipesElement && stats) {
      totalRecipesElement.textContent = stats.total || 0;
    }

    if (totalTimeElement && stats) {
      totalTimeElement.textContent = stats.totalTime || 0;
    }
  }

  /**
   * Обновление активной навигации
   */
  updateNavigation(currentRoute) {
    document.querySelectorAll('.navbar-link').forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === currentRoute);
    });
  }

  /**
   * Показать/скрыть loading screen
   */
  setLoading(loading) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = loading ? 'block' : 'none';
    }
  }

  /**
   * Установка заголовка страницы
   */
  setPageTitle(title) {
    if (title) {
      document.title = `${title} — Кулинарная книга`;
    } else {
      document.title = 'Кулинарная книга';
    }
  }

  /**
   * Обновление breadcrumbs
   */
  updateBreadcrumbs(routes) {
    const breadcrumbsContainer = document.querySelector('.breadcrumbs');
    if (!breadcrumbsContainer) return;

    breadcrumbsContainer.innerHTML = `
            <ul class="breadcrumbs-list">
                ${routes.map((route, index) => `
                    <li class="breadcrumbs-item">
                        ${index < routes.length - 1 ? `
                            <a href="${route.url}" class="breadcrumbs-link">${route.title}</a>
                            <span class="breadcrumbs-separator">/</span>
                        ` : `
                            <span class="breadcrumbs-link active">${route.title}</span>
                        `}
                    </li>
                `).join('')}
            </ul>
        `;
  }

  /**
   * Очистка
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
