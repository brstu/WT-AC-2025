// scripts/accordion.js
export function initAccordion() {
  const triggers = document.querySelectorAll('.accordion__trigger');

  triggers.forEach(trigger => {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

    // Инициализация состояния
    if (isExpanded) {
      panel.removeAttribute('hidden');
    } else {
      panel.setAttribute('hidden', '');
    }

    trigger.addEventListener('click', () => {
      const currentlyExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Переключаем текущее
      trigger.setAttribute('aria-expanded', !currentlyExpanded);
      panel.toggleAttribute('hidden');

      // Опционально: закрывать другие (аккордеон, а не все сразу)
      if (!currentlyExpanded) {
        triggers.forEach(other => {
          if (other !== trigger) {
            other.setAttribute('aria-expanded', 'false');
            const otherPanel = document.getElementById(other.getAttribute('aria-controls'));
            otherPanel?.setAttribute('hidden', '');
          }
        });
      }
    });

    // Поддержка Enter и Space
    trigger.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });
}