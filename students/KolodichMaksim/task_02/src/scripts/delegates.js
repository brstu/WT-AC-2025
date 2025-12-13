export function initBooks() {
  const grid = document.getElementById('books-grid');
  const search = document.querySelector('.search-input');
  let books = [];
  let likes = JSON.parse(localStorage.getItem('bookLikes') || '{}');

  fetch('assets/books.json')
    .then(r => r.json())
    .then(data => {
      books = data;
      renderBooks(books);
    });

  function renderBooks(list) {
    grid.innerHTML = list.map(book => `
      <article class="book-card" data-id="${book.id}">
        <h3>${book.title}</h3>
        <p>${book.author}</p>
        <button class="book-card__more" aria-label="Подробнее о книге «${book.title}»">Подробнее</button>
        <button class="like-btn" aria-label="Лайкнуть книгу">
          <span class="like-count">${likes[book.id] || 0}</span> ❤️
        </button>
      </article>
    `).join('');
  }

  // Делегирование на весь контейнер
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.book-card');
    if (!card) return;

    const id = card.dataset.id;
    const book = books.find(b => b.id === id);

    if (e.target.classList.contains('book-card__more')) {
      openModal(book);
    }

    if (e.target.closest('.like-btn')) {
      likes[id] = (likes[id] || 0) + 1;
      localStorage.setItem('bookLikes', JSON.stringify(likes));
      e.target.closest('.like-btn').querySelector('.like-count').textContent = likes[id];
    }
  });

  search.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = books.filter(b =>
      b.title.toLowerCase().includes(term) ||
      b.author.toLowerCase().includes(term)
    );
    renderBooks(filtered);
  });

  function openModal(book) {
    document.getElementById('modal-title').textContent = book.title;
    document.getElementById('modal-author').textContent = book.author;
    document.getElementById('modal-desc').textContent = book.description;
    document.querySelector('.modal__like .like-count').textContent = likes[book.id] || 0;
    document.getElementById('book-modal').removeAttribute('hidden');
    document.querySelector('.modal__content button').focus();
  }
}