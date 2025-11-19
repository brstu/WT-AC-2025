const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');
const { validateNoteCreate, validateNoteUpdate } = require('../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: API для управления заметками
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID заметки
 *         title:
 *           type: string
 *           description: Заголовок заметки
 *           minLength: 1
 *           maxLength: 100
 *         content:
 *           type: string
 *           description: Содержание заметки
 *           minLength: 1
 *           maxLength: 1000
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Метки заметки
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Дата выполнения
 *         isArchived:
 *           type: boolean
 *           description: В архиве ли заметка
 *         isDone:
 *           type: boolean
 *           description: Выполнена ли заметка
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата создания
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Дата обновления
 *       example:
 *         id: 1
 *         title: "Моя заметка"
 *         content: "Содержание заметки"
 *         tags: ["важное", "работа"]
 *         isArchived: false
 *         isDone: false
 *         createdAt: "2024-01-01T10:30:00.000Z"
 *         updatedAt: "2024-01-01T10:30:00.000Z"
 */

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Получить все заметки
 *     tags: [Notes]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Поиск по заголовку и содержанию
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Фильтр по меткам
 *       - in: query
 *         name: isArchived
 *         schema:
 *           type: boolean
 *         description: Фильтр по архивному статусу
 *       - in: query
 *         name: isDone
 *         schema:
 *           type: boolean
 *         description: Фильтр по статусу выполнения
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Лимит записей на странице
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Смещение (сколько записей пропустить)
 *     responses:
 *       200:
 *         description: Список заметок получен успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 */
router.get('/', notesController.getAllNotes);

/**
 * @swagger
 * /notes/{id}:
 *   get:
 *     summary: Получить заметку по ID
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID заметки
 *     responses:
 *       200:
 *         description: Заметка найдена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       404:
 *         description: Заметка не найдена
 */
router.get('/:id', notesController.getNoteById);

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Создать новую заметку
 *     tags: [Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Заметка создана успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       400:
 *         description: Ошибка валидации
 */
router.post('/', validateNoteCreate, notesController.createNote);

/**
 * @swagger
 * /notes/{id}:
 *   put:
 *     summary: Обновить заметку
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID заметки
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               isArchived:
 *                 type: boolean
 *               isDone:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Заметка обновлена успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       404:
 *         description: Заметка не найдена
 */
router.put('/:id', validateNoteUpdate, notesController.updateNote);

/**
 * @swagger
 * /notes/{id}:
 *   delete:
 *     summary: Удалить заметку
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID заметки
 *     responses:
 *       204:
 *         description: Заметка удалена успешно
 *       404:
 *         description: Заметка не найдена
 */
router.delete('/:id', notesController.deleteNote);

/**
 * @swagger
 * /notes/{id}/archive:
 *   patch:
 *     summary: Архивировать заметку
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID заметки
 *     responses:
 *       200:
 *         description: Заметка архивирована успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       404:
 *         description: Заметка не найдена
 */
router.patch('/:id/archive', notesController.archiveNote);

/**
 * @swagger
 * /notes/{id}/unarchive:
 *   patch:
 *     summary: Разархивировать заметку
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID заметки
 *     responses:
 *       200:
 *         description: Заметка разархивирована успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       404:
 *         description: Заметка не найдена
 */
router.patch('/:id/unarchive', notesController.unarchiveNote);

module.exports = router;