/**
 * Компонент табов для переключения между темами
 * @module components/tabs
 */

const ACTIVE_TAB_KEY = 'lab02_active_tab';

/**
 * Инициализирует функциональность табов
 */
export function initTabs() {
  const tabs = Array.from(document.querySelectorAll('.tabs [role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

  // Инициализация tabindex для всех табов
  tabs.forEach((tab, index) => {
    tab.setAttribute('tabindex', tab.getAttribute('aria-selected') === 'true' ? '0' : '-1');
    
    // Обработчик клика
    tab.addEventListener('click', () => activateTab(tab, tabs, panels));
    
    // Обработчик клавиатуры
    tab.addEventListener('keydown', e => handleTabKeydown(e, tab, tabs, panels, index));
  });

  // Восстановление активной вкладки из localStorage
  restoreActiveTab(tabs, panels);

  // Обработчик для CTA кнопки (переход к JavaScript)
  const ctaBtn = document.querySelector('.cta-js-btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      const jsTab = document.getElementById('tab-3');
      if (jsTab) {
        jsTab.focus();
        activateTab(jsTab, tabs, panels);
      }
    });
  }
}

/**
 * Активирует указанную вкладку
 * @param {HTMLElement} tab - Вкладка для активации
 * @param {HTMLElement[]} tabs - Все вкладки
 * @param {HTMLElement[]} panels - Все панели
 */
function activateTab(tab, tabs, panels) {
  tabs.forEach(t => {
    const selected = t === tab;
    t.setAttribute('aria-selected', selected ? 'true' : 'false');
    t.setAttribute('tabindex', selected ? '0' : '-1');
  });

  panels.forEach(p => {
    const visible = p.id === tab.getAttribute('aria-controls');
    p.hidden = !visible;
    p.setAttribute('aria-hidden', visible ? 'false' : 'true');
  });

  // Сохранение активной вкладки в localStorage
  if (tab && tab.id) {
    try {
      localStorage.setItem(ACTIVE_TAB_KEY, tab.id);
    } catch (e) {
      console.warn('localStorage недоступен', e);
    }
  }
}

/**
 * Обработчик клавиатурной навигации для табов
 * @param {KeyboardEvent} e - Событие клавиатуры
 * @param {HTMLElement} tab - Текущая вкладка
 * @param {HTMLElement[]} tabs - Все вкладки
 * @param {HTMLElement[]} panels - Все панели
 * @param {number} index - Индекс текущей вкладки
 */
function handleTabKeydown(e, tab, tabs, panels, index) {
  let targetTab = null;

  if (e.key === 'ArrowRight') {
    targetTab = tabs[(index + 1) % tabs.length];
    e.preventDefault();
  } else if (e.key === 'ArrowLeft') {
    targetTab = tabs[(index - 1 + tabs.length) % tabs.length];
    e.preventDefault();
  } else if (e.key === 'Home') {
    targetTab = tabs[0];
    e.preventDefault();
  } else if (e.key === 'End') {
    targetTab = tabs[tabs.length - 1];
    e.preventDefault();
  } else if (e.key === 'Enter' || e.key === ' ') {
    activateTab(tab, tabs, panels);
    e.preventDefault();
  }

  if (targetTab) {
    targetTab.focus();
    activateTab(targetTab, tabs, panels);
  }
}

/**
 * Восстанавливает активную вкладку из localStorage
 * @param {HTMLElement[]} tabs - Все вкладки
 * @param {HTMLElement[]} panels - Все панели
 */
function restoreActiveTab(tabs, panels) {
  let initialTab = null;

  try {
    const saved = localStorage.getItem(ACTIVE_TAB_KEY);
    if (saved) {
      initialTab = document.getElementById(saved);
    }
  } catch (e) {
    console.warn('localStorage недоступен', e);
  }

  if (!initialTab) {
    initialTab = document.querySelector('.tabs [role="tab"][aria-selected="true"]') || tabs[0];
  }

  if (initialTab) {
    activateTab(initialTab, tabs, panels);
  }
}
