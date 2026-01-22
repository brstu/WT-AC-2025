const express = require('express');
const router = express.Router();
const equipmentService = require('../services/equipmentService');
const { authenticate, authorize, checkOwnership } = require('../middleware/auth');
const { validateBody, validateQuery } = require('../middleware/validate');
const {
  createEquipmentSchema,
  updateEquipmentSchema,
  getEquipmentQuerySchema,
} = require('../validators/equipmentValidator');

/**
 * @swagger
 * components:
 *   schemas:
 *     Equipment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор
 *         name:
 *           type: string
 *           example: Dell Latitude 5520
 *         type:
 *           type: string
 *           enum: [COMPUTER, LAPTOP, MONITOR, PRINTER, SCANNER, NETWORK, PHONE, SERVER, STORAGE, OTHER]
 *           example: LAPTOP
 *         serialNumber:
 *           type: string
 *           example: DL-LAT-5520-001
 *         manufacturer:
 *           type: string
 *           example: Dell
 *         model:
 *           type: string
 *           example: Latitude 5520
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *           example: '2023-01-15T00:00:00Z'
 *         warrantyEnd:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: '2026-01-15T00:00:00Z'
 *         status:
 *           type: string
 *           enum: [AVAILABLE, IN_USE, MAINTENANCE, RETIRED, BROKEN]
 *           example: IN_USE
 *         location:
 *           type: string
 *           example: Офис 201
 *         notes:
 *           type: string
 *           nullable: true
 *           example: Рабочий ноутбук менеджера
 *         ownerId:
 *           type: string
 *         owner:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             email:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             role:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     CreateEquipment:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - serialNumber
 *         - manufacturer
 *         - model
 *         - purchaseDate
 *         - location
 *       properties:
 *         name:
 *           type: string
 *           example: Dell Latitude 5520
 *         type:
 *           type: string
 *           enum: [COMPUTER, LAPTOP, MONITOR, PRINTER, SCANNER, NETWORK, PHONE, SERVER, STORAGE, OTHER]
 *           example: LAPTOP
 *         serialNumber:
 *           type: string
 *           example: DL-LAT-5520-001
 *         manufacturer:
 *           type: string
 *           example: Dell
 *         model:
 *           type: string
 *           example: Latitude 5520
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *           example: '2023-01-15T00:00:00Z'
 *         warrantyEnd:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: '2026-01-15T00:00:00Z'
 *         status:
 *           type: string
 *           enum: [AVAILABLE, IN_USE, MAINTENANCE, RETIRED, BROKEN]
 *           default: AVAILABLE
 *           example: IN_USE
 *         location:
 *           type: string
 *           example: Офис 201
 *         notes:
 *           type: string
 *           nullable: true
 *           example: Рабочий ноутбук менеджера
 */

// Все маршруты требуют аутентификации
router.use(authenticate);

/**
 * @swagger
 * /api/v1/equipment:
 *   get:
 *     summary: Получить список оборудования
 *     description: Возвращает список оборудования. Обычные пользователи видят только свое оборудование, админы видят все.
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Поисковый запрос
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [COMPUTER, LAPTOP, MONITOR, PRINTER, SCANNER, NETWORK, PHONE, SERVER, STORAGE, OTHER]
 *         description: Фильтр по типу
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, IN_USE, MAINTENANCE, RETIRED, BROKEN]
 *         description: Фильтр по статусу
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Количество элементов на странице
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Смещение от начала
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, purchaseDate, createdAt]
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
 *         description: Список оборудования
 *       401:
 *         description: Не авторизован
 */
router.get('/', validateQuery(getEquipmentQuerySchema), async (req, res, next) => {
  try {
    const result = await equipmentService.getEquipment(req.query, req.user.id, req.user.role);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/equipment/{id}:
 *   get:
 *     summary: Получить оборудование по ID
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID оборудования
 *     responses:
 *       200:
 *         description: Информация об оборудовании
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен
 *       404:
 *         description: Оборудование не найдено
 */
router.get('/:id', async (req, res, next) => {
  try {
    const result = await equipmentService.getEquipmentById(req.params.id, req.user.id, req.user.role);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/equipment:
 *   post:
 *     summary: Создать новое оборудование
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEquipment'
 *     responses:
 *       201:
 *         description: Оборудование успешно создано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
 *       401:
 *         description: Не авторизован
 *       409:
 *         description: Оборудование с таким серийным номером уже существует
 *       422:
 *         description: Ошибка валидации
 */
router.post('/', validateBody(createEquipmentSchema), async (req, res, next) => {
  try {
    const result = await equipmentService.createEquipment(req.body, req.user.id);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/equipment/{id}:
 *   put:
 *     summary: Полностью обновить оборудование
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID оборудования
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEquipment'
 *     responses:
 *       200:
 *         description: Оборудование успешно обновлено
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен
 *       404:
 *         description: Оборудование не найдено
 *       422:
 *         description: Ошибка валидации
 */
router.put('/:id', validateBody(createEquipmentSchema), async (req, res, next) => {
  try {
    const result = await equipmentService.updateEquipment(req.params.id, req.body, req.user.id, req.user.role);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/equipment/{id}:
 *   patch:
 *     summary: Частично обновить оборудование
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID оборудования
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEquipment'
 *     responses:
 *       200:
 *         description: Оборудование успешно обновлено
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен
 *       404:
 *         description: Оборудование не найдено
 *       422:
 *         description: Ошибка валидации
 */
router.patch('/:id', validateBody(updateEquipmentSchema), async (req, res, next) => {
  try {
    const result = await equipmentService.updateEquipment(req.params.id, req.body, req.user.id, req.user.role);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/equipment/{id}:
 *   delete:
 *     summary: Удалить оборудование
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID оборудования
 *     responses:
 *       204:
 *         description: Оборудование успешно удалено
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен
 *       404:
 *         description: Оборудование не найдено
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await equipmentService.deleteEquipment(req.params.id, req.user.id, req.user.role);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
