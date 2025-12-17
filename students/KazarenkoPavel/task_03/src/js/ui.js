/**
 * Модуль для управления UI состоянием
 */
export class BooksUI {
  constructor() {
    this.elements = {
      loadingState: document.getElementById('loading-state'),
      errorState: document.getElementById('error-state'),
      emptyState: document.getElementById('empty-state'),
      contentState: document.getElementById('content-state'),
      booksContainer: document.getElementById('books-container'),
      searchInput: document.getElementById('search-input'),
      genreFilter: document.getElementById('genre-filter'),
      refreshBtn: document.getElementById('refresh-btn'),
      cancelBtn: document.getElementById('cancel-btn'),
      retryBtn: document.getElementById('retry-btn'),
      prevBtn: document.getElementById('prev-btn'),
      nextBtn: document.getElementById('next-btn'),
      currentPage: document.getElementById('current-page'),
      cacheIndicator: document.getElementById('cache-indicator'),
      retryIndicator: document.getElementById('retry-indicator'),
      timer: document.getElementById('timer'),
      errorText: document.getElementById('error-text'),
      debugLog: document.getElementById('debug-log'),
      bookModal: document.getElementById('book-modal'),
      bookDetails: document.getElementById('book-details')
    };

    this.currentPage = 1;
    this.currentSearch = '';
    this.currentGenre = '';
    this.isLoading = false;
    this.startTime = null;
    this.timerInterval = null;
  }

  /**
   * Показать состояние загрузки
   */
  showLoading() {
    this.hideAllStates();
    this.elements.loadingState.classList.remove('hidden');
    this.isLoading = true;
    this.startTimer();
  }

  /**
   * Показать состояние ошибки
   */
  showError(message) {
    this.hideAllStates();
    this.elements.errorText.textContent = message;
    this.elements.errorState.classList.remove('hidden');
    this.isLoading = false;
    this.stopTimer();
  }

  /**
   * Показать состояние "пусто"
   */
  showEmpty() {
    this.hideAllStates();
    this.elements.emptyState.classList.remove('hidden');
    this.isLoading = false;
    this.stopTimer();
  }

  /**
   * Показать контент
   */
  showContent() {
    this.hideAllStates();
    this.elements.contentState.classList.remove('hidden');
    this.isLoading = false;
    this.stopTimer();
  }

  /**
   * Скрыть все состояния
   */
  hideAllStates() {
    Object.values(this.elements).forEach(element => {
      if (element && element.classList && element.classList.contains('state')) {
        element.classList.add('hidden');
      }
    });
  }

  /**
   * Обновить индикатор кэша
   */
  updateCacheIndicator(fromCache) {
    const indicator = this.elements.cacheIndicator;
    indicator.classList.remove('cache-cached', 'cache-fresh');

    if (fromCache) {
      indicator.textContent = 'Кэш: загружено из кэша';
      indicator.classList.add('cache-cached');
    } else {
      indicator.textContent = 'Кэш: свежие данные';
      indicator.classList.add('cache-fresh');
    }
  }

  /**
   * Показать индикатор ретрая
   */
  showRetryIndicator(attempt, maxAttempts) {
    const indicator = this.elements.retryIndicator;
    indicator.textContent = `Повтор ${attempt}/${maxAttempts}`;
    indicator.style.display = 'inline-block';

    // Автоматически скрыть через 2 секунды
    setTimeout(() => {
      indicator.style.display = 'none';
    }, 2000);
  }

  /**
   * Обновить список книг
   */
  updateBooks(books) {
    const container = this.elements.booksContainer;
    container.innerHTML = '';

    if (books.length === 0) {
      this.showEmpty();
      return;
    }

    books.forEach(book => {
      const bookCard = this.createBookCard(book);
      container.appendChild(bookCard);
    });

    this.showContent();
  }

  /**
   * Создать карточку книги
   */
  createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.dataset.id = book.id;

    const coverEmoji = this.getGenreEmoji(book.genre);

    card.innerHTML = `
            <div class="book-cover">
                ${coverEmoji}
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.author}</p>
                <p class="book-year">Год: ${book.year}</p>
                <span class="book-genre">${book.genre}</span>
            </div>
        `;

    card.addEventListener('click', () => this.showBookDetails(book.id));
    return card;
  }

  /**
   * Показать детали книги
   */
  async showBookDetails(bookId, api) {
    try {
      const { data: book } = await api.getBookDetails(bookId);

      const details = this.elements.bookDetails;
      details.innerHTML = `
                <div class="book-detail">
                    <div class="book-detail-cover">
                        ${this.getGenreEmoji(book.genre)}
                    </div>
                    <div class="book-detail-info">
                        <h2>${book.title}</h2>
                        <p><strong>Автор:</strong> ${book.author}</p>
                        <p><strong>Год издания:</strong> ${book.year}</p>
                        <p><strong>Жанр:</strong> ${book.genre}</p>
                        <p><strong>ISBN:</strong> ${book.isbn}</p>
                        <p><strong>Описание:</strong></p>
                        <p>${book.description}</p>
                        <p><strong>Рейтинг:</strong> ${'★'.repeat(book.rating)}${'☆'.repeat(5 - book.rating)}</p>
                    </div>
                </div>
            `;

      this.elements.bookModal.classList.remove('hidden');

      // Закрытие модального окна
      const closeBtn = this.elements.bookModal.querySelector('.modal-close');
      closeBtn.onclick = () => this.elements.bookModal.classList.add('hidden');

      this.elements.bookModal.onclick = (e) => {
        if (e.target === this.elements.bookModal) {
          this.elements.bookModal.classList.add('hidden');
        }
      };

    } catch (error) {
      console.error('Ошибка при загрузке деталей книги:', error);
    }
  }

  /**
   * Обновить пагинацию
   */
  updatePagination(totalBooks, limit) {
    const totalPages = Math.ceil(totalBooks / limit);

    this.elements.prevBtn.disabled = this.currentPage <= 1;
    this.elements.nextBtn.disabled = this.currentPage >= totalPages;
    this.elements.currentPage.textContent = this.currentPage;
  }

  /**
   * Добавить запись в лог дебага
   */
  addDebugLog(message) {
    const log = this.elements.debugLog;
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.textContent = `[${timestamp}] ${message}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;

    // Ограничиваем количество записей
    if (log.children.length > 50) {
      log.removeChild(log.firstChild);
    }
  }

  /**
   * Таймер выполнения запроса
   */
  startTimer() {
    this.startTime = Date.now();
    this.stopTimer();

    this.timerInterval = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      this.elements.timer.textContent = `${elapsed.toFixed(1)}s`;
    }, 100);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Вспомогательные методы
   */
  getGenreEmoji(genre) {
    const emojiMap = {
      'Фантастика': '🚀',
      'Детектив': '🔍',
      'Роман': '❤️',
      'Научная': '🔬',
      'История': '🏛️',
      'Поэзия': '✍️',
      'Приключения': '🗺️'
    };
    return emojiMap[genre] || '📚';
  }

  /**
   * Очистить поиск
   */
  clearSearch() {
    this.elements.searchInput.value = '';
    this.currentSearch = '';
  }

  /**
   * Сбросить фильтры
   */
  resetFilters() {
    this.elements.genreFilter.value = '';
    this.currentGenre = '';
    this.currentPage = 1;
  }
}
