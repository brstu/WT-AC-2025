const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { projects, nextId } = require('../data');
let currentNextId = nextId; // копия, чтобы изменять
const { NotFoundError, ValidationError } = require('../errors');

// Схемы Zod
const createProjectSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500).optional(),
    link: z.string().url().optional(),
    cases: z.array(z.string()).optional(),
    completedAt: z.string().date().optional() // ISO date, например "2025-01-01"
});

const updateProjectSchema = createProjectSchema.partial(); // все поля опциональны для PATCH

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Получить список проектов
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Поиск по title/description
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *     responses:
 *       200:
 *         description: Список проектов
 */
router.get('/', (req, res) => {
    let result = projects;
    const { q, limit = 10, offset = 0 } = req.query;

    if (q) {
        const lowerQ = q.toLowerCase();
        result = result.filter(p =>
            p.title.toLowerCase().includes(lowerQ) ||
            (p.description && p.description.toLowerCase().includes(lowerQ))
        );
    }

    const paginated = result.slice(offset, +offset + +limit);
    res.status(200).json(paginated);
});

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Получить проект по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Проект
 *       404:
 *         description: Не найден
 */
router.get('/:id', (req, res, next) => {
    const project = projects.find(p => p.id === +req.params.id);
    if (!project) return next(new NotFoundError());
    res.status(200).json(project);
});

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Создать новый проект
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *               link:
 *                 type: string
 *                 format: uri
 *               cases:
 *                 type: array
 *                 items:
 *                   type: string
 *               completedAt:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Созданный проект
 */
router.post('/', (req, res, next) => {
    try {
        const data = createProjectSchema.parse(req.body);
        const newProject = { id: currentNextId++, ...data };
        projects.push(newProject);
        res.status(201).json(newProject);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return next(new ValidationError("Ошибка валидации", err.errors));
        }
        next(err);
    }
});

/**
 * @swagger
 * /projects/{id}:
 *   patch:
 *     summary: Частичное обновление проекта
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               link:
 *                 type: string
 *               cases:
 *                 type: array
 *                 items:
 *                   type: string
 *               completedAt:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Обновлённый проект
 *       404:
 *         description: Не найден
 */
router.patch('/:id', (req, res, next) => {
    const project = projects.find(p => p.id === +req.params.id);
    if (!project) return next(new NotFoundError());

    try {
        const data = updateProjectSchema.parse(req.body);
        Object.assign(project, data);
        res.status(200).json(project);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return next(new ValidationError("Ошибка валидации", err.errors));
        }
        next(err);
    }
});

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Удалить проект
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       204:
 *         description: Успешно удалено
 *       404:
 *         description: Не найден
 */
router.delete('/:id', (req, res, next) => {
    const index = projects.findIndex(p => p.id === +req.params.id);
    if (index === -1) return next(new NotFoundError());
    projects.splice(index, 1);
    res.status(204).send();
});

module.exports = router;