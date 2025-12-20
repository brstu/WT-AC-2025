const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/AppError');

class MediaService {
  constructor() {
    this.media = this.getInitialData();
    this.nextId = this.media.length + 1;
  }

  getInitialData() {
    return [
      {
        id: uuidv4(),
        title: "Матрица",
        description: "Фильм о виртуальной реальности",
        year: 1999,
        genre: ["фантастика", "боевик"],
        type: "movie",
        rating: 8.7,
        duration: 136,
        seasons: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "Игра престолов",
        description: "Сериал о борьбе за власть в вымышленном мире",
        year: 2011,
        genre: ["фэнтези", "драма", "приключения"],
        type: "series",
        rating: 9.2,
        duration: null,
        seasons: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "Интерстеллар",
        description: "Фильм о космических путешествиях и любви",
        year: 2014,
        genre: ["фантастика", "драма"],
        type: "movie",
        rating: 8.6,
        duration: 169,
        seasons: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: "Во все тяжкие",
        description: "Сериал о химике, который становится наркобароном",
        year: 2008,
        genre: ["драма", "криминал", "триллер"],
        type: "series",
        rating: 9.5,
        duration: null,
        seasons: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  getAll(filters = {}) {
    let filtered = [...this.media];
    
    // Поиск по названию (q)
    if (filters.q) {
      const searchTerm = filters.q.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        (item.description && item.description.toLowerCase().includes(searchTerm))
      );
    }
    
    // Фильтр по жанру
    if (filters.genre) {
      const genreFilter = filters.genre.toLowerCase();
      filtered = filtered.filter(item => 
        item.genre.some(genre => genre.toLowerCase() === genreFilter)
      );
    }
    
    // Фильтр по типу
    if (filters.type) {
      filtered = filtered.filter(item => item.type === filters.type);
    }
    
    // Сортировка по рейтингу (по умолчанию)
    filtered.sort((a, b) => b.rating - a.rating);
    
    // Пагинация
    const total = filtered.length;
    const offset = parseInt(filters.offset) || 0;
    const limit = parseInt(filters.limit) || 10;
    
    const paginated = filtered.slice(offset, offset + limit);
    
    return {
      data: paginated,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  getById(id) {
    const media = this.media.find(item => item.id === id);
    
    if (!media) {
      throw new AppError(`Media with id ${id} not found`, 404);
    }
    
    return media;
  }

  create(data) {
    const newMedia = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Убедимся, что поля соответствуют типу
    if (newMedia.type === 'movie') {
      newMedia.seasons = null;
    } else if (newMedia.type === 'series') {
      newMedia.duration = null;
    }
    
    this.media.push(newMedia);
    return newMedia;
  }

  update(id, data) {
    const index = this.media.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new AppError(`Media with id ${id} not found`, 404);
    }
    
    const updatedMedia = {
      ...this.media[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // Проверка консистентности типа
    if (updatedMedia.type === 'movie') {
      updatedMedia.seasons = null;
    } else if (updatedMedia.type === 'series') {
      updatedMedia.duration = null;
    }
    
    this.media[index] = updatedMedia;
    return updatedMedia;
  }

  delete(id) {
    const index = this.media.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new AppError(`Media with id ${id} not found`, 404);
    }
    
    const deletedMedia = this.media[index];
    this.media.splice(index, 1);
    
    return deletedMedia;
  }

  // Вспомогательные методы
  getGenres() {
    const genres = new Set();
    this.media.forEach(item => {
      item.genre.forEach(genre => genres.add(genre));
    });
    return Array.from(genres);
  }

  getStats() {
    const stats = {
      total: this.media.length,
      movies: this.media.filter(item => item.type === 'movie').length,
      series: this.media.filter(item => item.type === 'series').length,
      averageRating: 0,
      byGenre: {}
    };
    
    // Средний рейтинг
    if (this.media.length > 0) {
      const totalRating = this.media.reduce((sum, item) => sum + item.rating, 0);
      stats.averageRating = totalRating / this.media.length;
    }
    
    // По жанрам
    this.media.forEach(item => {
      item.genre.forEach(genre => {
        if (!stats.byGenre[genre]) {
          stats.byGenre[genre] = 0;
        }
        stats.byGenre[genre]++;
      });
    });
    
    return stats;
  }
}

module.exports = new MediaService();