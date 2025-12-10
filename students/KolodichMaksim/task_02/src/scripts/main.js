import { initAccordion } from './accordion.js';
import { initTabs } from './tabs.js';
import { initModal } from './modal.js';
import { initBurger } from './burger.js';
import { initForm } from './form.js';
import { initBooks } from './delegates.js';
import { initThemeToggle } from './theme.js';

document.addEventListener('DOMContentLoaded', () => {
  initAccordion();
  initTabs();
  initModal();
  initBurger();
  initForm();
  initBooks();
  initThemeToggle();
});