// scripts/modules/tabs.js
export class Tabs {
    constructor(tabsSelector, panelsSelector, activeTabId = null) {
        this.tabsContainer = document.querySelector(tabsSelector);
        this.panels = document.querySelectorAll(panelsSelector);
        this.tabs = this.tabsContainer.querySelectorAll('[role="tab"]');
        
        this.init(activeTabId);
        this.setupKeyboardNavigation();
    }

    init(activeTabId) {
        // Если есть сохраненная активная вкладка, активируем её
        if (activeTabId) {
            const savedTab = document.getElementById(activeTabId);
            if (savedTab) {
                this.activateTab(savedTab);
                return;
            }
        }

        // Активируем первую вкладку по умолчанию
        const firstTab = this.tabs[0];
        if (firstTab) {
            this.activateTab(firstTab);
        }

        // Обработчики кликов
        this.tabsContainer.addEventListener('click', (e) => {
            const tab = e.target.closest('[role="tab"]');
            if (tab) {
                this.activateTab(tab);
            }
        });
    }

    activateTab(selectedTab) {
        // Сбрасываем все вкладки
        this.tabs.forEach(tab => {
            tab.setAttribute('aria-selected', 'false');
            tab.classList.remove('active');
            tab.tabIndex = -1;
        });

        // Скрываем все панели
        this.panels.forEach(panel => {
            panel.setAttribute('hidden', '');
            panel.setAttribute('aria-hidden', 'true');
            panel.classList.remove('active');
        });

        // Активируем выбранную вкладку
        selectedTab.setAttribute('aria-selected', 'true');
        selectedTab.classList.add('active');
        selectedTab.removeAttribute('tabindex');
        selectedTab.focus();

        // Показываем соответствующую панель
        const panelId = selectedTab.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.removeAttribute('hidden');
            panel.setAttribute('aria-hidden', 'false');
            panel.classList.add('active');
        }

        // Сохраняем в localStorage
        this.saveActiveTab(selectedTab.id);
    }

    setupKeyboardNavigation() {
        this.tabsContainer.addEventListener('keydown', (e) => {
            const currentTab = document.activeElement;
            if (!currentTab.matches('[role="tab"]')) return;

            let newTab;
            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    newTab = this.getPreviousTab(currentTab);
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    newTab = this.getNextTab(currentTab);
                    break;
                case 'Home':
                    e.preventDefault();
                    newTab = this.tabs[0];
                    break;
                case 'End':
                    e.preventDefault();
                    newTab = this.tabs[this.tabs.length - 1];
                    break;
                default:
                    return;
            }

            if (newTab) {
                this.activateTab(newTab);
            }
        });
    }

    getPreviousTab(currentTab) {
        const currentIndex = Array.from(this.tabs).indexOf(currentTab);
        return currentIndex > 0 ? this.tabs[currentIndex - 1] : this.tabs[this.tabs.length - 1];
    }

    getNextTab(currentTab) {
        const currentIndex = Array.from(this.tabs).indexOf(currentTab);
        return currentIndex < this.tabs.length - 1 ? this.tabs[currentIndex + 1] : this.tabs[0];
    }

    saveActiveTab(tabId) {
        try {
            const state = JSON.parse(localStorage.getItem('gadgetCollectionState') || '{}');
            state.activeTab = tabId;
            localStorage.setItem('gadgetCollectionState', JSON.stringify(state));
        } catch (error) {
            console.error('Ошибка при сохранении вкладки:', error);
        }
    }
}