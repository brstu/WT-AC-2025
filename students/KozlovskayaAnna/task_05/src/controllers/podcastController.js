import { podcasts, incrementPodcastId, episodes } from '../data/seed.js';
import { ApiError } from '../middleware/errorHandler.js';

// Получить список подкастов с поиском и пагинацией
export const getAllPodcasts = (req, res) => {
  const { q = '', limit = 10, offset = 0 } = req.query;
  
  const searchQuery = q.toLowerCase();
  
  // Фильтруем по поисковому запросу (title или author)
  let filtered = podcasts.filter(podcast => 
    podcast.title.toLowerCase().includes(searchQuery) ||
    podcast.author.toLowerCase().includes(searchQuery)
  );
  
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

// Получить подкаст по ID
export const getPodcastById = (req, res) => {
  const id = parseInt(req.params.id);
  const podcast = podcasts.find(p => p.id === id);
  
  if (!podcast) {
    throw ApiError.notFound('Подкаст не найден');
  }
  
  res.json(podcast);
};

// Создать новый подкаст
export const createPodcast = (req, res) => {
  const newPodcast = {
    id: incrementPodcastId(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  podcasts.push(newPodcast);
  
  res.status(201).json(newPodcast);
};

// Обновить подкаст
export const updatePodcast = (req, res) => {
  const id = parseInt(req.params.id);
  const index = podcasts.findIndex(p => p.id === id);
  
  if (index === -1) {
    throw ApiError.notFound('Подкаст не найден');
  }
  
  // Обновляем только переданные поля
  podcasts[index] = {
    ...podcasts[index],
    ...req.body
  };
  
  res.json(podcasts[index]);
};

// Удалить подкаст и все его эпизоды
export const deletePodcast = (req, res) => {
  const id = parseInt(req.params.id);
  const index = podcasts.findIndex(p => p.id === id);
  
  if (index === -1) {
    throw ApiError.notFound('Подкаст не найден');
  }
  
  // Удаляем подкаст
  podcasts.splice(index, 1);
  
  // Удаляем все эпизоды этого подкаста
  const deletedEpisodesCount = episodes.length;
  for (let i = episodes.length - 1; i >= 0; i--) {
    if (episodes[i].podcastId === id) {
      episodes.splice(i, 1);
    }
  }
  
  res.status(204).send();
};
