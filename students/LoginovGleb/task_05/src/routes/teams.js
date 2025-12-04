const express = require('express');
const router = express.Router();
const storage = require('../data/storage');
const { NotFoundError } = require('../middleware/errors');
const { validateBody, validateQuery } = require('../middleware/validate');
const {
  createTeamSchema,
  updateTeamSchema,
  getTeamsQuerySchema
} = require('../validators/teamValidator');

/**
 * @swagger
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       required:
 *         - name
 *         - tag
 *         - country
 *         - game
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор команды
 *           example: tm1705312800000
 *         name:
 *           type: string
 *           description: Название команды (1-100 символов)
 *           example: Natus Vincere
 *         tag:
 *           type: string
 *           description: Тег команды (2-10 символов, только буквы и цифры)
 *           example: NAVI
 *         country:
 *           type: string
 *           description: Страна команды
 *           example: Ukraine
 *         game:
 *           type: string
 *           description: Основная игра команды
 *           example: CS2
 *         foundedDate:
 *           type: string
 *           format: date
 *           description: Дата основания команды
 *           example: '2009-12-17'
 *         logoUrl:
 *           type: string
 *           format: uri
 *           description: URL логотипа команды
 *           example: https://example.com/navi-logo.png
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 10000
 *           description: Рейтинг команды
 *           example: 2850
 *         isActive:
 *           type: boolean
 *           description: Активна ли команда
 *           example: true
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: Описание команды
 *           example: Легендарная украинская киберспортивная организация
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата создания записи
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Дата последнего обновления
 *     
 *     CreateTeam:
 *       type: object
 *       required:
 *         - name
 *         - tag
 *         - country
 *         - game
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: Natus Vincere
 *         tag:
 *           type: string
 *           minLength: 2
 *           maxLength: 10
 *           pattern: '^[A-Za-z0-9]+$'
 *           example: NAVI
 *         country:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Ukraine
 *         game:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           example: CS2
 *         foundedDate:
 *           type: string
 *           format: date
 *           example: '2009-12-17'
 *         logoUrl:
 *           type: string
 *           format: uri
 *           example: https://example.com/navi-logo.png
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 10000
 *           default: 1000
 *           example: 2850
 *         isActive:
 *           type: boolean
 *           default: true
 *           example: true
 *         description:
 *           type: string
 *           maxLength: 1000
 *           example: Легендарная киберспортивная организация
 *     
 *     UpdateTeam:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         tag:
 *           type: string
 *           minLength: 2
 *           maxLength: 10
 *           pattern: '^[A-Za-z0-9]+$'
 *         country:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         game:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *         foundedDate:
 *           type: string
 *           format: date
 *         logoUrl:
 *           type: string
 *           format: uri
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 10000
 *         isActive:
 *           type: boolean
 *         description:
 *           type: string
 *           maxLength: 1000
 *     
 *     PaginatedTeams:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Team'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: Общее количество команд
 *             limit:
 *               type: integer
 *               description: Количество элементов на странице
 *             offset:
 *               type: integer
 *               description: Смещение от начала
 *             hasMore:
 *               type: boolean
 *               description: Есть ли еще элементы
 */

/**
 * @swagger
 * /api/v1/teams:
 *   get:
 *     summary: Получить список команд
 *     description: Возвращает список команд с поддержкой поиска, фильтрации, сортировки и пагинации
 *     tags: [Teams]
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
 *         name: country
 *         schema:
 *           type: string
 *         description: Фильтр по стране
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Фильтр по активности команды
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
 *           enum: [name, rating, foundedDate, createdAt]
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
 *         description: Список команд
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedTeams'
 *       422:
 *         description: Ошибка валидации параметров
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', validateQuery(getTeamsQuerySchema), (req, res) => {
  let teams = storage.getTeams();
  const { q, game, country, isActive, limit, offset, sortBy, order } = req.query;

  // Фильтрация по поисковому запросу
  if (q) {
    const searchLower = q.toLowerCase();
    teams = teams.filter(t => 
      t.name.toLowerCase().includes(searchLower) ||
      t.tag.toLowerCase().includes(searchLower) ||
      (t.description && t.description.toLowerCase().includes(searchLower))
    );
  }

  // Фильтрация по игре
  if (game) {
    teams = teams.filter(t => 
      t.game.toLowerCase() === game.toLowerCase()
    );
  }

  // Фильтрация по стране
  if (country) {
    teams = teams.filter(t => 
      t.country.toLowerCase() === country.toLowerCase()
    );
  }

  // Фильтрация по активности
  if (typeof isActive !== 'undefined') {
    teams = teams.filter(t => t.isActive === isActive);
  }

  // Сортировка
  teams.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    // Обработка дат
    if (sortBy === 'foundedDate' || sortBy === 'createdAt') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
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
  const total = teams.length;
  const paginatedTeams = teams.slice(offset, offset + limit);

  res.status(200).json({
    data: paginatedTeams,
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
 * /api/v1/teams/{id}:
 *   get:
 *     summary: Получить команду по ID
 *     description: Возвращает информацию о конкретной команде
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID команды
 *     responses:
 *       200:
 *         description: Информация о команде
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       404:
 *         description: Команда не найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', (req, res, next) => {
  const team = storage.getTeamById(req.params.id);
  
  if (!team) {
    return next(new NotFoundError(`Команда с ID ${req.params.id} не найдена`));
  }
  
  res.status(200).json(team);
});

/**
 * @swagger
 * /api/v1/teams:
 *   post:
 *     summary: Создать новую команду
 *     description: Создает новую команду с указанными данными
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTeam'
 *     responses:
 *       201:
 *         description: Команда успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       422:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validateBody(createTeamSchema), (req, res) => {
  const team = storage.createTeam(req.body);
  res.status(201).json(team);
});

/**
 * @swagger
 * /api/v1/teams/{id}:
 *   put:
 *     summary: Полностью обновить команду
 *     description: Полностью заменяет данные команды
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID команды
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTeam'
 *     responses:
 *       200:
 *         description: Команда успешно обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       404:
 *         description: Команда не найдена
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
router.put('/:id', validateBody(createTeamSchema), (req, res, next) => {
  const team = storage.updateTeam(req.params.id, req.body);
  
  if (!team) {
    return next(new NotFoundError(`Команда с ID ${req.params.id} не найдена`));
  }
  
  res.status(200).json(team);
});

/**
 * @swagger
 * /api/v1/teams/{id}:
 *   patch:
 *     summary: Частично обновить команду
 *     description: Обновляет только указанные поля команды
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID команды
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTeam'
 *     responses:
 *       200:
 *         description: Команда успешно обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       404:
 *         description: Команда не найдена
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
router.patch('/:id', validateBody(updateTeamSchema), (req, res, next) => {
  const team = storage.updateTeam(req.params.id, req.body);
  
  if (!team) {
    return next(new NotFoundError(`Команда с ID ${req.params.id} не найдена`));
  }
  
  res.status(200).json(team);
});

/**
 * @swagger
 * /api/v1/teams/{id}:
 *   delete:
 *     summary: Удалить команду
 *     description: Удаляет команду по ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID команды
 *     responses:
 *       204:
 *         description: Команда успешно удалена
 *       404:
 *         description: Команда не найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', (req, res, next) => {
  const deleted = storage.deleteTeam(req.params.id);
  
  if (!deleted) {
    return next(new NotFoundError(`Команда с ID ${req.params.id} не найдена`));
  }
  
  res.status(204).send();
});

module.exports = router;
