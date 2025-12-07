// Глобальные переменные
var currentPage = 1;
var itemsPerPage = 12;
var allBooks = [];
var filteredBooks = [];
var cache = {};
var currentAbortController = null;

// Mock данные аудиокниг
const MOCK_BOOKS = [
  {
    id: 1,
    title: "Преступление и наказание",
    author: "Достоевский Ф.М.",
    genre: "fiction",
    duration: "14ч 20м",
    cover: "https://picsum.photos/seed/crime-punishment/200/300",
  },
  {
    id: 2,
    title: "Убийство в Восточном экспрессе",
    author: "Кристи А.",
    genre: "detective",
    duration: "6ч 15м",
    cover: "https://picsum.photos/seed/orient-express/200/300",
  },
  {
    id: 3,
    title: "Дюна",
    author: "Герберт Ф.",
    genre: "fantasy",
    duration: "21ч 2м",
    cover: "https://picsum.photos/seed/dune-desert/200/300",
  },
  {
    id: 4,
    title: "Стив Джобс",
    author: "Айзексон У.",
    genre: "biography",
    duration: "25ч 18м",
    cover: "https://picsum.photos/seed/steve-jobs/200/300",
  },
  {
    id: 5,
    title: "Краткая история времени",
    author: "Хокинг С.",
    genre: "science",
    duration: "4ч 30м",
    cover: "https://picsum.photos/seed/time-history/200/300",
  },
  {
    id: 6,
    title: "Война и мир",
    author: "Толстой Л.Н.",
    genre: "fiction",
    duration: "61ч 7м",
    cover: "https://picsum.photos/seed/war-peace/200/300",
  },
  {
    id: 7,
    title: "Десять негритят",
    author: "Кристи А.",
    genre: "detective",
    duration: "6ч 41м",
    cover: "https://picsum.photos/seed/ten-little/200/300",
  },
  {
    id: 8,
    title: "Властелин колец",
    author: "Толкин Д.Р.Р.",
    genre: "fantasy",
    duration: "54ч 29м",
    cover: "https://picsum.photos/seed/lord-rings/200/300",
  },
  {
    id: 9,
    title: "Эйнштейн. Его жизнь и его Вселенная",
    author: "Айзексон У.",
    genre: "biography",
    duration: "22ч 45м",
    cover: "https://picsum.photos/seed/einstein/200/300",
  },
  {
    id: 10,
    title: "Sapiens. Краткая история человечества",
    author: "Харари Ю.Н.",
    genre: "science",
    duration: "15ч 17м",
    cover: "https://picsum.photos/seed/sapiens/200/300",
  },
  {
    id: 11,
    title: "Мастер и Маргарита",
    author: "Булгаков М.А.",
    genre: "fiction",
    duration: "12ч 54м",
    cover: "https://picsum.photos/seed/master-margarita/200/300",
  },
  {
    id: 12,
    title: "Шерлок Холмс",
    author: "Дойл А.К.",
    genre: "detective",
    duration: "8ч 22м",
    cover: "https://picsum.photos/seed/sherlock/200/300",
  },
  {
    id: 13,
    title: "Игра престолов",
    author: "Мартин Д.",
    genre: "fantasy",
    duration: "33ч 53м",
    cover: "https://picsum.photos/seed/game-thrones/200/300",
  },
  {
    id: 14,
    title: "Илон Маск",
    author: "Вэнс Э.",
    genre: "biography",
    duration: "13ч 23м",
    cover: "https://picsum.photos/seed/elon-musk/200/300",
  },
  {
    id: 15,
    title: "Космос",
    author: "Тайсон Н.Д.",
    genre: "science",
    duration: "3ч 49м",
    cover: "https://picsum.photos/seed/cosmos/200/300",
  },
  {
    id: 16,
    title: "Анна Каренина",
    author: "Толстой Л.Н.",
    genre: "fiction",
    duration: "36ч 10м",
    cover: "https://picsum.photos/seed/anna-karenina/200/300",
  },
  {
    id: 17,
    title: "Восточный экспресс",
    author: "Грин Г.",
    genre: "detective",
    duration: "5ч 12м",
    cover: "https://picsum.photos/seed/stambul-train/200/300",
  },
  {
    id: 18,
    title: "Гарри Поттер и философский камень",
    author: "Роулинг Д.",
    genre: "fantasy",
    duration: "8ч 25м",
    cover: "https://picsum.photos/seed/harry-potter/200/300",
  },
  {
    id: 19,
    title: "Леонардо да Винчи",
    author: "Айзексон У.",
    genre: "biography",
    duration: "17ч 3м",
    cover: "https://picsum.photos/seed/leonardo/200/300",
  },
  {
    id: 20,
    title: "Черная дыра",
    author: "Готорн С.",
    genre: "science",
    duration: "6ч 55м",
    cover: "https://picsum.photos/seed/black-hole/200/300",
  },
];

// функция с ретраями
function fetchWithRetry(url, options) {
  var retries = options.retries || 3;
  var backoff = options.backoffMs || 1000;
  var timeout = options.timeoutMs || 5000;

  return new Promise((resolve, reject) => {
    function attempt(n) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      fetch(url, { ...options, signal: controller.signal })
        .then((response) => {
          clearTimeout(timeoutId);
          if (!response.ok) throw new Error("HTTP error");
          return response.json();
        })
        .then((data) => resolve(data))
        .catch((error) => {
          clearTimeout(timeoutId);
          if (n === 1) {
            reject(error);
          } else {
            setTimeout(() => attempt(n - 1), backoff);
          }
        });
    }
    attempt(retries);
  });
}

// функция кэша
function getCached(key) {
  if (cache[key]) {
    var now = Date.now();
    if (now - cache[key].timestamp < 60000) {
      return cache[key].data;
    }
  }
  return null;
}

function setCache(key, data) {
  cache[key] = {
    data: data,
    timestamp: Date.now(),
  };
}

// Загрузка книг
function loadBooks(ignoreCache = false) {
  if (currentAbortController) {
    currentAbortController.abort();
  }

  currentAbortController = new AbortController();

  showLoading();
  hideError();
  hideEmpty();

  var cacheKey = "books_all";
  if (!ignoreCache) {
    var cached = getCached(cacheKey);
    if (cached) {
      allBooks = cached;
      applyFilters();
      return;
    }
  }

  // Имитация API запроса
  setTimeout(() => {
    allBooks = MOCK_BOOKS;
    setCache(cacheKey, allBooks);
    applyFilters();
  }, 800);
}

function showLoading() {
  document.getElementById("loading").style.display = "block";
  document.getElementById("booksList").innerHTML = "";
}

function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

function showError(message) {
  document.getElementById("error").style.display = "block";
  document.querySelector(".error-message").textContent = message;
}

function hideError() {
  document.getElementById("error").style.display = "none";
}

function showEmpty() {
  document.getElementById("empty").style.display = "block";
}

function hideEmpty() {
  document.getElementById("empty").style.display = "none";
}

// Фильтрация
function applyFilters() {
  var searchValue = document.getElementById("searchInput").value.toLowerCase();
  var genreValue = document.getElementById("genreFilter").value;

  filteredBooks = allBooks.filter((book) => {
    var matchSearch =
      book.title.toLowerCase().includes(searchValue) ||
      book.author.toLowerCase().includes(searchValue);
    var matchGenre = !genreValue || book.genre === genreValue;
    return matchSearch && matchGenre;
  });

  currentPage = 1;
  displayBooks();
}

// Отображение книг
function displayBooks() {
  hideLoading();
  hideError();
  hideEmpty();

  if (filteredBooks.length === 0) {
    showEmpty();
    document.getElementById("booksList").innerHTML = "";
    return;
  }

  var start = (currentPage - 1) * itemsPerPage;
  var end = start + itemsPerPage;
  var booksToShow = filteredBooks.slice(start, end);

  var html = "";
  for (var i = 0; i < booksToShow.length; i++) {
    var book = booksToShow[i];
    html += `
            <div class="book-card" onclick="showBookDetails(${book.id})">
                <img src="${book.cover}" alt="${book.title}" class="book-cover">
                <div class="book-title">${book.title}</div>
                <div class="book-author">${book.author}</div>
                <div class="book-genre">${getGenreName(book.genre)}</div>
                <div class="book-duration">⏱ ${book.duration}</div>
            </div>
        `;
  }

  document.getElementById("booksList").innerHTML = html;
  updatePagination();
}

function getGenreName(genre) {
  var genres = {
    fiction: "Художественная литература",
    detective: "Детективы",
    fantasy: "Фантастика",
    biography: "Биографии",
    science: "Научпоп",
  };
  return genres[genre] || genre;
}

function updatePagination() {
  var totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  document.getElementById(
    "pageInfo"
  ).textContent = `Страница ${currentPage} из ${totalPages}`;
  document.getElementById("prevBtn").disabled = currentPage === 1;
  document.getElementById("nextBtn").disabled = currentPage >= totalPages;
}

function nextPage() {
  var totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayBooks();
    window.scrollTo(0, 0);
  }
}

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    displayBooks();
    window.scrollTo(0, 0);
  }
}

function refreshData() {
  cache = {};
  loadBooks(true);
}

function showBookDetails(bookId) {
  var book = allBooks.find((b) => b.id === bookId);
  if (book) {
    alert(
      `${book.title}\n\nАвтор: ${book.author}\nЖанр: ${getGenreName(
        book.genre
      )}\nДлительность: ${book.duration}`
    );
  }
}

// Инициализация при загрузке
window.onload = function () {
  loadBooks();

  // Обработчики событий
  document.getElementById("searchInput").addEventListener("input", function () {
    applyFilters();
  });

  document
    .getElementById("genreFilter")
    .addEventListener("change", function () {
      applyFilters();
    });
};
