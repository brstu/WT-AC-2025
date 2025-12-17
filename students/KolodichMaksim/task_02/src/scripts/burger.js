// scripts/burger.js
export function initBurger() {
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('nav');
  const body = document.body;

  function openMenu() {
    burger.setAttribute('aria-expanded', 'true');
    nav.removeAttribute('hidden');
    body.style.overflow = 'hidden';
    // Фокус на первое меню
    nav.querySelector('a')?.focus();
  }

  function closeMenu() {
    burger.setAttribute('aria-expanded', 'false');
    nav.setAttribute('hidden', '');
    body.style.overflow = '';
    burger.focus();
  }

  burger.addEventListener('click', () => {
    const isOpen = burger.getAttribute('aria-expanded') === 'true';
    if (isOpen) closeMenu();
    else openMenu();
  });

  // Закрытие по клику вне меню
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !burger.contains(e.target) && !nav.hasAttribute('hidden')) {
      closeMenu();
    }
  });

  // Esc закрывает меню
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !nav.hasAttribute('hidden')) {
      closeMenu();
    }
  });

  // Закрытие по ссылкам (если это SPA — можно убрать)
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 768) closeMenu();
    });
  });
}