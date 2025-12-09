export function initializeTabs() {
    const tabList = document.querySelector('[role="tablist"]');
    const tabs = document.querySelectorAll('[role="tab"]');
    const panels = document.querySelectorAll('[role="tabpanel"]');

    // Обработка кликов
    tabList.addEventListener('click', e => {
        const tab = e.target.closest('[role="tab"]');
        if (!tab) return;
        switchTab(tab);
    });

    // Обработка клавиатуры
    tabList.addEventListener('keydown', e => {
        const targetTab = e.target.closest('[role="tab"]');
        if (!targetTab) return;

        const tabArray = Array.from(tabs);
        const index = tabArray.indexOf(targetTab);

        let newTab;
        switch (e.key) {
            case 'ArrowLeft':
                newTab = tabArray[index - 1] || tabArray[tabArray.length - 1];
                break;
            case 'ArrowRight':
                newTab = tabArray[index + 1] || tabArray[0];
                break;
            default:
                return;
        }

        e.preventDefault();
        switchTab(newTab);
        newTab.focus();
    });

    function switchTab(newTab) {
        // Деактивация текущего таба
        const oldTab = tabList.querySelector('[aria-selected="true"]');
        oldTab.setAttribute('aria-selected', 'false');
        oldTab.tabIndex = -1;

        // Активация нового таба
        newTab.setAttribute('aria-selected', 'true');
        newTab.tabIndex = 0;

        // Скрытие старой панели
        const oldPanelId = oldTab.getAttribute('aria-controls');
        const oldPanel = document.getElementById(oldPanelId);
        oldPanel.hidden = true;

        // Показ новой панели
        const newPanelId = newTab.getAttribute('aria-controls');
        const newPanel = document.getElementById(newPanelId);
        newPanel.hidden = false;
    }
}