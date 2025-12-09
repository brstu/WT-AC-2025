// scripts/tabs.js
export function initTabs() {
  const tablist = document.querySelector('.tabs__nav');
  const tabs = tablist.querySelectorAll('[role="tab"]');
  const panels = document.querySelectorAll('[role="tabpanel"]');

  function activateTab(targetTab) {
    tabs.forEach(tab => {
      const isSelected = tab === targetTab;
      tab.setAttribute('aria-selected', isSelected);
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    panels.forEach(panel => {
      if (panel.id === targetTab.getAttribute('aria-controls')) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  }

  tablist.addEventListener('click', e => {
    const tab = e.target.closest('[role="tab"]');
    if (tab) {
      e.preventDefault();
      activateTab(tab);
      tab.focus();
    }
  });

  // Клавиатурная навигация по табам
  tablist.addEventListener('keydown', e => {
    const current = document.activeElement;
    if (!current.matches('[role="tab"]')) return;

    let newTab;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      newTab = current.nextElementSibling || tabs[0];
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      newTab = current.previousElementSibling || tabs[tabs.length - 1];
    } else if (e.key === 'Home') {
      e.preventDefault();
      newTab = tabs[0];
    } else if (e.key === 'End') {
      e.preventDefault();
      newTab = tabs[tabs.length - 1];
    }

    if (newTab) {
      activateTab(newTab);
      newTab.focus();
    }
  });

  // Инициализация: первый таб активен
  if (tabs.length) activateTab(tabs[0]);
}