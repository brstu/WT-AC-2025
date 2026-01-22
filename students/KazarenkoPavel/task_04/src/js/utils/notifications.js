/**
 * Утилиты для работы с уведомлениями
 */
export class NotificationManager {
  constructor(store) {
    this.store = store;
    this.container = document.getElementById('notification-container');
    this.init();
  }

  /**
   * Инициализация менеджера уведомлений
   */
  init() {
    // Подписка на изменения уведомлений в store
    this.store.subscribe((state) => {
      this.renderNotifications(state.notifications);
    });

    // Обработка кликов по кнопкам закрытия
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('notification-close')) {
        const notificationId = parseInt(e.target.closest('.notification').dataset.id);
        this.store.removeNotification(notificationId);
      }
    });
  }

  /**
   * Показать успешное уведомление
   */
  success(title, message = '') {
    this.store.addNotification({
      type: 'success',
      title,
      message,
      icon: 'fas fa-check-circle'
    });
  }

  /**
   * Показать уведомление об ошибке
   */
  error(title, message = '') {
    this.store.addNotification({
      type: 'error',
      title,
      message,
      icon: 'fas fa-exclamation-circle'
    });
  }

  /**
   * Показать предупреждение
   */
  warning(title, message = '') {
    this.store.addNotification({
      type: 'warning',
      title,
      message,
      icon: 'fas fa-exclamation-triangle'
    });
  }

  /**
   * Показать информационное уведомление
   */
  info(title, message = '') {
    this.store.addNotification({
      type: 'info',
      title,
      message,
      icon: 'fas fa-info-circle'
    });
  }

  /**
   * Рендеринг уведомлений
   */
  renderNotifications(notifications) {
    this.container.innerHTML = notifications.map(notification => `
            <div class="notification ${notification.type}" data-id="${notification.id}">
                <div class="notification-icon">
                    <i class="${notification.icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    ${notification.message ? `<div class="notification-message">${notification.message}</div>` : ''}
                </div>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
  }
}

/**
 * Менеджер модальных окон
 */
export class ModalManager {
  constructor() {
    this.overlay = document.getElementById('modal-overlay');
    this.confirmModal = document.getElementById('confirm-modal');
    this.confirmTitle = document.getElementById('confirm-title');
    this.confirmMessage = document.getElementById('confirm-message');
    this.confirmCancel = document.getElementById('confirm-cancel');
    this.confirmOk = document.getElementById('confirm-ok');

    this.currentResolve = null;
    this.init();
  }

  /**
   * Инициализация модальных окон
   */
  init() {
    // Закрытие по клику на оверлей
    this.overlay.addEventListener('click', () => this.hideConfirm());

    // Закрытие по кнопке отмены
    this.confirmCancel.addEventListener('click', () => {
      this.hideConfirm();
      if (this.currentResolve) {
        this.currentResolve(false);
        this.currentResolve = null;
      }
    });

    // Подтверждение по кнопке OK
    this.confirmOk.addEventListener('click', () => {
      this.hideConfirm();
      if (this.currentResolve) {
        this.currentResolve(true);
        this.currentResolve = null;
      }
    });

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.confirmModal.classList.contains('hidden')) {
        this.hideConfirm();
        if (this.currentResolve) {
          this.currentResolve(false);
          this.currentResolve = null;
        }
      }
    });
  }

  /**
   * Показать модальное окно подтверждения
   */
  confirm(title, message) {
    return new Promise((resolve) => {
      this.confirmTitle.textContent = title;
      this.confirmMessage.textContent = message;
      this.currentResolve = resolve;
      this.showConfirm();
    });
  }

  /**
   * Показать модальное окно
   */
  showConfirm() {
    this.overlay.classList.remove('hidden');
    this.confirmModal.classList.remove('hidden');
    this.confirmOk.focus();
  }

  /**
   * Скрыть модальное окно
   */
  hideConfirm() {
    this.overlay.classList.add('hidden');
    this.confirmModal.classList.add('hidden');
  }
}
