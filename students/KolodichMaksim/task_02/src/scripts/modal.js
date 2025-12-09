
export function initModal() {
  const modal = document.getElementById('book-modal');
  const closeBtn = modal.querySelector('.modal__close');
  const overlay = modal.querySelector('.modal__overlay');
  const firstFocusable = modal.querySelector('button');

  function closeModal() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  modal.addEventListener('click', (e) => e.stopPropagation());
}