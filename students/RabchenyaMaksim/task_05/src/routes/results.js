const express = require('express');
const router = express.Router();
const { results, resultIdCounter, quizzes } = require('../data/storage');
const { submitResultSchema } = require('../schemas/resultSchema');
const AppError = require('../utils/AppError');

/**
 * @openapi
 * /api/v1/results:
 *   post:
 *     summary: Submit quiz answers and get score
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quizId: { type: string }
 *               userId: { type: string }
 *               answers: { type: array, items: { type: integer } }
 *     responses:
 *       201: { description: Result with score }
 */
router.post('/', (req, res, next) => {
  const parsed = submitResultSchema.safeParse(req.body);
  if (!parsed.success) return next(parsed.error);

  const quiz = quizzes.find(q => q.id === parsed.data.quizId);
  if (!quiz) return next(new AppError(404, 'Quiz not found'));

  if (parsed.data.answers.length !== quiz.questions.length) {
    return next(new AppError(400, 'Answers count mismatch'));
  }

  let correct = 0;
  parsed.data.answers.forEach((ans, i) => {
    if (ans === quiz.questions[i].correctIndex) correct++;
  });

  const score = (correct / quiz.questions.length) * 100;

  const newResult = {
    id: String(resultIdCounter++),
    ...parsed.data,
    score,
    correctAnswers: correct
  };
  results.push(newResult);
  res.status(201).json(newResult);
});

// GET results по quizId или userId (с пагинацией) — можно добавить

module.exports = router;