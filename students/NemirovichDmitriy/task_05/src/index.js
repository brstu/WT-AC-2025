const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const port = 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Хранение данных в памяти
let podcasts = [
  { id: 1, title: 'Технологии будущего', author: 'Иван Петров', category: 'технологии', description: 'Подкаст о новых технологиях' },
  { id: 2, title: 'Музыка и жизнь', author: 'Мария Сидорова', category: 'музыка', description: 'О музыке и музыкантах' }
];

let episodes = [
  { id: 1, podcastId: 1, title: 'Искусственный интеллект', duration: 45, releaseDate: '2024-01-15' },
  { id: 2, podcastId: 1, title: 'Квантовые компьютеры', duration: 50, releaseDate: '2024-01-22' },
  { id: 3, podcastId: 2, title: 'Джаз 20 века', duration: 60, releaseDate: '2024-01-10' }
];

let playlists = [
  { id: 1, name: 'Любимые', description: 'Мой плейлист', episodeIds: [1, 3] }
];

let counter = { podcasts: 3, episodes: 4, playlists: 2 };

// Swagger конфигурация
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API подкастов',
      version: '1.0.0',
      description: 'REST API для управления подкастами'
    },
    servers: [{ url: 'http://localhost:3000' }]
  },
  apis: ['./index.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /podcasts:
 *   get:
 *     summary: Получить список подкастов
 *     responses:
 *       200:
 *         description: Список подкастов
 */
app.get('/podcasts', (req, res) => {
  let result = podcasts;
  
  if (req.query.q) {
    result = result.filter(p => p.title.includes(req.query.q));
  }
  
  res.json(result);
});

/**
 * @swagger
 * /podcasts/{id}:
 *   get:
 *     summary: Получить подкаст по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Подкаст найден
 *       404:
 *         description: Подкаст не найден
 */
app.get('/podcasts/:id', (req, res) => {
  const podcast = podcasts.find(p => p.id == req.params.id);
  if (podcast) {
    res.json(podcast);
  } else {
    res.status(404).send('Not found');
  }
});

/**
 * @swagger
 * /podcasts:
 *   post:
 *     summary: Создать новый подкаст
 *     responses:
 *       201:
 *         description: Подкаст создан
 */
app.post('/podcasts', (req, res) => {
  const data = req.body;
  const newPodcast = {
    id: counter.podcasts++,
    title: data.title,
    author: data.author,
    category: data.category,
    description: data.description
  };
  podcasts.push(newPodcast);
  res.status(201).json(newPodcast);
});

/**
 * @swagger
 * /podcasts/{id}:
 *   patch:
 *     summary: Обновить подкаст
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Подкаст обновлен
 */
app.patch('/podcasts/:id', (req, res) => {
  const podcast = podcasts.find(p => p.id == req.params.id);
  if (!podcast) {
    return res.status(404).send('Not found');
  }
  
  Object.assign(podcast, req.body);
  res.json(podcast);
});

/**
 * @swagger
 * /podcasts/{id}:
 *   delete:
 *     summary: Удалить подкаст
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Подкаст удален
 */
app.delete('/podcasts/:id', (req, res) => {
  const index = podcasts.findIndex(p => p.id == req.params.id);
  if (index !== -1) {
    podcasts.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).send('Not found');
  }
});

// Эпизоды
app.get('/episodes', (req, res) => {
  let result = episodes;
  if (req.query.podcastId) {
    result = result.filter(e => e.podcastId == req.query.podcastId);
  }
  res.json(result);
});

app.get('/episodes/:id', (req, res) => {
  const episode = episodes.find(e => e.id == req.params.id);
  if (episode) {
    res.json(episode);
  } else {
    res.status(404).send('Not found');
  }
});

app.post('/episodes', (req, res) => {
  const data = req.body;
  const newEpisode = {
    id: counter.episodes++,
    podcastId: data.podcastId,
    title: data.title,
    duration: data.duration,
    releaseDate: data.releaseDate
  };
  episodes.push(newEpisode);
  res.status(201).json(newEpisode);
});

app.patch('/episodes/:id', (req, res) => {
  const episode = episodes.find(e => e.id == req.params.id);
  if (!episode) {
    return res.status(404).send('Not found');
  }
  Object.assign(episode, req.body);
  res.json(episode);
});

app.delete('/episodes/:id', (req, res) => {
  const index = episodes.findIndex(e => e.id == req.params.id);
  if (index !== -1) {
    episodes.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).send('Not found');
  }
});

// Плейлисты
app.get('/playlists', (req, res) => {
  res.json(playlists);
});

app.get('/playlists/:id', (req, res) => {
  const playlist = playlists.find(p => p.id == req.params.id);
  if (playlist) {
    res.json(playlist);
  } else {
    res.status(404).send('Not found');
  }
});

app.post('/playlists', (req, res) => {
  const data = req.body;
  const newPlaylist = {
    id: counter.playlists++,
    name: data.name,
    description: data.description,
    episodeIds: data.episodeIds || []
  };
  playlists.push(newPlaylist);
  res.status(201).json(newPlaylist);
});

app.patch('/playlists/:id', (req, res) => {
  const playlist = playlists.find(p => p.id == req.params.id);
  if (!playlist) {
    return res.status(404).send('Not found');
  }
  Object.assign(playlist, req.body);
  res.json(playlist);
});

app.delete('/playlists/:id', (req, res) => {
  const index = playlists.findIndex(p => p.id == req.params.id);
  if (index !== -1) {
    playlists.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
  console.log(`Swagger документация доступна на http://localhost:${port}/docs`);
});
