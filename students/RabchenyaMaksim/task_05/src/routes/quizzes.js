const express = require('express');
const router = express.Router();
const { quizzes, quizIdCounter } = require('../data/storage');
const { createQuizSchema, updateQuizSchema } = require('../schemas/quizSchema');
const AppError = require('../utils/AppError');

/**
 * @openapi
 * /api/v1/quizzes:
 *   get:
 *     summary: Get list of quizzes (with search and pagination)
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: List of quizzes with metadata
 */
router.get('/', (req, res) => {
  let filtered = quizzes;
  if (req.query.q) {
    const search = req.query.q.toLowerCase();
    filtered = quizzes.filter(q => q.title.toLowerCase().includes(search));
  }
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const paginated = filtered.slice(offset, offset + limit);

  res.json({
    data: paginated,
    meta: {
      total: filtered.length,
      limit,
      offset
    }
  });
});

/**
 * @openapi
 * /api/v1/quizzes/{id}:
 *   get:
 *     summary: Get quiz by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200: { description: Quiz object }
 *       404: { description: Not found }
 */
router.get('/:id', (req, res, next) => {
  const quiz = quizzes.find(q => q.id === req.params.id);
  if (!quiz) return next(new AppError(404, 'Quiz not found'));
  res.json(quiz);
});

// POST, PATCH, DELETE аналогично с валидацией
router.post('/', (req, res, next) => {
  const parsed = createQuizSchema.safeParse(req.body);
  if (!parsed.success) return next(parsed.error);

  const newQuiz = {
    id: String(quizIdCounter++),
    ...parsed.data
  };
  quizzes.push(newQuiz);
  res.status(201).json(newQuiz);
});

router.patch('/:id', (req, res, next) => {
  const parsed = updateQuizSchema.safeParse(req.body);
  if (!parsed.success) return next(parsed.error);

  const quiz = quizzes.find(q => q.id === req.params.id);
  if (!quiz) return next(new AppError(404, 'Quiz not found'));

  Object.assign(quiz, parsed.data);
  res.json(quiz);
});

router.delete('/:id', (req, res, next) => {
  const index = quizzes.findIndex(q => q.id === req.params.id);
  if (index === -1) return next(new AppError(404, 'Quiz not found'));
  quizzes.splice(index, 1);
  res.status(204).send();
});

module.exports = router;