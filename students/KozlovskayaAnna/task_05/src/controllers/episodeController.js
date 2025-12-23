import { episodes, incrementEpisodeId, podcasts } from '../data/seed.js';
import { ApiError } from '../middleware/errorHandler.js';

// Получить список эпизодов подкаста с поиском, фильтрацией и пагинацией
export const getAllEpisodes = (req, res) => {
  const podcastId = parseInt(req.params.podcastId);
  const { q = '', season, limit = 10, offset = 0 } = req.query;
  
  // Проверяем существование подкаста
  const podcast = podcasts.find(p => p.id === podcastId);
  if (!podcast) {
    throw ApiError.notFound('Подкаст не найден');
  }
  
  const searchQuery = q.toLowerCase();
  
  // Фильтруем эпизоды по podcastId
  let filtered = episodes.filter(ep => ep.podcastId === podcastId);
  
  // Поиск по title
  if (searchQuery) {
    filtered = filtered.filter(ep => 
      ep.title.toLowerCase().includes(searchQuery)
    );
  }
  
  // Фильтр по сезону
  if (season) {
    const seasonNum = parseInt(season);
    filtered = filtered.filter(ep => ep.season === seasonNum);
  }
  
  const total = filtered.length;
  const limitNum = parseInt(limit);
  const offsetNum = parseInt(offset);
  
  // Применяем пагинацию
  const paginated = filtered.slice(offsetNum, offsetNum + limitNum);
  
  res.json({
    data: paginated,
    meta: {
      total,
      limit: limitNum,
      offset: offsetNum
    }
  });
};

// Получить эпизод по ID
export const getEpisodeById = (req, res) => {
  const podcastId = parseInt(req.params.podcastId);
  const episodeId = parseInt(req.params.episodeId);
  
  // Проверяем существование подкаста
  const podcast = podcasts.find(p => p.id === podcastId);
  if (!podcast) {
    throw ApiError.notFound('Подкаст не найден');
  }
  
  const episode = episodes.find(ep => 
    ep.id === episodeId && ep.podcastId === podcastId
  );
  
  if (!episode) {
    throw ApiError.notFound('Эпизод не найден');
  }
  
  res.json(episode);
};

// Создать новый эпизод
export const createEpisode = (req, res) => {
  const podcastId = parseInt(req.params.podcastId);
  
  // Проверяем существование подкаста
  const podcast = podcasts.find(p => p.id === podcastId);
  if (!podcast) {
    throw ApiError.notFound('Подкаст не найден');
  }
  
  const newEpisode = {
    id: incrementEpisodeId(),
    podcastId,
    ...req.body,
    publishedAt: new Date().toISOString()
  };
  
  episodes.push(newEpisode);
  
  res.status(201).json(newEpisode);
};

// Обновить эпизод
export const updateEpisode = (req, res) => {
  const podcastId = parseInt(req.params.podcastId);
  const episodeId = parseInt(req.params.episodeId);
  
  // Проверяем существование подкаста
  const podcast = podcasts.find(p => p.id === podcastId);
  if (!podcast) {
    throw ApiError.notFound('Подкаст не найден');
  }
  
  const index = episodes.findIndex(ep => 
    ep.id === episodeId && ep.podcastId === podcastId
  );
  
  if (index === -1) {
    throw ApiError.notFound('Эпизод не найден');
  }
  
  // Обновляем только переданные поля
  episodes[index] = {
    ...episodes[index],
    ...req.body
  };
  
  res.json(episodes[index]);
};

// Удалить эпизод
export const deleteEpisode = (req, res) => {
  const podcastId = parseInt(req.params.podcastId);
  const episodeId = parseInt(req.params.episodeId);
  
  // Проверяем существование подкаста
  const podcast = podcasts.find(p => p.id === podcastId);
  if (!podcast) {
    throw ApiError.notFound('Подкаст не найден');
  }
  
  const index = episodes.findIndex(ep => 
    ep.id === episodeId && ep.podcastId === podcastId
  );
  
  if (index === -1) {
    throw ApiError.notFound('Эпизод не найден');
  }
  
  episodes.splice(index, 1);
  
  res.status(204).send();
};
