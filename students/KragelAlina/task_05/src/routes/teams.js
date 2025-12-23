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
 *     Art:
 *       type: object
 *       required:
 *         - name
 *         - style
 *         - origin
 *         - artType
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор арта
 *           example: a1705312800000
 *         name:
 *           type: string
 *           description: Название арта (1-100 символов)
 *           example: Starry Night Remix
 *         style:
 *           type: string
 *           description: Стиль (тег) арта (2-10 символов, только буквы и цифры)
 *           example: VNCT
 *         origin:
 *           type: string
 *           description: Происхождение (страна) арта
 *           example: Netherlands
 *         artType:
 *           type: string
 *           description: Тип арта
 *           example: Painting
 *         createdYear:
 *           type: string
 *           format: date
 *           description: Год создания арта
 *           example: '2024-05-20'
 *         imageUrl:
 *           type: string
 *           format: uri
 *           description: URL изображения арта
 *           example: https://example.com/starry-night.png
 *         likes:
 *           type: integer
 *           minimum: 0
 *           maximum: 1000000
 *           description: Количество лайков
 *           example: 5420
 *         isFeatured:
 *           type: boolean
 *           description: Избранный ли арт
 *           example: true
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: Описание арта
 *           example: Современная интерпретация картины Ван Гога
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата создания записи
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Дата последнего обновления
 *     
 *     CreateArt:
 *       type: object
 *       required:
 *         - name
 *         - style
 *         - origin
 *         - artType
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: Starry Night Remix
 *         style:
 *           type: string
 *           minLength: 2
 *           maxLength: 10
 *           pattern: '^[A-Za-z0-9]+$'
 *           example: VNCT
 *         origin:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Netherlands
 *         artType:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           example: Painting
 *         createdYear:
 *           type: string
 *           format: date
 *           example: '2024-05-20'
 *         imageUrl:
 *           type: string
 *           format: uri
 *           example: https://example.com/starry-night.png
 *         likes:
 *           type: integer
 *           minimum: 0
 *           maximum: 1000000
 *           default: 0
 *           example: 5420
 *         isFeatured:
 *           type: boolean
 *           default: true
 *           example: true
 *         description:
 *           type: string
 *           maxLength: 1000
 *           example: Современная интерпретация картины Ван Гога
 *     
 *     UpdateArt:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         style:
 *           type: string
 *           minLength: 2
 *           maxLength: 10
 *           pattern: '^[A-Za-z0-9]+$'
 *         origin:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         artType:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *         createdYear:
 *           type: string
 *           format: date
 *         imageUrl:
 *           type: string
 *           format: uri
 *         likes:
 *           type: integer
 *           minimum: 0
 *           maximum: 1000000
 *         isFeatured:
 *           type: boolean
 *         description:
 *           type: string
 *           maxLength: 1000
 *     
 *     PaginatedArts:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Art'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: Общее количество артов
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
 *     summary: Получить список артов
 *     description: Возвращает список артов с поддержкой поиска, фильтрации, сортировки и пагинации
 *     tags: [Arts]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Поиск по названию, стилю и описанию
 *       - in: query
 *         name: artType
 *         schema:
 *           type: string
 *         description: Фильтр по типу арта
 *       - in: query
 *         name: origin
 *         schema:
 *           type: string
 *         description: Фильтр по происхождению (стране)
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Фильтр по избранным артам
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
 *           enum: [name, likes, createdYear, createdAt]
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
 *         description: Список артов
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedArts'
 *       422:
 *         description: Ошибка валидации параметров
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', validateQuery(getTeamsQuerySchema), (req, res) => {
  let arts = storage.getArts();
  const { q, artType, origin, isFeatured, limit, offset, sortBy, order } = req.query;

  if (q) {
    const searchLower = q.toLowerCase();
    arts = arts.filter(a => 
      a.name.toLowerCase().includes(searchLower) ||
      a.style.toLowerCase().includes(searchLower) ||
      (a.description && a.description.toLowerCase().includes(searchLower))
    );
  }

  if (artType) {
    arts = arts.filter(a => a.artType.toLowerCase() === artType.toLowerCase());
  }

  if (origin) {
    arts = arts.filter(a => a.origin.toLowerCase() === origin.toLowerCase());
  }

  if (typeof isFeatured !== 'undefined') {
    arts = arts.filter(a => a.isFeatured === isFeatured);
  }

  arts.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === 'createdYear' || sortBy === 'createdAt') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
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

  const total = arts.length;
  const paginatedArts = arts.slice(offset, offset + limit);

  res.status(200).json({
    data: paginatedArts,
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
 *     summary: Получить арт по ID
 *     description: Возвращает информацию о конкретном арте
 *     tags: [Arts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID арта
 *     responses:
 *       200:
 *         description: Информация об арте
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Art'
 *       404:
 *         description: Арт не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', (req, res, next) => {
  const art = storage.getArtById(req.params.id);
  
  if (!art) {
    return next(new NotFoundError(`Арт с ID ${req.params.id} не найден`));
  }
  
  res.status(200).json(art);
});

/**
 * @swagger
 * /api/v1/teams:
 *   post:
 *     summary: Создать новый арт
 *     description: Создает новый арт с указанными данными
 *     tags: [Arts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateArt'
 *     responses:
 *       201:
 *         description: Арт успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Art'
 *       422:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validateBody(createTeamSchema), (req, res) => {
  const art = storage.createArt(req.body);
  res.status(201).json(art);
});

/**
 * @swagger
 * /api/v1/teams/{id}:
 *   put:
 *     summary: Полностью обновить арт
 *     description: Полностью заменяет данные арта
 *     tags: [Arts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID арта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateArt'
 *     responses:
 *       200:
 *         description: Арт успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Art'
 *       404:
 *         description: Арт не найден
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
  const art = storage.updateArt(req.params.id, req.body);
  
  if (!art) {
    return next(new NotFoundError(`Арт с ID ${req.params.id} не найден`));
  }
  
  res.status(200).json(art);
});

/**
 * @swagger
 * /api/v1/teams/{id}:
 *   patch:
 *     summary: Частично обновить арт
 *     description: Обновляет только указанные поля арта
 *     tags: [Arts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID арта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateArt'
 *     responses:
 *       200:
 *         description: Арт успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Art'
 *       404:
 *         description: Арт не найден
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
  const art = storage.updateArt(req.params.id, req.body);
  
  if (!art) {
    return next(new NotFoundError(`Арт с ID ${req.params.id} не найден`));
  }
  
  res.status(200).json(art);
});

/**
 * @swagger
 * /api/v1/teams/{id}:
 *   delete:
 *     summary: Удалить арт
 *     description: Удаляет арт по ID
 *     tags: [Arts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID арта
 *     responses:
 *       204:
 *         description: Арт успешно удален
 *       404:
 *         description: Арт не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', (req, res, next) => {
  const deleted = storage.deleteArt(req.params.id);
  
  if (!deleted) {
    return next(new NotFoundError(`Арт с ID ${req.params.id} не найден`));
  }
  
  res.status(204).send();
});

/**
 * @swagger
 * /api/v1/teams/{id}/like:
 *   post:
 *     summary: Лайкнуть арт
 *     description: Увеличивает количество лайков на 1
 *     tags: [Arts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID арта
 *     responses:
 *       200:
 *         description: Лайк успешно добавлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Art'
 *       404:
 *         description: Арт не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/like', (req, res, next) => {
  const art = storage.getArtById(req.params.id);
  
  if (!art) {
    return next(new NotFoundError(`Арт с ID ${req.params.id} не найден`));
  }
  
  const updated = storage.updateArt(req.params.id, { likes: art.likes + 1 });
  res.status(200).json(updated);
});

module.exports = router;