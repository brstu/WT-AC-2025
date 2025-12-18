const express = require('express');
const router = express.Router();
const storage = require('../data/storage');
const { NotFoundError } = require('../middleware/errors');
const { validateBody, validateQuery } = require('../middleware/validate');
const {
  createTournamentSchema,
  updateTournamentSchema,
  getTournamentsQuerySchema
} = require('../validators/tournamentValidator');

/**
 * @swagger
 * components:
 *   schemas:
 *     Tournament:
 *       type: object
 *       required:
 *         - name
 *         - game
 *         - startDate
 *         - endDate
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор турнира
 *           example: t1705312800000
 *         name:
 *           type: string
 *           description: Название турнира (1-100 символов)
 *           example: ESL Pro League Season 20
 *         game:
 *           type: string
 *           description: Название игры (1-50 символов)
 *           example: CS2
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Дата начала турнира в формате ISO 8601
 *           example: '2025-02-01T10:00:00Z'
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Дата окончания турнира в формате ISO 8601
 *           example: '2025-02-15T22:00:00Z'
 *         prizePool:
 *           type: number
 *           minimum: 0
 *           description: Призовой фонд в долларах США
 *           example: 850000
 *         maxTeams:
 *           type: integer
 *           minimum: 2
 *           maximum: 128
 *           description: Максимальное количество команд
 *           example: 24
 *         status:
 *           type: string
 *           enum: [upcoming, ongoing, completed, cancelled]
 *           description: Статус турнира
 *           example: upcoming
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: Описание турнира
 *           example: Международный турнир высшего уровня
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата создания записи
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Дата последнего обновления
 *     
 *     CreateTournament:
 *       type: object
 *       required:
 *         - name
 *         - game
 *         - startDate
 *         - endDate
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: ESL Pro League Season 20
 *         game:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           example: CS2
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: '2025-02-01T10:00:00Z'
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: '2025-02-15T22:00:00Z'
 *         prizePool:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           example: 850000
 *         maxTeams:
 *           type: integer
 *           minimum: 2
 *           maximum: 128
 *           default: 16
 *           example: 24
 *         status:
 *           type: string
 *           enum: [upcoming, ongoing, completed, cancelled]
 *           default: upcoming
 *         description:
 *           type: string
 *           maxLength: 1000
 *           example: Международный турнир высшего уровня
 *     
 *     UpdateTournament:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         game:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         prizePool:
 *           type: number
 *           minimum: 0
 *         maxTeams:
 *           type: integer
 *           minimum: 2
 *           maximum: 128
 *         status:
 *           type: string
 *           enum: [upcoming, ongoing, completed, cancelled]
 *         description:
 *           type: string
 *           maxLength: 1000
 *     
 *     PaginatedTournaments:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tournament'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: Общее количество турниров
 *             limit:
 *               type: integer
 *               description: Количество элементов на странице
 *             offset:
 *               type: integer
 *               description: Смещение от начала
 *             hasMore:
 *               type: boolean
 *               description: Есть ли еще элементы
 *     
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [fail, error]
 *         message:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 */

/**
 * @swagger
 * /api/v1/tournaments:
 *   get:
 *     summary: Получить список турниров
 *     description: Возвращает список турниров с поддержкой поиска, фильтрации, сортировки и пагинации
 *     tags: [Tournaments]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Поисковый запрос по названию и описанию
 *       - in: query
 *         name: game
 *         schema:
 *           type: string
 *         description: Фильтр по игре
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, ongoing, completed, cancelled]
 *         description: Фильтр по статусу
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Количество элементов на странице
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Смещение от начала списка
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, startDate, endDate, prizePool, createdAt]
 *           default: createdAt
 *         description: Поле для сортировки
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Порядок сортировки
 *     responses:
 *       200:
 *         description: Список турниров
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedTournaments'
 *       422:
 *         description: Ошибка валидации параметров
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', validateQuery(getTournamentsQuerySchema), (req, res) => {
  let tournaments = storage.getTournaments();
  const { q, game, status, limit, offset, sortBy, order } = req.query;

  // Фильтрация по поисковому запросу
  if (q) {
    const searchLower = q.toLowerCase();
    tournaments = tournaments.filter(t => 
      t.name.toLowerCase().includes(searchLower) ||
      (t.description && t.description.toLowerCase().includes(searchLower))
    );
  }

  // Фильтрация по игре
  if (game) {
    tournaments = tournaments.filter(t => 
      t.game.toLowerCase() === game.toLowerCase()
    );
  }

  // Фильтрация по статусу
  if (status) {
    tournaments = tournaments.filter(t => t.status === status);
  }

  // Сортировка
  tournaments.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    // Обработка дат
    if (sortBy.includes('Date') || sortBy === 'createdAt') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    // Обработка строк
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (order === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    }
    return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
  });

  // Пагинация
  const total = tournaments.length;
  const paginatedTournaments = tournaments.slice(offset, offset + limit);

  res.status(200).json({
    data: paginatedTournaments,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    }
  });
});

/**
 * @swagger
 * /api/v1/tournaments/{id}:
 *   get:
 *     summary: Получить турнир по ID
 *     description: Возвращает информацию о конкретном турнире
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID турнира
 *     responses:
 *       200:
 *         description: Информация о турнире
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 *       404:
 *         description: Турнир не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', (req, res, next) => {
  const tournament = storage.getTournamentById(req.params.id);
  
  if (!tournament) {
    return next(new NotFoundError(`Турнир с ID ${req.params.id} не найден`));
  }
  
  res.status(200).json(tournament);
});

/**
 * @swagger
 * /api/v1/tournaments:
 *   post:
 *     summary: Создать новый турнир
 *     description: Создает новый турнир с указанными данными
 *     tags: [Tournaments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTournament'
 *     responses:
 *       201:
 *         description: Турнир успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 *       422:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validateBody(createTournamentSchema), (req, res) => {
  const tournament = storage.createTournament(req.body);
  res.status(201).json(tournament);
});

/**
 * @swagger
 * /api/v1/tournaments/{id}:
 *   put:
 *     summary: Полностью обновить турнир
 *     description: Полностью заменяет данные турнира
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID турнира
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTournament'
 *     responses:
 *       200:
 *         description: Турнир успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 *       404:
 *         description: Турнир не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', validateBody(createTournamentSchema), (req, res, next) => {
  const tournament = storage.updateTournament(req.params.id, req.body);
  
  if (!tournament) {
    return next(new NotFoundError(`Турнир с ID ${req.params.id} не найден`));
  }
  
  res.status(200).json(tournament);
});

/**
 * @swagger
 * /api/v1/tournaments/{id}:
 *   patch:
 *     summary: Частично обновить турнир
 *     description: Обновляет только указанные поля турнира
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID турнира
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTournament'
 *     responses:
 *       200:
 *         description: Турнир успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 *       404:
 *         description: Турнир не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id', validateBody(updateTournamentSchema), (req, res, next) => {
  const tournament = storage.updateTournament(req.params.id, req.body);
  
  if (!tournament) {
    return next(new NotFoundError(`Турнир с ID ${req.params.id} не найден`));
  }
  
  res.status(200).json(tournament);
});

/**
 * @swagger
 * /api/v1/tournaments/{id}:
 *   delete:
 *     summary: Удалить турнир
 *     description: Удаляет турнир по ID
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID турнира
 *     responses:
 *       204:
 *         description: Турнир успешно удален
 *       404:
 *         description: Турнир не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', (req, res, next) => {
  const deleted = storage.deleteTournament(req.params.id);
  
  if (!deleted) {
    return next(new NotFoundError(`Турнир с ID ${req.params.id} не найден`));
  }
  
  res.status(204).send();
});

module.exports = router;
