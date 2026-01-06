const STORAGE_KEY = 'movies';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    throw new Error('Ошибка чтения хранилища');
  }
}

function save(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    throw new Error('Ошибка сохранения');
  }
}

const api = {
  async getList() {
    await new Promise(r => setTimeout(r, 500)); // Имитация задержки сети
    return load();
  },

  async getItem(id) {
    await new Promise(r => setTimeout(r, 500));
    const item = load().find(x => x.id === id);
    if (!item) throw new Error('Фильм не найден');
    return item;
  },

  async create(data) {
    await new Promise(r => setTimeout(r, 500));
    const list = load();
    const item = { 
      id: String(Date.now()), 
      createdAt: new Date().toISOString(),
      ...data 
    };
    list.push(item);
    save(list);
    return item;
  },

  async update(id, data) {
    await new Promise(r => setTimeout(r, 500));
    const list = load();
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Фильм не найден');
    list[idx] = { ...list[idx], ...data };
    save(list);
    return list[idx];
  },

  async remove(id) {
    await new Promise(r => setTimeout(r, 500));
    const list = load().filter(x => x.id !== id);
    save(list);
  },

  async search(query) {
    await new Promise(r => setTimeout(r, 300));
    const list = load();
    if (!query) return list;
    
    const searchLower = query.toLowerCase();
    return list.filter(movie =>
      movie.title?.toLowerCase().includes(searchLower) ||
      movie.director?.toLowerCase().includes(searchLower) ||
      movie.genre?.toLowerCase().includes(searchLower)
    );
  }
};

// Инициализация начальных данных
function initializeStorage() {
  const currentData = load();
  if (currentData.length === 0) {
    const initialMovies = [
      {
        id: '1',
        title: 'Начало',
        director: 'Кристофер Нолан',
        year: 2010,
        genre: 'Фантастика, Триллер',
        rating: 8.8,
        duration: '2ч 28мин',
        description: 'Специалист по кражам, проникающий в сны людей, получает задание внедрить идею в подсознание человека.',
        country: 'США, Великобритания',
        language: 'Английский',
        budget: '$160 млн',
        boxOffice: '$836.8 млн',
        createdAt: '2024-01-01T10:00:00Z'
      },
      {
        id: '2',
        title: 'Криминальное чтиво',
        director: 'Квентин Тарантино',
        year: 1994,
        genre: 'Криминал, Драма',
        rating: 8.9,
        duration: '2ч 34мин',
        description: 'Истории двух киллеров, боксера и гангстера переплетаются в Лос-Анджелесе.',
        country: 'США',
        language: 'Английский',
        budget: '$8.5 млн',
        boxOffice: '$213.9 млн',
        createdAt: '2024-01-02T10:00:00Z'
      },
      {
        id: '3',
        title: 'Побег из Шоушенка',
        director: 'Фрэнк Дарабонт',
        year: 1994,
        genre: 'Драма',
        rating: 9.3,
        duration: '2ч 22мин',
        description: 'Два заключенных заводят дружбу на протяжении нескольких лет, находя утешение и eventual искупление через добрые дела.',
        country: 'США',
        language: 'Английский',
        budget: '$25 млн',
        boxOffice: '$58.5 млн',
        createdAt: '2024-01-03T10:00:00Z'
      }
    ];
    save(initialMovies);
  }
}

// Инициализируем хранилище при загрузке
initializeStorage();

const movieApi = api;