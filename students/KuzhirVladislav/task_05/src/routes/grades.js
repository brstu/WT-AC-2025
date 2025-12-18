const express = require('express');
const {
  getGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
} = require('../controllers/grades');
const validate = require('../middlewares/validate');
const { gradeCreateSchema, gradeUpdateSchema, querySchema } = require('../schemas/grade');

const router = express.Router();

/**
 * @swagger
 * /grades:
 *   get:
 *     tags:
 *       - Grades
 *     summary: Retrieve a list of grades
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: A list of grades
 */
router.get('/', validate(querySchema, 'query'), getGrades);

/**
 * @swagger
 * /grades/{id}:
 *   get:
 *     tags:
 *       - Grades
 *     summary: Get a grade by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: The grade
 *       404:
 *         description: Grade not found
 */
router.get('/:id', getGradeById);

/**
 * @swagger
 * /grades:
 *   post:
 *     tags:
 *       - Grades
 *     summary: Create a new grade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *               taskId:
 *                 type: string
 *               value:
 *                 type: number
 *     responses:
 *       201:
 *         description: Grade created
 */
router.post('/', validate(gradeCreateSchema, 'body'), createGrade);

/**
 * @swagger
 * /grades/{id}:
 *   patch:
 *     tags:
 *       - Grades
 *     summary: Update a grade
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Grade updated
 */
router.patch('/:id', validate(gradeUpdateSchema, 'body'), updateGrade);

/**
 * @swagger
 * /grades/{id}:
 *   delete:
 *     tags:
 *       - Grades
 *     summary: Delete a grade
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       204:
 *         description: Grade deleted
 */
router.delete('/:id', deleteGrade);

module.exports = router;
