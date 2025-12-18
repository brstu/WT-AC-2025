// Демо-данные для начального списка книг
const initialBooks = [
    { 
        id: 1, 
        title: "Мастер и Маргарита", 
        author: "Михаил Булгаков", 
        notes: "Великолепный роман о любви, борьбе добра со злом и таинственных событиях в Москве.", 
        email: "bulgakov@example.com", 
        liked: true, 
        status: "read",
        link: "https://www.litres.ru/mihail-bulgakov/master-i-margarita/"
    },
    { 
        id: 2, 
        title: "1984", 
        author: "Джордж Оруэлл", 
        notes: "Антиутопический роман о тоталитарном обществе и контроле над личностью.", 
        email: "orwell@example.com", 
        liked: false, 
        status: "read",
        link: "https://www.litres.ru/dzhordzh-oruell/1984/"
    },
    { 
        id: 3, 
        title: "Гарри Поттер и философский камень", 
        author: "Джоан Роулинг", 
        notes: "Первая книга о приключениях юного волшебника в школе Хогвартс.", 
        email: "rowling@example.com", 
        liked: true, 
        status: "read",
        link: "https://www.litres.ru/dzhoan-rouling/garri-potter-i-filosofskiy-kamen/"
    },
    { 
        id: 4, 
        title: "Преступление и наказание", 
        author: "Фёдор Достоевский", 
        notes: "Психологический роман о моральном выборе и искуплении.", 
        email: "dostoevsky@example.com", 
        liked: false, 
        status: "toRead",
        link: "https://www.litres.ru/fedor-dostoevskiy/prestuplenie-i-nakazanie/"
    },
    { 
        id: 5, 
        title: "Дюна", 
        author: "Фрэнк Герберт", 
        notes: "Эпическая научно-фантастическая сага о далёком будущем человечества.", 
        email: "herbert@example.com", 
        liked: true, 
        status: "toRead",
        link: "https://www.litres.ru/frenk-gerbert/duna/"
    }
];

export function initializeBookList() {
    const container = document.querySelector('.books-container');

    // Если нет данных в localStorage — заполняем демо-данными
    if (!localStorage.getItem('books')) {
        localStorage.setItem('books', JSON.stringify(initialBooks));
    }

    // Загрузка книг при инициализации
    loadBooks();

    // Обновление списка при изменении данных
    document.addEventListener('booksUpdated', loadBooks);

    // Делегирование событий для кнопок
    container.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button) return;

        const card = button.closest('.book-card');
        if (!card) return;
        const bookId = Number(card.dataset.id);

        if (button.classList.contains('book-like')) {
            toggleLike(bookId);
        } else if (button.classList.contains('book-status')) {
            toggleStatus(bookId);
        } else if (button.classList.contains('book-details')) {
            showDetails(bookId);
        } else if (button.classList.contains('book-delete')) {
            deleteBook(bookId);
        }
    });

    // Функция загрузки и отрисовки списка
    function loadBooks() {
        const books = JSON.parse(localStorage.getItem('books') || '[]');
        container.innerHTML = books.map(book => `
            <article class="book-card ${book.liked ? 'liked' : ''}" data-id="${book.id}">
                <div class="book-content">
                    <h3>${escapeHtml(book.title)}</h3>
                    <p class="book-author">Автор: ${escapeHtml(book.author)}</p>
                    ${book.link ? `<a href="${escapeHtml(book.link)}" class="book-link" target="_blank" rel="noopener noreferrer">Читать/Купить книгу<span class="link-icon">📖</span></a>` : ''}
                </div>
                <div class="book-actions">
                    <button class="book-like" aria-pressed="${book.liked}" aria-label="Нравится">
                        ${book.liked ? '❤️' : '🤍'}
                    </button>
                    <button class="book-status" aria-label="Статус">
                        ${book.status === 'read' ? '📚' : '📖'}
                    </button>
                    <button class="book-details" aria-label="Подробности">
                        ℹ️
                    </button>
                    <button class="book-delete" aria-label="Удалить">
                        🗑️
                    </button>
                </div>
            </article>
        `).join('');

        updateStatistics();
    }

    function toggleLike(bookId) {
        const books = JSON.parse(localStorage.getItem('books') || '[]');
        const index = books.findIndex(b => b.id === bookId);
        if (index === -1) return;

        books[index].liked = !books[index].liked;
        localStorage.setItem('books', JSON.stringify(books));
        loadBooks();
    }

    function toggleStatus(bookId) {
        const books = JSON.parse(localStorage.getItem('books') || '[]');
        const index = books.findIndex(b => b.id === bookId);
        if (index === -1) return;

        books[index].status = books[index].status === 'read' ? 'toRead' : 'read';
        localStorage.setItem('books', JSON.stringify(books));
        loadBooks();
    }

    function showDetails(bookId) {
        const books = JSON.parse(localStorage.getItem('books') || '[]');
        const book = books.find(b => b.id === bookId);
        if (!book) return;

        const content = `
            <div class="book-details-modal">
                <h3>${escapeHtml(book.title)}</h3>
                <p><strong>Автор:</strong> ${escapeHtml(book.author)}</p>
                <p><strong>Email:</strong> ${escapeHtml(book.email || 'Не указан')}</p>
                ${book.link ? `<p><strong>Ссылка:</strong> <a href="${escapeHtml(book.link)}" target="_blank" rel="noopener noreferrer">Открыть 🔗</a></p>` : ''}
                <p><strong>Заметки:</strong></p>
                <p>${escapeHtml(book.notes || 'Нет заметок')}</p>
            </div>
        `;

        if (window.openModal) window.openModal(content);
    }

    function deleteBook(bookId) {
        const books = JSON.parse(localStorage.getItem('books') || '[]');
        const newBooks = books.filter(b => b.id !== bookId);
        localStorage.setItem('books', JSON.stringify(newBooks));
        loadBooks();
    }

    function updateStatistics() {
        const books = JSON.parse(localStorage.getItem('books') || '[]');
        const stats = {
            total: books.length,
            read: books.filter(b => b.status === 'read').length,
            toRead: books.filter(b => b.status === 'toRead').length,
            liked: books.filter(b => b.liked).length,
            authors: [...new Set(books.map(b => b.author))].length,
            yearGoal: books.filter(b => b.status === 'toRead' || b.status === 'read').length // Общее количество книг в списке (и прочитанные, и для чтения)
        };

        const readPercentage = (stats.read / (stats.total || 1) * 100) || 0;
        const likedPercentage = (stats.liked / (stats.total || 1) * 100) || 0;

        const authorStats = books.reduce((acc, book) => {
            acc[book.author] = (acc[book.author] || 0) + 1;
            return acc;
        }, {});
        const topAuthors = Object.entries(authorStats).sort((a, b) => b[1] - a[1]).slice(0, 5);

        const monthlyStats = books.reduce((acc, book) => {
            const month = typeof book.id === 'number' && String(book.id).length > 6 ? new Date(book.id).getMonth() : null;
            if (month !== null) acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {});

        const statsPanel = document.querySelector('.statistics-content');
        statsPanel.innerHTML = `
            <div class="statistics-grid">
                <div class="stat-card highlight">
                    <h3><span class="stat-icon">📚</span>Общая статистика</h3>
                    <p class="stat-number">${stats.total}</p>
                    <p class="stat-label">в вашей библиотеке</p>
                    <div class="stat-details">
                        <div class="stat-detail">
                            <span class="detail-label">Прочитано</span>
                            <span class="detail-value">${stats.read} (${readPercentage.toFixed(1)}%)</span>
                        </div>
                        <div class="stat-detail">
                            <span class="detail-label">Понравилось</span>
                            <span class="detail-value">${stats.liked} (${likedPercentage.toFixed(1)}%)</span>
                        </div>
                    </div>
                </div>

                <div class="stat-card">
                    <h3><span class="stat-icon">📈</span>Прогресс</h3>
                    <div class="reading-goals">
                        <div class="goal-progress">
                            <div class="progress-bar">
                                <div class="progress" style="width: ${Math.min(stats.read / stats.yearGoal * 100, 100)}%"></div>
                            </div>
                            <div class="goal-stats">
                                <span class="current">${stats.read}</span>
                                <span class="separator">/</span>
                                <span class="target">${stats.yearGoal}</span>
                                <span class="unit">прочитано из списка</span>
                            </div>
                            <p class="goal-description">Осталось прочитать: ${stats.toRead} книг</p>
                        </div>
                    </div>
                </div>

                <div class="stat-card">
                    <h3><span class="stat-icon">👑</span>Топ авторов</h3>
                    <div class="authors-grid">
                        ${topAuthors.length ? topAuthors.slice(0, 3).map(([author, count]) => `
                            <div class="author-card">
                                <span class="author-name">${escapeHtml(author)}</span>
                                <span class="author-count">${count} ${count === 1 ? 'книга' : 'книги'}</span>
                            </div>
                        `).join('') : '<div class="no-data">Пока нет данных</div>'}
                    </div>
                </div>

                <div class="stat-card">
                    <h3><span class="stat-icon">📊</span>Активность</h3>
                    <p class="stat-description">Распределение книг по статусам:</p>
                    <div class="activity-chart">
                        <div class="activity-summary">
                            <div class="activity-item">
                                <span class="activity-label">Прочитано</span>
                                <span class="activity-value">${stats.read}</span>
                            </div>
                            <div class="activity-item">
                                <span class="activity-label">В списке</span>
                                <span class="activity-value">${stats.total}</span>
                            </div>
                            <div class="activity-item">
                                <span class="activity-label">Понравилось</span>
                                <span class="activity-value">${stats.liked}</span>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Небольшая функция экранирования для предотвращения XSS при вставке данных
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}