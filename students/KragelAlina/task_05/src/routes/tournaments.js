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
 *     Gallery:
 *       type: object
 *       required:
 *         - name
 *         - artType
 *         - startDate
 *         - endDate
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор галереи
 *           example: g1705312800000
 *         name:
 *           type: string
 *           description: Название галереи (1-100 символов)
 *           example: Modern Art Exhibition 2025
 *         artType:
 *           type: string
 *           description: Тип искусства (1-50 символов)
 *           example: Painting
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Дата начала выставки в формате ISO 8601
 *           example: '2025-02-01T10:00:00Z'
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Дата окончания выставки в формате ISO 8601
 *           example: '2025-02-15T22:00:00Z'
 *         likes:
 *           type: integer
 *           minimum: 0
 *           description: Количество лайков галереи
 *           example: 850000
 *         maxArts:
 *           type: integer
 *           minimum: 2
 *           maximum: 128
 *           description: Максимальное количество артов в галерее
 *           example: 24
 *         category:
 *           type: string
 *           enum: [modern, abstract, digital, classical]
 *           description: Категория галереи
 *           example: modern
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: Описание галереи
 *           example: Международная выставка современного искусства высшего уровня
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата создания записи
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Дата последнего обновления
 *     
 *     CreateGallery:
 *       type: object
 *       required:
 *         - name
 *         - artType
 *         - startDate
 *         - endDate
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: Modern Art Exhibition 2025
 *         artType:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           example: Painting
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: '2025-02-01T10:00:00Z'
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: '2025-02-15T22:00:00Z'
 *         likes:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           example: 850000
 *         maxArts:
 *           type: integer
 *           minimum: 2
 *           maximum: 128
 *           default: 16
 *           example: 24
 *         category:
 *           type: string
 *           enum: [modern, abstract, digital, classical]
 *           default: modern
 *         description:
 *           type: string
 *           maxLength: 1000
 *           example: Международная выставка современного искусства высшего уровня
 *     
 *     UpdateGallery:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         artType:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         likes:
 *           type: integer
 *           minimum: 0
 *         maxArts:
 *           type: integer
 *           minimum: 2
 *           maximum: 128
 *         category:
 *           type: string
 *           enum: [modern, abstract, digital, classical]
 *         description:
 *           type: string
 *           maxLength: 1000
 *     
 *     PaginatedGalleries:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Gallery'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: Общее количество галерей
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
 * /api/v1/tournaments:
 *   get:
 *     summary: Получить список галерей
 *     description: Возвращает список галерей с поддержкой поиска, фильтрации, сортировки и пагинации
 *     tags: [Galleries]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Поисковый запрос по названию и описанию
 *       - in: query
 *         name: artType
 *         schema:
 *           type: string
 *         description: Фильтр по типу искусства
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [modern, abstract, digital, classical]
 *         description: Фильтр по категории
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
 *           enum: [name, startDate, endDate, likes, createdAt]
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
 *         description: Список галерей
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedGalleries'
 *       422:
 *         description: Ошибка валидации параметров
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', validateQuery(getTournamentsQuerySchema), (req, res) => {
  let galleries = storage.getGalleries();
  const { q, artType, category, limit, offset, sortBy, order } = req.query;

  if (q) {
    const searchLower = q.toLowerCase();
    galleries = galleries.filter(g => 
      g.name.toLowerCase().includes(searchLower) ||
      (g.description && g.description.toLowerCase().includes(searchLower))
    );
  }

  if (artType) {
    galleries = galleries.filter(g => g.artType.toLowerCase() === artType.toLowerCase());
  }

  if (category) {
    galleries = galleries.filter(g => g.category === category);
  }

  galleries.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy.includes('Date') || sortBy === 'createdAt') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (order === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    }
    return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
  });

  const total = galleries.length;
  const paginatedGalleries = galleries.slice(offset, offset + limit);

  res.status(200).json({
    data: paginatedGalleries,
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
 *     summary: Получить галерею по ID
 *     description: Возвращает информацию о конкретной галерее
 *     tags: [Galleries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID галереи
 *     responses:
 *       200:
 *         description: Информация о галерее
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gallery'
 *       404:
 *         description: Галерея не найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', (req, res, next) => {
  const gallery = storage.getGalleryById(req.params.id);
  
  if (!gallery) {
    return next(new NotFoundError(`Галерея с ID ${req.params.id} не найдена`));
  }
  
  res.status(200).json(gallery);
});

/**
 * @swagger
 * /api/v1/tournaments:
 *   post:
 *     summary: Создать новую галерею
 *     description: Создает новую галерею с указанными данными
 *     tags: [Galleries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGallery'
 *     responses:
 *       201:
 *         description: Галерея успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gallery'
 *       422:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validateBody(createTournamentSchema), (req, res) => {
  const gallery = storage.createGallery(req.body);
  res.status(201).json(gallery);
});

/**
 * @swagger
 * /api/v1/tournaments/{id}:
 *   put:
 *     summary: Полностью обновить галерею
 *     description: Полностью заменяет данные галереи
 *     tags: [Galleries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID галереи
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGallery'
 *     responses:
 *       200:
 *         description: Галерея успешно обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gallery'
 *       404:
 *         description: Галерея не найдена
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
  const gallery = storage.updateGallery(req.params.id, req.body);
  
  if (!gallery) {
    return next(new NotFoundError(`Галерея с ID ${req.params.id} не найдена`));
  }
  
  res.status(200).json(gallery);
});

/**
 * @swagger
 * /api/v1/tournaments/{id}:
 *   patch:
 *     summary: Частично обновить галерею
 *     description: Обновляет только указанные поля галереи
 *     tags: [Galleries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID галереи
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGallery'
 *     responses:
 *       200:
 *         description: Галерея успешно обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gallery'
 *       404:
 *         description: Галерея не найдена
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
  const gallery = storage.updateGallery(req.params.id, req.body);
  
  if (!gallery) {
    return next(new NotFoundError(`Галерея с ID ${req.params.id} не найдена`));
  }
  
  res.status(200).json(gallery);
});

/**
 * @swagger
 * /api/v1/tournaments/{id}:
 *   delete:
 *     summary: Удалить галерею
 *     description: Удаляет галерею по ID
 *     tags: [Galleries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID галереи
 *     responses:
 *       204:
 *         description: Галерея успешно удалена
 *       404:
 *         description: Галерея не найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', (req, res, next) => {
  const deleted = storage.deleteGallery(req.params.id);
  
  if (!deleted) {
    return next(new NotFoundError(`Галерея с ID ${req.params.id} не найдена`));
  }
  
  res.status(204).send();
});

/**
 * @swagger
 * /api/v1/tournaments/{id}/like:
 *   post:
 *     summary: Лайкнуть галерею
 *     description: Увеличивает количество лайков на 1
 *     tags: [Galleries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID галереи
 *     responses:
 *       200:
 *         description: Лайк успешно добавлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gallery'
 *       404:
 *         description: Галерея не найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/like', (req, res, next) => {
  const gallery = storage.getGalleryById(req.params.id);
  
  if (!gallery) {
    return next(new NotFoundError(`Галерея с ID ${req.params.id} не найдена`));
  }
  
  const updated = storage.updateGallery(req.params.id, { likes: gallery.likes + 1 });
  res.status(200).json(updated);
});

module.exports = router;